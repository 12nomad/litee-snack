import { Module } from '@nestjs/common';
import { AtGuard } from '../common/guards';
import { AtStrategy } from '../auth/strategies';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  providers: [UsersResolver, UsersService, AtStrategy, AtGuard],
})
export class UsersModule {}
