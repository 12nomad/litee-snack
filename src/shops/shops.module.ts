import { Module } from '@nestjs/common';
import { ShopsResolver } from './shops.resolver';
import { ShopsService } from './shops.service';

@Module({
  providers: [ShopsResolver, ShopsService],
})
export class ShopsModule {}
