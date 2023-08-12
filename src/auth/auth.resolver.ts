import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';

import { MutationOutput } from '../common/entities/mutation-output.entity';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthUser } from './decorators/auth-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { EmailVerificationDto } from './dtos/email-verification.dto';
import { LoginDto } from './dtos/login.dto';
import { PasswordResetDto } from './dtos/password-reset.dto';
import { SignupDto } from './dtos/signup.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { VerifyResetDto } from './dtos/verify-reset.dto';
import { RtGuard } from './guards';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'signup' })
  async signup(
    @Args('signupInput') signupInput: SignupDto,
  ): Promise<MutationOutput> {
    return await this.authService.signup(signupInput);
  }

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'passwordReset' })
  async passwordReset(
    @Args('passwordResetInput') passwordResetInput: PasswordResetDto,
  ): Promise<MutationOutput> {
    return await this.authService.passwordReset(passwordResetInput);
  }

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'verifyReset' })
  async verifyReset(
    @Args('verifyResetInput') verifyResetInput: VerifyResetDto,
  ): Promise<MutationOutput> {
    return await this.authService.verifyReset(verifyResetInput);
  }

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'updatePassword' })
  async updatePassword(
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordDto,
  ): Promise<MutationOutput> {
    return await this.authService.updatePassword(updatePasswordInput);
  }

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginDto,
    // FIXME: @Args('id', {type: () => ID}, ParseIntPipe) id: number,
    // @Res({ passthrough: true }) res: Response,
    @Context('res') res: Response,
  ): Promise<MutationOutput> {
    return await this.authService.login(loginInput, res);
  }

  @Roles(['PUBLIC'])
  @UseGuards(RtGuard)
  @Mutation(() => MutationOutput, { name: 'refreshToken' })
  async refreshToken(
    @AuthUser('sub') sub: number,
    @AuthUser('refresh_token') refresh_token: string,
    // @Res({ passthrough: true }) res: Response,
    @Context('res') res: Response,
  ): Promise<MutationOutput> {
    return await this.authService.refreshToken(sub, refresh_token, res);
  }

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'emailVerification' })
  async emailVerification(
    @Args('emailVerificationInput')
    emailVerificationInput: EmailVerificationDto,
  ) {
    return await this.authService.emailVerification(emailVerificationInput);
  }

  @Mutation(() => MutationOutput, { name: 'logout' })
  async logout(
    @AuthUser('sub') sub: number,
    @Context('res') res: Response,
  ): Promise<MutationOutput> {
    return await this.authService.logout(6, res);
  }
}
