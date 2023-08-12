import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RtStrategy } from './strategies';
import { RtGuard } from './guards';

@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        algorithm: 'RS256',
      },
      privateKey: process.env.JWT_PRIVATE,
      publicKey: process.env.JWT_PUBLIC,
    }),
  ],
  providers: [AuthResolver, AuthService, RtStrategy, RtGuard],
})
export class AuthModule {}
