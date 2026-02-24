import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as passwordUtils from '../utils/password';
import * as cookiesUtils from '../utils/cookies';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';

const mockUser: User = {
  id: 1,
  name: 'Nicolas',
  email: 'nicolas@email.com',
  password: 'hashed_password',
  addresses: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            listUserByEmail: jest.fn(),
            findUserById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jest
      .spyOn(cookiesUtils, 'setAccessTokenCookie')
      .mockImplementation(() => undefined);
    jest
      .spyOn(cookiesUtils, 'setRefreshTokenCookie')
      .mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('login', () => {
    it('deve retornar dados do usuário quando credenciais são válidas', async () => {
      usersService.listUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, 'validatePassword').mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      const result = await service.login(
        { email: mockUser.email, password: 'senha123' },
        mockResponse,
      );

      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.name).toBe(mockUser.name);
      expect(cookiesUtils.setAccessTokenCookie).toHaveBeenCalledWith(
        mockResponse,
        'access_token',
      );
      expect(cookiesUtils.setRefreshTokenCookie).toHaveBeenCalledWith(
        mockResponse,
        'refresh_token',
      );
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      usersService.listUserByEmail.mockRejectedValue(new Error('not found'));
      jest.spyOn(passwordUtils, 'validatePassword').mockResolvedValue(false);

      await expect(
        service.login(
          { email: 'inexistente@email.com', password: '123' },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando senha é inválida', async () => {
      usersService.listUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(passwordUtils, 'validatePassword').mockResolvedValue(false);

      await expect(
        service.login(
          { email: mockUser.email, password: 'senha_errada' },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('deve renovar o access token com refresh token válido', async () => {
      const payload = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };
      jwtService.verify.mockReturnValue(payload);
      usersService.findUserById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new_access_token');

      const result = await service.refreshToken(
        'valid_refresh_token',
        mockResponse,
      );

      expect(result.message).toBe('Token atualizado com sucesso');
      expect(cookiesUtils.setAccessTokenCookie).toHaveBeenCalledWith(
        mockResponse,
        'new_access_token',
      );
    });

    it('deve lançar UnauthorizedException quando refresh token é inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        service.refreshToken('invalid_token', mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deve limpar os cookies e retornar mensagem de sucesso', () => {
      const result = service.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(result).toBe('Logout realizado com sucesso');
    });
  });
});
