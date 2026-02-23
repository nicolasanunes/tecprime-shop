import { Response } from 'express';

export const setAccessTokenCookie = (
  response: Response,
  token: string,
): void => {
  response.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutos
  });
};

export const setRefreshTokenCookie = (
  response: Response,
  token: string,
): void => {
  response.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
};
