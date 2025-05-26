export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export class AuthUserDto {
  user: {
    id: string;
    username: string;
    email: string;
  };
}
