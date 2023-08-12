import { Controller, Post, Req } from '@nestjs/common/decorators';
import { RawBodyRequest } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('webhook')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(['PUBLIC'])
  webhook(@Req() req: RawBodyRequest<Request>): Promise<{ received: boolean }> {
    const buffer = req.rawBody;
    const signature = req.headers['stripe-signature'];

    return this.paymentsService.webhook(buffer, signature);
  }
}
