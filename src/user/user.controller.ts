import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { User, Prisma } from '../generated/prisma/client.js';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<User[]> {
    try {
      return await this.userService.users({
        skip: skip ? parseInt(skip) : undefined,
        take: take ? parseInt(take) : undefined,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.userService.user({
        id: parseInt(id),
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createUser(@Body() data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.userService.createUser(data);
    } catch (error) {
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.userService.updateUser({
        where: { id: parseInt(id) },
        data,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    try {
      return await this.userService.deleteUser({
        id: parseInt(id),
      });
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
