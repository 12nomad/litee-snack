import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AtGuard, RtGuard } from '../common/guards';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({ signOptions: { algorithm: 'RS256' } })],
  providers: [
    AuthResolver,
    AuthService,
    AtStrategy,
    RtStrategy,
    AtGuard,
    RtGuard,
  ],
})
export class AuthModule {}
