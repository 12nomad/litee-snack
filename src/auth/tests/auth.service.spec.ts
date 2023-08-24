import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, User, Verification } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as argon from 'argon2';
import { createResponse, MockResponse } from 'node-mocks-http';
import { Response } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';
import { Role } from '../../common/enums/role.enum';
import { UnauthorizedException } from '@nestjs/common';

const mockConfigService = {
  get: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockMailerService = {
  sendMail: jest.fn(),
};

const mockUserData: User | null = {
  id: 99,
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'test@test.com',
  password: '123456',
  verified: false,
  role: Role.CLIENT,
  hashedRt: null,
  name: 'test',
  image: 'http://somewhere.com',
  stripeCustomerId: 'xyz',
};

const mockVerificationData: Verification | null = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  code: 'code',
  reset: '123',
  userId: mockUserData.id,
};

describe('AuthService', () => {
  let configService: ConfigService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let authService: AuthService;
  let mailerService: MailerService;
  let jwtService: JwtService;
  let res: MockResponse<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        AuthService,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    authService = module.get(AuthService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    mailerService = module.get(MailerService);
    jwtService = module.get(JwtService);
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
      name: mockUserData.name,
    };

    it('should fail on any exception', () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const signup = async () => await authService.signup(mockSignupArgs);
      // Assert
      expect(signup).rejects.toThrowError();
    });

    it('should fail if user exists', () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      // Act
      const signup = async () => await authService.signup(mockSignupArgs);
      // Assert
      expect(signup).rejects.toThrow('E-mail is already used...');
    });

    it('should create user with verification e-mail if no user found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUserData);
      prismaService.verification.create.mockResolvedValue(mockVerificationData);
      jest.spyOn(configService, 'get').mockReturnValue('envValue');
      jest.spyOn(argon, 'hash').mockResolvedValue('hashedPassword');
      // Act
      const signup = await authService.signup(mockSignupArgs);
      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(argon.hash).toHaveBeenCalledTimes(1);
      expect(argon.hash).toHaveBeenCalledWith(mockUserData.password);
      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockSignupArgs,
          password: 'hashedPassword',
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

    it('should fail on any exception', () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const login = async () => await authService.login(mockLoginArgs, res);
      // Assert
      expect(login).rejects.toThrowError();
    });

    it('should fail if user does not exists', () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      // Act
      const login = async () => await authService.login(mockLoginArgs, res);
      // Assert
      expect(login).rejects.toThrow(
        'There is no account associated with that e-mail, please create an account before continuing...',
      );
    });

    it('should fail if password does not match', () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      jest.spyOn(argon, 'verify').mockResolvedValue(false);
      // Act
      const login = async () => await authService.login(mockLoginArgs, res);
      // Assert
      expect(argon.hash).toHaveBeenCalledTimes(1);
      expect(login).rejects.toThrow('Invalid credentials...');
    });

    it('should sign tokens and set the cookies', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUserData);
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      jest.spyOn(argon, 'hash').mockResolvedValue('hashedRt');
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('signedJwt');
      jest.spyOn(res, 'cookie');
      // Act
      const login = await authService.login(mockLoginArgs, res);
      // Assert
      expect(jwtService.signAsync).toBeCalledTimes(3);
      expect(jwtService.signAsync).toBeCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(prismaService.user.update).toBeCalledTimes(1);
      expect(prismaService.user.update).toBeCalledWith({
        where: { id: mockUserData.id },
        data: { hashedRt: 'hashedRt' },
      });
      expect(res.cookie).toBeCalledTimes(3);
      expect(res.cookie).toBeCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      );
      expect(res.cookies).toHaveProperty('__litee_snack_access_token', {
        options: { httpOnly: true, secure: true },
        value: 'signedJwt',
      });
      expect(res.cookies).toHaveProperty('__litee_snack_refresh_token', {
        options: { httpOnly: true, secure: true },
        value: 'signedJwt',
      });
      expect(res.cookies).toHaveProperty('__litee_snack_subscription_token', {
        options: { httpOnly: true, secure: true },
        value: 'signedJwt',
      });
      expect(login).toMatchObject({ success: true });
    });
  });

  describe('logout', () => {
    it('should fail on any exception', () => {
      // Arrange
      prismaService.user.updateMany.mockRejectedValue(new Error());
      // Act
      const logout = async () => await authService.logout(mockUserData.id, res);
      // Assert
      expect(logout).rejects.toThrowError();
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
      expect(res.clearCookie).toBeCalledTimes(3);
      expect(res.clearCookie).toBeCalledWith(expect.any(String));
      expect(res.cookies['__litee_snack_refresh_token']).toHaveProperty(
        'value',
        '',
      );
      expect(res.cookies['__litee_snack_refresh_token']).toHaveProperty(
        'value',
        '',
      );
      expect(res.cookies['__litee_snack_subscription_token']).toHaveProperty(
        'value',
        '',
      );
      expect(logout).toMatchObject({ success: true });
    });
  });

  describe('refreshToken', () => {
    it('should fail on any exception', () => {
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
      expect(refreshToken).rejects.toThrowError();
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
      expect(refreshToken).rejects.toThrow(UnauthorizedException);
    });

    it('should fail the refresh token does not match', () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        hashedRt: 'hashedRt',
      });
      jest.spyOn(argon, 'verify').mockResolvedValue(false);
      // Act
      const refreshToken = async () =>
        await authService.refreshToken(
          mockUserData.id,
          expect.any(String),
          res,
        );
      // Assert
      expect(refreshToken).rejects.toThrow(UnauthorizedException);
    });

    it('should refresh the tokens', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        hashedRt: 'hashedRt',
      });
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      jest.spyOn(authService, 'jwtSign').mockImplementation(() =>
        Promise.resolve({
          access_token: 'at',
          refresh_token: 'rt',
          subscription_token: 'st',
        }),
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
      expect(authService.jwtSign).toBeCalledWith(
        mockUserData.id,
        mockUserData.role,
      );
      expect(authService.updateRefreshToken).toBeCalledTimes(1);
      expect(authService.updateRefreshToken).toBeCalledWith(
        mockUserData.id,
        'rt',
      );
      expect(authService.setCookies).toBeCalledTimes(1);
      expect(authService.setCookies).toBeCalledWith(res, 'at', 'rt', 'st');
      expect(refreshToken).toMatchObject({ success: true });
    });
  });

  describe('emailVerification', () => {
    it('should fail on any exception', () => {
      // Arrange
      prismaService.verification.findFirst.mockRejectedValue(new Error());
      // Act
      const emailVerification = async () =>
        await authService.emailVerification({
          code: mockVerificationData.code,
        });
      // Assert
      expect(emailVerification).rejects.toThrowError();
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
      expect(emailVerification).rejects.toThrow(
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

  describe('passwordReset', () => {
    it('should fail on any exception', () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const passwordReset = async () =>
        await authService.passwordReset({
          email: mockUserData.email,
        });
      // Assert
      expect(passwordReset).rejects.toThrowError();
    });

    it('should fail if user not found', () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      // Act
      const passwordReset = async () =>
        await authService.passwordReset({
          email: mockUserData.email,
        });
      // Assert
      expect(passwordReset).rejects.toThrow(
        'There is no account associated with that e-mail, please create an account before continuing...',
      );
    });

    it('should reset email when verification already exist', async () => {
      // Arrange
      // @ts-ignore
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        verification: mockVerificationData,
      });
      prismaService.verification.update.mockResolvedValue(mockVerificationData);
      // Act
      const passwordReset = await authService.passwordReset({
        email: mockUserData.email,
      });
      // Assert
      expect(prismaService.user.findUnique).toBeCalledTimes(1);
      expect(prismaService.user.findUnique).toBeCalledWith({
        where: {
          email: mockUserData.email,
        },
        include: { verification: true },
      });
      expect(prismaService.verification.update).toBeCalledTimes(1);
      expect(prismaService.verification.update).toBeCalledWith({
        where: {
          userId: mockUserData.id,
        },
        data: {
          reset: expect.any(String),
        },
      });
      expect(prismaService.verification.create).toBeCalledTimes(0);
      expect(mailerService.sendMail).toHaveBeenCalledWith(expect.any(Object));
      expect(passwordReset).toMatchObject({ success: true });
    });

    it('should reset email when verification does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
      });
      prismaService.verification.create.mockResolvedValue(mockVerificationData);
      // Act
      const passwordReset = await authService.passwordReset({
        email: mockUserData.email,
      });
      // Assert
      expect(prismaService.user.findUnique).toBeCalledTimes(1);
      expect(prismaService.user.findUnique).toBeCalledWith({
        where: {
          email: mockUserData.email,
        },
        include: { verification: true },
      });
      expect(prismaService.verification.update).toBeCalledTimes(0);
      expect(prismaService.verification.create).toBeCalledTimes(1);
      expect(prismaService.verification.create).toBeCalledWith({
        data: {
          userId: mockUserData.id,
          reset: expect.any(String),
        },
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith(expect.any(Object));
      expect(passwordReset).toMatchObject({ success: true });
    });
  });

  describe('verifyReset', () => {
    it('should fail on any exception', () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(new Error());
      // Act
      const verifyReset = async () =>
        await authService.verifyReset({
          email: mockUserData.email,
          reset: expect.any(String),
        });
      // Assert
      expect(verifyReset).rejects.toThrowError();
    });

    it('should fail if reset codes do not match', () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        verification:
          prismaService.verification.findUnique.mockResolvedValue(
            mockVerificationData,
          ),
      });
      // Act
      const verifyReset = async () =>
        await authService.verifyReset({
          email: mockUserData.email,
          reset: '456',
        });
      // Assert
      expect(verifyReset).rejects.toThrow(
        'The verification code does not match...',
      );
    });

    it('should update user verification', async () => {
      // Arrange
      // @ts-ignore
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUserData,
        verification: mockVerificationData,
      });
      prismaService.verification.update.mockResolvedValue({
        ...mockVerificationData,
        reset: '',
      });
      // Act
      const verifyReset = await authService.verifyReset({
        email: mockUserData.email,
        reset: '123',
      });
      // Assert
      expect(prismaService.user.findUnique).toBeCalledTimes(1);
      expect(prismaService.user.findUnique).toBeCalledWith({
        where: {
          email: mockUserData.email,
        },
        include: { verification: true },
      });
      expect(prismaService.verification.update).toBeCalledTimes(1);
      expect(prismaService.verification.update).toBeCalledWith({
        where: {
          userId: mockUserData.id,
        },
        data: {
          reset: '',
        },
      });
      expect(verifyReset).toMatchObject({ success: true });
    });
  });

  describe('updatePassword', () => {
    it('should fail on any exception', () => {
      // Arrange
      prismaService.user.update.mockRejectedValue(new Error());
      // Act
      const updatePassword = async () =>
        await authService.updatePassword({
          password: expect.any(String),
          email: mockUserData.email,
        });
      // Assert
      expect(updatePassword).rejects.toThrowError();
    });

    it('should update password', async () => {
      // Arrange
      jest.spyOn(argon, 'hash').mockResolvedValue('hashedPassword');
      prismaService.user.update.mockResolvedValue(mockUserData);
      // Act
      const updatePassword = await authService.updatePassword({
        password: 'done!',
        email: mockUserData.email,
      });
      // Assert
      expect(argon.hash).toHaveBeenCalledWith('done!');
      expect(prismaService.user.update).toBeCalledTimes(1);
      expect(prismaService.user.update).toBeCalledWith({
        where: {
          email: mockUserData.email,
        },
        data: { password: 'hashedPassword' },
      });
      expect(updatePassword).toMatchObject({ success: true });
    });
  });
});
