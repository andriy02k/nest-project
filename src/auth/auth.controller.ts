import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { parseDuration } from 'src/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const accessMaxAge = parseDuration(
      this.configService.get<string>('JWT_ACCESS_EXPIRES'),
    );
    const refreshMaxAge = parseDuration(
      this.configService.get<string>('JWT_REFRESH_EXPIRES'),
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: refreshMaxAge,
    });
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserDto> {
    const { accessToken, refreshToken, user } =
      await this.authService.register(registerDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return { user };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserDto> {
    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return { user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refresh = req.cookies?.refreshToken;
    if (!refresh) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const response = await this.authService.refreshToken(refresh);

    const { accessToken, refreshToken } = response;

    this.setAuthCookies(res, accessToken, refreshToken);
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
    });
  }
}
