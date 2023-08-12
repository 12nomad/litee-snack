import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsResolver } from './payments.resolver';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsResolver, PaymentsService],
})
export class PaymentsModule {}
