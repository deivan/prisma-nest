import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '../../prisma/generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    let user;
    try {
      user = await this.prisma.user.create({ data });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Rethrow the error after logging
    }
    return user;
  }

  async login(
    loginDto: { email: string; password: string },
    request: Request
  ): Promise<User | null> {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      (request.session as any).user = user;
    }
    return null; // Або можна кинути помилку, якщо аутентифікація не вдалася
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
