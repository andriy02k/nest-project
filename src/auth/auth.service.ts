import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);

    await this.usersRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = this.jwtService.verify(refreshToken);
    const user = await this.usersRepository.findOne({
      where: { id: decoded.sub },
    });

    if (!user || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  private generateAccessToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }
}
