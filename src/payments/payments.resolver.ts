import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { CreatePaymentIntentDto } from './dtos/create-payment-intent.dto';
import { PaymentsQueryOutput } from './entities/payment-query-output.entity';
import { PaymentsService } from './payments.service';
import {
  CreatePromotionPaymentIntentDto,
  CreatePromotionPaymentIntentOutput,
} from './dtos/create-promotion-payment-intent.dto';
import { CreateStripeUserDto } from './dtos/create-stripe-user.dto';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(['PUBLIC'])
  @Mutation(() => MutationOutput, { name: 'createStripeUser' })
  async createStripeUser(
    @AuthUser() user: { sub: number },
    @Args('createStripeUserInput')
    createStripeUserInput: CreateStripeUserDto,
  ): Promise<MutationOutput> {
    return this.paymentsService.createStripeUser(createStripeUserInput);
  }

  @Roles(['CLIENT'])
  @Query(() => PaymentsQueryOutput, { name: 'getPayments' })
  async getPayments(
    @AuthUser() user: { sub: number },
  ): Promise<PaymentsQueryOutput> {
    return this.paymentsService.getPayments(user);
  }

  @Roles(['SHOP'])
  @Query(() => PaymentsQueryOutput, { name: 'getOwnerPayments' })
  async getOwnerPayments(
    @AuthUser() user: { sub: number },
  ): Promise<PaymentsQueryOutput> {
    return this.paymentsService.getOwnerPayments(user);
  }

  @Roles(['CLIENT', 'SHOP'])
  @Mutation(() => CreatePromotionPaymentIntentOutput, {
    name: 'createPaymentIntent',
  })
  async createPaymentIntent(
    @AuthUser() user: { sub: number },
    @Args('createPaymentIntentInput')
    createPaymentIntentInput: CreatePaymentIntentDto,
  ): Promise<CreatePromotionPaymentIntentOutput> {
    return this.paymentsService.createPaymentIntent(
      createPaymentIntentInput,
      user,
    );
  }

  @Roles(['CLIENT', 'SHOP'])
  @Mutation(() => CreatePromotionPaymentIntentOutput, {
    name: 'createPromotionPaymentIntent',
  })
  async createPromotionPaymentIntent(
    @AuthUser() user: { sub: number },
    @Args('createPromotionPaymentIntentInput')
    createPromotionPaymentIntentInput: CreatePromotionPaymentIntentDto,
  ): Promise<CreatePromotionPaymentIntentOutput> {
    return this.paymentsService.createPromotionPaymentIntent(
      createPromotionPaymentIntentInput,
      user,
    );
  }
}
