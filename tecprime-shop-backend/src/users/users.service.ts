import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listUserByEmail(email: string): Promise<User> {
    this.logger.debug(`Buscando usuário por e-mail: ${email}`);

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['addresses'],
    });

    if (!user) {
      this.logger.warn(`Usuário não encontrado: email=${email}`);
      throw new NotFoundException(`Não existe usuário com o e-mail ${email}`);
    }

    return user;
  }

  async findUserById(id: number): Promise<User> {
    this.logger.debug(`Buscando usuário por ID: ${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      this.logger.warn(`Usuário não encontrado: id=${id}`);
      throw new NotFoundException(`Não existe usuário com o ID ${id}`);
    }

    return user;
  }
}
