import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { generate } from 'randomstring';
import { EmailVerificationDto } from './dtos/email-verification.dto';
import { AuthMutationOutput } from './entities/auth-mutation-output.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  // 👉 Utils
  async jwtSign(id: number) {
    const [access_token, refresh_token] = await Promise.all([
      await this.jwtService.signAsync(
        { sub: id },
        {
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_TTL'),
          secret: this.configService.get<string>('JWT_PRIVATE'),
        },
      ),
      await this.jwtService.signAsync(
        { sub: id },
        {
          expiresIn: this.configService.get<string>('REFRESH_TOKEN_TTL'),
          secret: this.configService.get<string>('JWT_PRIVATE'),
        },
      ),
    ]);
    return { access_token, refresh_token };
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const hashed = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: { id },
      data: { hashedRt: hashed },
    });
  }

  setCookies(res: Response, at: string, rt: string) {
    res.cookie('access_token', at, {
      httpOnly: true,
      secure: true,
      // FIXME: change on deploy
      domain: 'localhost',
    });
    res.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: true,
      // FIXME: change on deploy
      domain: 'localhost',
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
          <h3>Welcome to Litee Snack!</h3>
          <p>Please use the provided code to complete your account verification: 👉 <strong>${code}</strong> 👈</p>
        </div>
      `,
    });
  }

  clearCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  // 👉 Auth
  async signup({
    email,
    password,
    role,
  }: SignupDto): Promise<AuthMutationOutput> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      throw new BadRequestException('E-mail is already used...');
    }

    const hashed = await argon.hash(password);
    const createdUser = await this.prisma.user.create({
      data: { email, password: hashed, role, verified: false },
    });
    const verification = await this.prisma.verification.create({
      data: {
        code: generate({ length: 10 }),
        userId: createdUser.id,
      },
    });
    await this.sendVerificationEmail(
      'Account Verification',
      verification.code,
      createdUser.email,
    );
    return { success: true };
  }

  async login(
    { email, password }: LoginDto,
    res: Response,
  ): Promise<AuthMutationOutput> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException(
        'There is no account associated with that e-mail, please create an account before continuing...',
      );
    }

    const isMatch = await argon.verify(user.password, password);
    if (!isMatch) {
      throw new ForbiddenException('E-mail or password does not match...');
    }

    const tokens = await this.jwtSign(user.id);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    this.setCookies(res, tokens.access_token, tokens.refresh_token);

    return { success: true };
  }

  async logout(sub: number, res: Response): Promise<AuthMutationOutput> {
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
  ): Promise<AuthMutationOutput> {
    const user = await this.prisma.user.findUnique({ where: { id: sub } });
    if (!user || !user.hashedRt) {
      throw new ForbiddenException();
    }

    const isMatch = await argon.verify(user.hashedRt, refresh_token);
    if (!isMatch) {
      throw new ForbiddenException();
    }

    const tokens = await this.jwtSign(user.id);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    this.setCookies(res, tokens.access_token, tokens.refresh_token);

    return { success: true };
  }

  async emailVerification({
    code,
  }: EmailVerificationDto): Promise<AuthMutationOutput> {
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
