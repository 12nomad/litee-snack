import Stripe from 'stripe';
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  INCOMING_ORDER,
  PUB_SUB,
  STRIPE,
} from '../common/constants/token.constant';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent.dto';
import { PaymentsQueryOutput } from './entities/payment-query-output.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import {
  CreatePromotionPaymentIntentDto,
  CreatePromotionPaymentIntentOutput,
} from './dtos/create-promotion-payment-intent.dto';
import { CreateStripeUserDto } from './dtos/create-stripe-user.dto';
import { PubSub } from 'graphql-subscriptions';
import stripeInteger from '../common/utils/stripeInteger.util';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STRIPE) private readonly stripe: Stripe,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createStripeUser({
    email,
    name,
  }: CreateStripeUserDto): Promise<MutationOutput> {
    const newStripeUser = await this.stripe.customers.create({
      email,
      name,
    });
    await this.prisma.user.update({
      where: { email },
      data: { stripeCustomerId: newStripeUser.id },
    });

    return { success: true };
  }

  async getPayments(user: { sub: number }): Promise<PaymentsQueryOutput> {
    const payments = await this.prisma.payment.findMany({
      where: { userId: user.sub, status: 'SUCCESS' },
      include: { order: { include: { shop: true } }, shop: true },
    });
    return { success: true, data: payments };
  }

  async getOwnerPayments(user: { sub: number }): Promise<PaymentsQueryOutput> {
    const payments = await this.prisma.payment.findMany({
      where: { userId: user.sub, status: 'SUCCESS' },
      include: { shop: true },
    });
    return { success: true, data: payments };
  }

  async createPromotionPaymentIntent(
    {
      amount,
      shopId,
      stripePaymentIntentId,
      promoDuration,
      stripeCustomerId,
    }: CreatePromotionPaymentIntentDto,
    user: { sub: number },
  ): Promise<CreatePromotionPaymentIntentOutput> {
    if (stripePaymentIntentId) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (!paymentIntent)
        throw new BadRequestException({ message: 'Invalid payment intent id' });

      await this.stripe.paymentIntents.update(stripePaymentIntentId, {
        amount,
        customer: stripeCustomerId,
      });
      await this.prisma.payment.update({
        where: { stripePaymentIntentId },
        data: {
          type: 'PROMOTION',
          promoDuration,
          amount,
          shop: { connect: { id: shopId } },
        },
      });

      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret || '',
          paymentIntent: paymentIntent.id,
        },
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      customer: stripeCustomerId,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    await this.prisma.payment.create({
      data: {
        type: 'PROMOTION',
        promoDuration,
        amount,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        userId: user.sub,
        stripePaymentIntentId: paymentIntent.id,
        shop: { connect: { id: shopId } },
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntent: paymentIntent.id,
      },
    };
  }

  async webhook(
    buffer: Buffer | undefined,
    signature: string | string[] | undefined,
  ): Promise<{ received: boolean }> {
    if (!buffer || !signature)
      throw new BadRequestException('Invalid webhook signature');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        buffer,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (error) {
      throw new BadRequestException(`Webhook Error: ${error}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;

        if (charge.customer && charge.payment_intent) {
          const payment = await this.prisma.payment.findUnique({
            where: { stripePaymentIntentId: charge.payment_intent as string },
            include: { user: true, order: { include: { shop: true } } },
          });
          if (!payment) break;

          if (payment?.user?.role === 'SHOP') {
            const duration = charge.amount === 9999 ? 31 : 7;
            const date = new Date();
            const promo = date.setDate(date.getDate() + duration);

            await this.prisma.$transaction([
              this.prisma.payment.update({
                where: {
                  id: payment.id,
                },
                data: { status: 'SUCCESS' },
              }),
              this.prisma.shop.update({
                where: {
                  paymentId: payment?.id,
                },
                data: {
                  isPromoted: true,
                  promotedUntil: promo.toString(),
                },
              }),
            ]);
          } else {
            await this.prisma.payment.update({
              where: {
                id: payment.id,
              },
              data: { status: 'SUCCESS' },
            });
            await this.pubSub.publish(INCOMING_ORDER, {
              pendingOrder: payment.order,
            });
          }
        }
        break;
      default:
        throw new BadRequestException(
          `Event type not supported: ${event.type}`,
        );
    }

    return { received: true };
  }

  async createPaymentIntent(
    {
      orderId,
      stripePaymentIntentId,
      stripeCustomerId,
    }: CreatePaymentIntentDto,
    user: { sub: number },
  ): Promise<CreatePromotionPaymentIntentOutput> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (stripePaymentIntentId) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        stripePaymentIntentId,
      );

      if (!paymentIntent)
        throw new BadRequestException({ message: 'Invalid payment intent id' });

      await this.stripe.paymentIntents.update(stripePaymentIntentId, {
        amount: Math.round(stripeInteger(order?.total)),
        customer: stripeCustomerId,
      });
      await this.prisma.payment.update({
        where: { stripePaymentIntentId },
        data: {
          type: 'ORDER',
          amount: order?.total || 0,
          order: { connect: { id: order?.id || 0 } },
        },
      });

      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret || '',
          paymentIntent: paymentIntent.id,
        },
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(stripeInteger(order?.total)),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      customer: stripeCustomerId,
    });

    await this.prisma.payment.create({
      data: {
        amount: order?.total || 0,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        userId: user.sub,
        stripePaymentIntentId: paymentIntent.id,
        type: 'ORDER',
        order: { connect: { id: order?.id || 0 } },
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntent: paymentIntent.id,
      },
    };
  }

  @Cron('0 0 0 * * *')
  async checkExpiredPromotion(): Promise<MutationOutput> {
    await this.prisma.shop.updateMany({
      where: {
        promotedUntil: { lte: new Date().getMilliseconds().toString() },
      },
      data: { isPromoted: false, promotedUntil: undefined },
    });

    return { success: true };
  }
}
