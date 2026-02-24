import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 1,
  name: 'Nicolas',
  email: 'nicolas@email.com',
  password: 'hashed_password',
  addresses: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('listUserByEmail', () => {
    it('deve retornar o usuário quando o e-mail existe', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.listUserByEmail('nicolas@email.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nicolas@email.com' },
        relations: ['addresses'],
      });
    });

    it('deve lançar NotFoundException quando o e-mail não existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.listUserByEmail('inexistente@email.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserById', () => {
    it('deve retornar o usuário quando o ID existe', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserById(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['addresses'],
      });
    });

    it('deve lançar NotFoundException quando o ID não existe', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
