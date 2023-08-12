import { Module } from '@nestjs/common';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';
import { StStrategy } from '../auth/strategies';
import { StGuard } from '../auth/guards';

@Module({
  providers: [OrdersResolver, OrdersService, StStrategy, StGuard],
})
export class OrdersModule {}
