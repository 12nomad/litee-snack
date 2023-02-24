import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EditUserProfileDto } from './dtos/edit-user-profile.dto';
import * as argon from 'argon2';
import { generate } from 'randomstring';
import { UserQueryOutput } from './entities/user-query-output.entity';
import { UserMutationOutput } from './entities/user-mutation-output.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { GetUserByIdDto } from './dtos/get-user-by-id.dto';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  // 👉 Utils
  async sendVerificationEmail(subject: string, code: string, to: string) {
    await this.mailerService.sendMail({
      to,
      from: {
        name: 'Litee App.',
        address: this.configService.get<string>('GMAIL_APP_USER') || '',
      },
      subject,
      html: `
        <div>
          <h3>Welcome to Litee Snack!</h3>
          <p>Please use the provided code to complete your account verification: 👉 <strong>${code}</strong> 👈</p>
        </div>
      `,
    });
  }

  // 👉 User
  async getAuthUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return { ...user, password: '' };
  }

  async getUserById(
    getUserByIdInput: GetUserByIdDto,
  ): Promise<UserQueryOutput> {
    const user = await this.prisma.user.findUnique({
      where: { id: getUserByIdInput.id },
    });
    if (!user) throw new NotFoundException('User not found...');
    return { success: true, data: { ...user, password: '' } };
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

  async editUserProfile(
    id: number,
    { email, password }: EditUserProfileDto,
  ): Promise<UserMutationOutput> {
    try {
      let hash = '';
      if (password) hash = await argon.hash(password);
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data:
          password === undefined
            ? { email, verified: false }
            : { email, password: hash, verified: false },
      });
      const verification = await this.prisma.verification.create({
        data: {
          code: generate({ length: 10 }),
          userId: updatedUser.id,
        },
      });
      await this.sendVerificationEmail(
        'Account Verification',
        verification.code,
        updatedUser.email,
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again later...',
      );
    }
  }
}
