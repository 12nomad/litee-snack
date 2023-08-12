import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  INCOMING_ORDER,
  ORDER_STATUS,
  PUB_SUB,
  READY_ORDER,
} from '../common/constants/token.constant';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { Role } from '../common/enums/role.enum';
import { AcceptNewOrderDto } from './dtos/accept-new-order.dto';
import { CreateOrderDto, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderDto } from './dtos/edit-status.dto';
import { GetOrderDto } from './dtos/get-order.dto';
import { GetOrdersDto } from './dtos/get-orders.dto';
import { OrderStatusDto } from './dtos/order-status.dto';
import {
  OrderQueryOutput,
  OrdersQueryOutput,
} from './entities/order-query-output.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { StGuard } from '../auth/guards';
import { GetShopOrderDto } from './dtos/get-shop-order-dto';
import { DeliveryOrderDetailDto } from './dtos/delivery-order-detail.dto';

@Resolver()
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Roles(['CLIENT'])
  @Mutation(() => CreateOrderOutput, { name: 'createOrder' })
  async createOrder(
    @AuthUser('sub') userId: number,
    @Args('createOrderInput') createOrderInput: CreateOrderDto,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(createOrderInput, userId);
  }

  @Query(() => OrdersQueryOutput, { name: 'getOrders' })
  async getOrders(
    @AuthUser() user: { sub: number; role: Role },
    @Args('getOrdersInput') getOrdersInput: GetOrdersDto,
  ): Promise<OrdersQueryOutput> {
    return this.ordersService.getOrders(getOrdersInput, user);
  }

  @Query(() => OrderQueryOutput, { name: 'getOrder' })
  async getOrder(
    @AuthUser() user: { sub: number; role: Role },
    @Args('getOrderInput') getOrderInput: GetOrderDto,
  ): Promise<OrderQueryOutput> {
    return this.ordersService.getOrder(getOrderInput, user);
  }

  @Roles(['SHOP'])
  @Query(() => OrderQueryOutput, { name: 'getShopOrder' })
  async getShopOrder(
    @Args('getShopOrderInput') getShopOrderInput: GetShopOrderDto,
  ): Promise<OrderQueryOutput> {
    return this.ordersService.getShopOrder(getShopOrderInput);
  }

  @Roles(['DELIVERY'])
  @Query(() => OrderQueryOutput, { name: 'deliveryOrderDetail' })
  async deliveryOrderDetail(
    @Args('deliveryOrderDetailInput')
    deliveryOrderDetailInput: DeliveryOrderDetailDto,
  ): Promise<OrderQueryOutput> {
    return this.ordersService.deliveryOrderDetail(deliveryOrderDetailInput);
  }

  @Mutation(() => MutationOutput, { name: 'editOrder' })
  async editOrder(
    @AuthUser() user: { sub: number; role: Role },
    @Args('editOrderInput') editOrderInput: EditOrderDto,
  ): Promise<MutationOutput> {
    return this.ordersService.editOrder(editOrderInput, user);
  }

  @Roles(['DELIVERY'])
  @Mutation(() => MutationOutput, { name: 'acceptNewOrder' })
  async acceptNewOrder(
    @AuthUser() user: { sub: number; role: Role },
    @Args('acceptNewOrderInput') acceptNewOrderInput: AcceptNewOrderDto,
  ): Promise<MutationOutput> {
    return this.ordersService.acceptNewOrder(acceptNewOrderInput, user);
  }

  @Roles(['SHOP'])
  @UseGuards(StGuard)
  @Subscription(() => Order, {
    name: 'pendingOrder',
    filter: (payload: { pendingOrder: Order }, _, ctx) =>
      payload.pendingOrder.shop?.ownerId === ctx.req.user.sub,
  })
  pendingOrder() {
    return this.pubSub.asyncIterator(INCOMING_ORDER);
  }

  // TODO: not hooked in client
  // @Roles(['DELIVERY'])
  // @UseGuards(StGuard)
  // @Subscription(() => Order, {
  //   name: 'readyOrder',
  // })
  // readyOrder() {
  //   return this.pubSub.asyncIterator(READY_ORDER);
  // }

  @UseGuards(StGuard)
  @Subscription(() => Order, {
    name: 'orderStatus',
    filter: (
      payload: { orderStatus: Order },
      args: { orderStatusInput: OrderStatusDto },
      ctx,
    ) =>
      payload.orderStatus.id === args.orderStatusInput.id &&
      payload.orderStatus.customerId === ctx.req.user.sub,
    // || payload.orderStatus.shop?.ownerId === ctx.req.user.sub
    // || payload.orderStatus.driverId === ctx.req.user.sub
  })
  orderStatus(@Args('orderStatusInput') _: OrderStatusDto) {
    return this.pubSub.asyncIterator(ORDER_STATUS);
  }
}
