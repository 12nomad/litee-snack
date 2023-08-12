import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Stripe } from 'stripe';
import { PUB_SUB, STRIPE } from './constants/token.constant';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub(),
    },
    {
      provide: STRIPE,
      useValue: new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2022-11-15',
      }),
    },
  ],
  exports: [PUB_SUB, STRIPE],
})
export class CommonModule {}
