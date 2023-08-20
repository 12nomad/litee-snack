import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Verification } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Response } from 'express';
import { generate } from 'randomstring';

import { MutationOutput } from '../common/entities/mutation-output.entity';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { EmailVerificationDto } from './dtos/email-verification.dto';
import { LoginDto } from './dtos/login.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import { SignupDto } from './dtos/signup.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { VerifyResetDto } from './dtos/verify-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  // 👉 Utils
  async jwtSign(id: number, role: `${Role}`) {
    const [access_token, refresh_token, subscription_token] = await Promise.all(
      [
        await this.jwtService.signAsync(
          { sub: id, role },
          {
            expiresIn: this.configService.get<string>('ACCESS_TOKEN_TTL'),
            secret: this.configService.get<string>('JWT_PRIVATE'),
          },
        ),
        await this.jwtService.signAsync(
          { sub: id, role },
          {
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_TTL'),
            secret: this.configService.get<string>('JWT_PRIVATE'),
          },
        ),
        await this.jwtService.signAsync(
          { sub: id, role },
          {
            expiresIn: this.configService.get<string>('SUBSCRIPTION_TOKEN_TTL'),
            secret: this.configService.get<string>('JWT_PRIVATE'),
          },
        ),
      ],
    );
    return { access_token, refresh_token, subscription_token };
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const hashed = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: { id },
      data: { hashedRt: hashed },
    });
  }

  setCookies(res: Response, at: string, rt: string, st: string) {
    res.cookie('__litee_snack_access_token', at, {
      httpOnly: true,
      secure: true,
    });
    res.cookie('__litee_snack_refresh_token', rt, {
      httpOnly: true,
      secure: true,
    });
    res.cookie('__litee_snack_subscription_token', st, {
      httpOnly: true,
      secure: true,
    });
  }

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
          <h3>Litee Snack!</h3>
          <p>Please use the provided code to complete your account verification: 👉 <strong>${code}</strong> 👈</p>
        </div>
      `,
    });
  }

  // FIXME: change url on deploy
  async sendResetEmail(subject: string, code: string, to: string) {
    await this.mailerService.sendMail({
      to,
      from: {
        name: 'Litee App.',
        address: this.configService.get<string>('GMAIL_APP_USER') || '',
      },
      subject,
      html: `
        <div>
          <h3>Litee Snack.</h3>
          <p>Please use the provided code to reset your password: 👉 <strong>${code}</strong> 👈</p>
        </div>
      `,
    });
  }

  clearCookies(res: Response) {
    res.clearCookie('__litee_snack_access_token');
    res.clearCookie('__litee_snack_refresh_token');
    res.clearCookie('__litee_snack_subscription_token');
  }

  // 👉 Auth
  async signup({
    email,
    password,
    role,
    name,
  }: SignupDto): Promise<MutationOutput> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      throw new BadRequestException('E-mail is already used...');
    }

    const hashed = await argon.hash(password);
    const createdUser = await this.prisma.user.create({
      data: { email, password: hashed, role, verified: false, name },
    });

    const verification = await this.prisma.verification.create({
      data: {
        code: generate({ length: 10 }),
        userId: createdUser.id,
      },
    });

    await this.sendVerificationEmail(
      'Account Verification',
      verification.code!,
      createdUser.email,
    );
    return { success: true };
  }

  async passwordReset({ email }: PasswordResetDto): Promise<MutationOutput> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { verification: true },
    });
    if (!user) {
      throw new BadRequestException(
        'There is no account associated with that e-mail, please create an account before continuing...',
      );
    }

    let verification: Verification | null = null;
    if (user.verification) {
      verification = await this.prisma.verification.update({
        where: { userId: user.id },
        data: {
          reset: generate({ length: 10 }),
        },
      });
    } else {
      verification = await this.prisma.verification.create({
        data: {
          userId: user.id,
          reset: generate({ length: 10 }),
        },
      });
    }

    await this.sendResetEmail(
      'Password Reset',
      verification?.reset ? verification.reset : '',
      user.email,
    );
    return { success: true };
  }

  async verifyReset({ reset, email }: VerifyResetDto): Promise<MutationOutput> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { verification: true },
    });
    if (user?.verification?.reset !== reset) {
      throw new BadRequestException('The verification code does not match...');
    }

    if (user.verification) {
      await this.prisma.verification.update({
        where: { userId: user.id },
        data: {
          reset: '',
        },
      });
    } else {
      await this.prisma.verification.delete({
        where: {
          userId: user.id,
        },
      });
    }

    return { success: true };
  }

  async updatePassword({
    password,
    email,
  }: UpdatePasswordDto): Promise<MutationOutput> {
    const hashed = await argon.hash(password);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashed,
      },
    });

    return { success: true };
  }

  async login(
    { email, password }: LoginDto,
    res: Response,
  ): Promise<MutationOutput> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, password: true },
    });
    if (!user) {
      throw new BadRequestException(
        'There is no account associated with that e-mail, please create an account before continuing...',
      );
    }

    const isMatch = await argon.verify(user.password, password);
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials...');
    }

    const tokens = await this.jwtSign(user.id, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    this.setCookies(
      res,
      tokens.access_token,
      tokens.refresh_token,
      tokens.subscription_token,
    );

    return { success: true };
  }

  async logout(sub: number, res: Response): Promise<MutationOutput> {
    try {
      await this.prisma.user.updateMany({
        where: {
          AND: [{ id: sub }, { hashedRt: { not: null } }],
        },
        data: { hashedRt: null },
      });
      this.clearCookies(res);
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async refreshToken(
    sub: number,
    refresh_token: string,
    res: Response,
  ): Promise<MutationOutput> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: sub } });
      if (!user || !user.hashedRt) {
        this.clearCookies(res);
        throw new UnauthorizedException();
      }

      const isMatch = await argon.verify(user.hashedRt, refresh_token);
      if (!isMatch) {
        this.clearCookies(res);
        throw new UnauthorizedException();
      }

      const tokens = await this.jwtSign(user.id, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      this.setCookies(
        res,
        tokens.access_token,
        tokens.refresh_token,
        tokens.subscription_token,
      );

      return { success: true };
    } catch (error) {
      this.clearCookies(res);
      throw new UnauthorizedException();
    }
  }

  async emailVerification({
    code,
  }: EmailVerificationDto): Promise<MutationOutput> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        code,
      },
    });
    if (!verification) {
      throw new BadRequestException(
        'Please enter a correct verification code...',
      );
    }

    await this.prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        verified: true,
      },
    });

    await this.prisma.verification.delete({
      where: { id: verification.id },
    });

    return { success: true };
  }
}
