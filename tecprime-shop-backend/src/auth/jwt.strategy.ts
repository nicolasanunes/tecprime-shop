import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { LoginPayloadDto } from './dtos/list-login.dto';
import { MeResponseDto } from './dtos/me-response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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

  validate(payload: LoginPayloadDto): MeResponseDto {
    if (!payload?.id || !payload?.email) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      addresses: [],
    };
  }
}
