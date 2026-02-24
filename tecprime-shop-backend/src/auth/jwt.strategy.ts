import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { LoginPayloadDto } from './dtos/list-login.dto';
import { MeResponseDto } from './dtos/me-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: LoginPayloadDto): Promise<MeResponseDto> {
    try {
      if (!payload?.id || !payload?.email) {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.usersService.findUserById(payload.id);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        addresses: user.addresses ?? [],
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Falha na autenticação');
    }
  }
}
