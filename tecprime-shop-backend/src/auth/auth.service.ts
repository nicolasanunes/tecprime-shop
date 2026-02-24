import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { LoginPayloadDto } from './dtos/list-login.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { validatePassword } from '../utils/password';
import { setAccessTokenCookie, setRefreshTokenCookie } from '../utils/cookies';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshTokenResponseDto } from './dtos/refresh-token-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
    response: Response,
  ): Promise<LoginResponseDto> {
    this.logger.log(`Tentativa de login: ${loginDto.email}`);

    const user: User | undefined = await this.usersService
      .listUserByEmail(loginDto.email)
      .catch(() => undefined);

    const isPasswordValid = await validatePassword(
      loginDto.password,
      user?.password || '',
    );

    if (!user || !isPasswordValid) {
      this.logger.warn(`Login falhou para: ${loginDto.email}`);
      throw new UnauthorizedException('E-mail e/ou senha inválidos!');
    }

    const payload: LoginPayloadDto = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    setAccessTokenCookie(response, accessToken);
    setRefreshTokenCookie(response, refreshToken);

    this.logger.log(`Login bem-sucedido: userId=${user.id} email=${user.email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        addresses: user.addresses ?? [],
      },
    };
  }

  async refreshToken(
    refreshTokenValue: string,
    response: Response,
  ): Promise<RefreshTokenResponseDto> {
    try {
      const payload = this.jwtService.verify<LoginPayloadDto>(refreshTokenValue);

      const user: User = await this.usersService.findUserById(payload.id);

      const newPayload: LoginPayloadDto = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      setAccessTokenCookie(response, newAccessToken);

      this.logger.log(`Token renovado: userId=${user.id} email=${user.email}`);

      return { message: 'Token atualizado com sucesso' };
    } catch {
      this.logger.warn('Tentativa de refresh com token inválido ou expirado');
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  logout(response: Response): string {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    this.logger.log('Logout realizado');
    return 'Logout realizado com sucesso';
  }
}
 
