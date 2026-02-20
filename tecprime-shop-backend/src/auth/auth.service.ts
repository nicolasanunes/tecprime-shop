import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { LoginPayloadDto } from './dtos/list-login.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { validatePassword } from 'src/utils/password';
import { ListAuthUserDto } from 'src/users/dtos/list-user.dto';
import { ListAddressDto } from 'src/addresses/dtos/list-address.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    loginDto: LoginDto,
    response: Response,
  ): Promise<{ user: ListAuthUserDto & { addresses: ListAddressDto[] } }> {
    const user: User | undefined = await this.usersService
      .listUserByEmail(loginDto.email)
      .catch(() => undefined);

    const isPasswordValid = await validatePassword(
      loginDto.password,
      user?.password || '',
    );

    if (!user || !isPasswordValid) {
      throw new NotFoundException('E-mail e/ou senha inválidos!');
    }

    const payload: LoginPayloadDto = {
      id: user.id,
      email: user.email, 
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Define o accessToken como HttpOnly
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    // Define o refreshToken como HttpOnly
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

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
  ): Promise<{ message: string }> {
    try {
      // Verifica e decodifica o refresh token
      const payload =
        this.jwtService.verify<LoginPayloadDto>(refreshTokenValue);

      // Valida se o usuário existe e está ativo
      const user: User = await this.usersService.findUserById(payload.id);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const newPayload: LoginPayloadDto = {
        id: user.id,
        email: user.email,
      };

      // Gera novo access token
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      // Atualiza apenas o access token
      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      return { message: 'Token atualizado com sucesso' };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  logout(response: Response): string {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return 'Logout realizado com sucesso';
  }
}
