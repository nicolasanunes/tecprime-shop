import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { ListAuthUserDto } from 'src/users/dtos/list-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: ListAuthUserDto }> {
    return this.authService.login(loginDto, response);
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }
    return this.authService.refreshToken(refreshToken, response);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): string {
    return this.authService.logout(response);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() request: any): ListAuthUserDto {
    return request.user;
  }
}
