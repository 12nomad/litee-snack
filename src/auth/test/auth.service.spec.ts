import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';
import { createResponse, MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { Role } from '../../common/enums/role.enum';

const MAILER_OPTIONS = 'MAILER_OPTIONS';

const mockUserData = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'test@test.com',
  password: '123456',
  verified: false,
  role: Role.CLIENT,
  hashedRt: null,
};

const mockVerificationData = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  code: 'code',
  user: mockUserData,
  userId: mockUserData.id,
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: DeepMockProxy<PrismaClient>;
  // let mailerService: typeof mockMailerService;
  let mailerService: MailerService;
  let res: MockResponse<Response>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        ConfigService,
        JwtService,
        MailerService,
        {
          provide: MAILER_OPTIONS,
          useValue: {
            transport: {
              service: 'gmail',
              host: 'smtp.gmail.com',
              secure: false,
              auth: {
                user: process.env.GMAIL_APP_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
              },
            },
          },
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    authService = module.get(AuthService);
    prismaService = module.get(PrismaService);
    mailerService = module.get(MailerService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    res = createResponse();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // TESTS🧪
  describe('signup', () => {
    const mockSignupArgs = {
      email: mockUserData.email,
      password: mockUserData.password,
      role: mockUserData.role,
    };

    it('should fail on any exception', async () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const signup = async () => await authService.signup(mockSignupArgs);
      // Assert
      await expect(signup).rejects.toThrow();
    });

    it('should fail if user exists', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      // Act
      const signup = async () => await authService.signup(mockSignupArgs);
      // Assert
      await expect(signup).rejects.toThrow(BadRequestException);
      await expect(signup).rejects.toThrow('E-mail is already used...');
    });

    it('should create user with verification e-mail if no user found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUserData);
      prismaService.verification.create.mockResolvedValue(mockVerificationData);
      jest
        .spyOn(mailerService, 'sendMail')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(configService, 'get').mockReturnValue('');
      // Act
      const signup = await authService.signup(mockSignupArgs);
      // Assert
      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockSignupArgs,
          password: expect.any(String),
          verified: false,
        },
      });
      expect(prismaService.verification.create).toHaveBeenCalledTimes(1);
      expect(prismaService.verification.create).toHaveBeenCalledWith({
        data: {
          code: expect.any(String),
          userId: mockUserData.id,
        },
      });
      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith(expect.any(Object));
      expect(configService.get).toHaveBeenCalledTimes(1);
      expect(configService.get).toHaveBeenCalledWith(expect.any(String));
      expect(signup).toMatchObject({ success: true });
    });
  });

  describe('login', () => {
    const mockLoginArgs = {
      email: mockUserData.email,
      password: mockUserData.password,
    };

    it('should fail on any exception', async () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const login = async () => await authService.login(mockLoginArgs, res);
      // Assert
      await expect(login).rejects.toThrow();
    });

    it('should fail if user does not exists', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      // Act
      const login = async () => await authService.login(mockLoginArgs, res);
      // Assert
      await expect(login).rejects.toThrow(BadRequestException);
      await expect(login).rejects.toThrow(
        'There is no account associated with that e-mail, please create an account before continuing...',
      );
    });

    it('should fail if password does not match', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      jest
        .spyOn(argon, 'verify')
        .mockImplementation(() => Promise.resolve(false));
      // Act
      const login = async () => await authService.login(mockLoginArgs, res);
      // Assert
      await expect(login).rejects.toThrow('Invalid credentials...');
    });

    it('should sign tokens and set the cookies', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      jest
        .spyOn(argon, 'verify')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(() => Promise.resolve(''));
      jest.spyOn(argon, 'hash').mockResolvedValue('');
      jest.spyOn(res, 'cookie').mockImplementation(() => res);
      // Act
      const login = await authService.login(mockLoginArgs, res);
      // Assert
      expect(jwtService.signAsync).toBeCalledTimes(2);
      expect(jwtService.signAsync).toBeCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(prismaService.user.update).toBeCalledTimes(1);
      expect(prismaService.user.update).toBeCalledWith({
        where: { id: mockUserData.id },
        data: { hashedRt: expect.any(String) },
      });
      expect(res.cookie).toBeCalledTimes(2);
      expect(res.cookie).toBeCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      );
      expect(login).toMatchObject({ success: true });
    });
  });

  describe('logout', () => {
    it('should fail on any exception', async () => {
      // Arrange
      prismaService.user.updateMany.mockRejectedValue(new Error());
      // Act
      const logout = async () => await authService.logout(mockUserData.id, res);
      // Assert
      await expect(logout).rejects.toThrow();
    });

    it('should logout', async () => {
      // Arrange
      prismaService.user.updateMany.mockResolvedValue({ count: 1 });
      jest.spyOn(res, 'clearCookie');
      // Act
      const logout = await authService.logout(mockUserData.id, res);
      // Assert
      expect(prismaService.user.updateMany).toBeCalledTimes(1);
      expect(prismaService.user.updateMany).toBeCalledWith({
        where: {
          AND: [{ id: mockUserData.id }, { hashedRt: { not: null } }],
        },
        data: { hashedRt: null },
      });
      expect(res.clearCookie).toBeCalledTimes(2);
      expect(res.clearCookie).toBeCalledWith(expect.any(String));
      expect(logout).toMatchObject({ success: true });
    });
  });

  describe('refreshToken', () => {
    it('should fail on any exception', async () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const refreshToken = async () =>
        await authService.refreshToken(
          mockUserData.id,
          expect.any(String),
          res,
        );
      // Assert
      await expect(refreshToken).rejects.toThrow();
    });

    it('should fail if no user exists or no refresh token', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      // Act
      const refreshToken = async () =>
        await authService.refreshToken(
          mockUserData.id,
          expect.any(String),
          res,
        );
      // Assert
      await expect(refreshToken).rejects.toThrow(ForbiddenException);
    });

    it('should fail the refresh token does not match', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        hashedRt: 'rt',
      });
      jest
        .spyOn(argon, 'verify')
        .mockImplementation(() => Promise.resolve(false));
      // Act
      const refreshToken = async () =>
        await authService.refreshToken(
          mockUserData.id,
          expect.any(String),
          res,
        );
      // Assert
      await expect(refreshToken).rejects.toThrow(ForbiddenException);
    });

    it('should refresh the tokens', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        hashedRt: 'rt',
      });
      jest
        .spyOn(argon, 'verify')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(authService, 'jwtSign')
        .mockImplementation(() =>
          Promise.resolve({ access_token: '', refresh_token: '' }),
        );
      jest
        .spyOn(authService, 'updateRefreshToken')
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(authService, 'setCookies')
        .mockImplementation(() => Promise.resolve());
      // Act
      const refreshToken = await authService.refreshToken(
        mockUserData.id,
        expect.any(String),
        res,
      );
      // Assert
      expect(authService.jwtSign).toBeCalledTimes(1);
      expect(authService.updateRefreshToken).toBeCalledTimes(1);
      expect(authService.updateRefreshToken).toBeCalledWith(
        mockUserData.id,
        expect.any(String),
      );
      expect(authService.setCookies).toBeCalledTimes(1);
      expect(authService.setCookies).toBeCalledWith(
        res,
        expect.any(String),
        expect.any(String),
      );
      expect(refreshToken).toMatchObject({ success: true });
    });
  });

  describe('emailVerification', () => {
    it('should fail on any exception', async () => {
      // Arrange
      prismaService.verification.findFirst.mockRejectedValue(new Error());
      // Act
      const emailVerification = async () =>
        await authService.emailVerification({
          code: mockVerificationData.code,
        });
      // Assert
      await expect(emailVerification).rejects.toThrow();
    });

    it('should fail if verification code does not match', async () => {
      // Arrange
      prismaService.verification.findFirst.mockResolvedValue(null);
      // Act
      const emailVerification = async () =>
        await authService.emailVerification({
          code: mockVerificationData.code,
        });
      // Assert
      await expect(emailVerification).rejects.toThrow(BadRequestException);
      await expect(emailVerification).rejects.toThrow(
        'Please enter a correct verification code...',
      );
    });

    it('should verify account successfully', async () => {
      // Arrange
      prismaService.verification.findFirst.mockResolvedValue(
        mockVerificationData,
      );
      prismaService.user.update.mockResolvedValue({
        ...mockUserData,
        verified: true,
      });
      prismaService.verification.delete.mockResolvedValue(mockVerificationData);
      // Act
      const emailVerification = await authService.emailVerification({
        code: mockVerificationData.code,
      });
      // Assert
      expect(prismaService.verification.findFirst).toBeCalledTimes(1);
      expect(prismaService.verification.findFirst).toBeCalledWith({
        where: {
          code: mockVerificationData.code,
        },
      });
      expect(prismaService.user.update).toBeCalledTimes(1);
      expect(prismaService.user.update).toBeCalledWith({
        where: {
          id: mockVerificationData.userId,
        },
        data: {
          verified: true,
        },
      });
      expect(prismaService.verification.delete).toBeCalledTimes(1);
      expect(prismaService.verification.delete).toBeCalledWith({
        where: { id: mockVerificationData.id },
      });
      expect(emailVerification).toMatchObject({ success: true });
    });
  });
});
