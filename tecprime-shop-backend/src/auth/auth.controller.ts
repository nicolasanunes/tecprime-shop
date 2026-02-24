import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard, Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { MeResponseDto } from './dtos/me-response.dto';
import { RefreshTokenResponseDto } from './dtos/refresh-token-response.dto';

@Controller('auth')
@SkipThrottle() // por padrão pula throttle; aplicamos apenas no login
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // máx 5 tentativas de login por minuto por IP
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto, response);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshTokenResponseDto> {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }
    return this.authService.refreshToken(refreshToken, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response): string {
    return this.authService.logout(response);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() request: Request & { user: MeResponseDto }): MeResponseDto {
    return request.user;
  }
}
