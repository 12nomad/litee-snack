import { AuthService } from './auth.service';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard, RtGuard } from '../common/guards';
import { Response } from 'express';
import { AuthUser } from './decorators/auth-user.decorator';
import { AuthMutationOutput } from './entities/auth-mutation-output.entity';
import { EmailVerificationDto } from './dtos/email-verification.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthMutationOutput, { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignupDto,
  ): Promise<AuthMutationOutput> {
    return await this.authService.signup(signupInput);
  }

  @Mutation(() => AuthMutationOutput, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginDto,
    // @Res({ passthrough: true }) res: Response,
    @Context('res') res: Response,
  ): Promise<AuthMutationOutput> {
    return await this.authService.login(loginInput, res);
  }

  @UseGuards(AtGuard)
  @Mutation(() => AuthMutationOutput, { name: 'logout' })
  async logout(
    @AuthUser('sub') sub: number,
    @Context('res') res: Response,
  ): Promise<AuthMutationOutput> {
    return await this.authService.logout(6, res);
  }

  @UseGuards(RtGuard)
  @Mutation(() => AuthMutationOutput, { name: 'refreshToken' })
  async refreshToken(
    @AuthUser('sub') sub: number,
    @AuthUser('refresh_token') refresh_token: string,
    // @Res({ passthrough: true }) res: Response,
    @Context('res') res: Response,
  ): Promise<AuthMutationOutput> {
    return await this.authService.refreshToken(sub, refresh_token, res);
  }

  @Mutation(() => AuthMutationOutput, { name: 'emailVerification' })
  async emailVerification(
    @Args('emailVerificationInput')
    emailVerificationInput: EmailVerificationDto,
  ) {
    return await this.authService.emailVerification(emailVerificationInput);
  }
}
