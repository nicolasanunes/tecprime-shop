import { IsString } from '@nestjs/class-validator';

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
