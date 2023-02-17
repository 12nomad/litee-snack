import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EditUserProfileDto } from './dtos/edit-user-profile.dto';
import * as argon from 'argon2';
// FIXME:
// import { generate } from 'randomstring';
import { UserQueryOutput } from './entities/user-query-output.entity';
import { UserMutationOutput } from './entities/user-mutation-output.entity';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getAuthUser(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getUserById(id: number): Promise<UserQueryOutput> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found...');
    return { success: true, data: user };
  }

  async editUserProfile(
    id: number,
    { email, password }: EditUserProfileDto,
  ): Promise<UserMutationOutput> {
    try {
      let hash = '';
      if (password) hash = await argon.hash(password);
      await this.prisma.user.update({
        where: { id },
        data: password !== undefined ? { email } : { email, password: hash },
      });
      // FIXME:
      // await this.prisma.verification.create({
      //   data: {
      //     code: generate({ length: 10 }),
      //     userId: updatedUser.id,
      //   },
      // });
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again later...',
      );
    }
  }

  async deleteUserAccount(id: number): Promise<UserMutationOutput> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again later...',
      );
    }
  }
}
