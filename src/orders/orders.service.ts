import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Order, OrderItem, Prisma, Shop, User } from '@prisma/client';

import { PubSub } from 'graphql-subscriptions';
import {
  ORDER_STATUS,
  PUB_SUB,
  READY_ORDER,
} from '../common/constants/token.constant';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { Option } from '../products/entities/product.entity';
import { AcceptNewOrderDto } from './dtos/accept-new-order.dto';
import { CreateOrderDto, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderDto } from './dtos/edit-status.dto';
import { GetOrderDto } from './dtos/get-order.dto';
import { GetOrdersDto } from './dtos/get-orders.dto';
import {
  OrderQueryOutput,
  OrdersQueryOutput,
} from './entities/order-query-output.entity';
import { GetShopOrderDto } from './dtos/get-shop-order-dto';
import { DeliveryOrderDetailDto } from './dtos/delivery-order-detail.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  // TODO: Utils...
  canGetOrder(
    user: { sub: number; role: Role },
    order:
      | (Order & {
          customer: User | null;
          driver: User | null;
          shop: Shop | null;
        })
      | null,
  ) {
    let userAllowed = true;

    if (user.role === Role.CLIENT && order?.customerId !== user.sub)
      userAllowed = false;
    if (user.role === Role.DELIVERY && order?.driverId !== user.sub)
      userAllowed = false;
    if (user.role === Role.SHOP && order?.shop?.ownerId !== user.sub)
      userAllowed = false;

    return userAllowed;
  }

  // TODO: Order...
  async createOrder(
    { shopId, orderOptions, orderId }: CreateOrderDto,
    userId: number,
  ): Promise<CreateOrderOutput> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });
    if (!shop) throw new NotFoundException('Shop not found...');

    if (orderId) await this.prisma.order.delete({ where: { id: orderId } });

    let orderTotal = 0;
    const orderItemsIds: { id: number }[] = [];

    for (const item of orderOptions) {
      const productExists = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!productExists)
        throw new BadRequestException(
          'Failed creating the order due to the product that does not exists...',
        );

      let orderItemTotal = 0;

      if (
        item.orderChoices &&
        Array.isArray(item.orderChoices) &&
        item.orderChoices.length > 0
      ) {
        item.orderChoices.forEach(async (choice) => {
          if (choice) {
            const optionsArr = JSON.parse(
              JSON.stringify(productExists.options),
            ) as Option[];

            optionsArr.forEach((option) => {
              if (option.label === choice['label'] && option.extra) {
                orderItemTotal =
                  orderItemTotal + option.extra * (choice['quantity'] || 1);
              } else {
                const item = option.choices?.find(
                  (item) => item.label === choice['choice'], // FIXME: fix in case you have extra choice price
                );
                if (item && item.extra)
                  orderItemTotal = orderItemTotal + item.extra;
              }
            });
          }
        });

        const json = [...item.orderChoices] as Prisma.JsonArray;
        const newOrderItem = await this.prisma.orderItem.create({
          data: {
            orderChoices: json,
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
          },
        });
        orderItemsIds.push({ id: newOrderItem.id });
      } else {
        const newOrderItem = await this.prisma.orderItem.create({
          data: { productId: item.productId, quantity: item.quantity },
        });
        orderItemsIds.push({ id: newOrderItem.id });
      }

      orderTotal =
        orderTotal + orderItemTotal + productExists.price * item.quantity;
    }

    const newOrder = await this.prisma.order.create({
      data: {
        total: +orderTotal.toFixed(2),
        customerId: userId,
        shopId,
        orderItems: { connect: orderItemsIds },
      },
      include: { orderItems: true },
    });

    return { success: true, orderId: newOrder.id };
  }

  async getOrders(
    getOrdersInput: GetOrdersDto,
    user: { sub: number; role: Role },
  ): Promise<OrdersQueryOutput> {
    switch (user.role) {
      case Role.CLIENT:
        const clientOrders = await this.prisma.order.findMany({
          where: {
            AND: [{ customerId: user.sub }, { status: getOrdersInput.status }],
          },
          include: { orderItems: true, payment: true },
          orderBy: { updatedAt: 'desc' },
        });
        return { success: true, data: clientOrders };

        break;

      case Role.DELIVERY:
        if (getOrdersInput.status === 'READY') {
          const deliveryOrders = await this.prisma.order.findMany({
            where: {
              AND: [{ driverId: null }, { status: getOrdersInput.status }],
            },
            include: { shop: true, customer: true },
            orderBy: { updatedAt: 'desc' },
          });
          return { success: true, data: deliveryOrders };
        } else {
          const deliveryOrders = await this.prisma.order.findMany({
            where: {
              AND: [{ driverId: user.sub }, { status: getOrdersInput.status }],
            },
            include: { shop: true, customer: true },
            orderBy: { updatedAt: 'desc' },
          });
          return { success: true, data: deliveryOrders };
        }
        break;

      case Role.SHOP:
        const shopOrders = await this.prisma.order.findMany({
          where: {
            AND: [
              { shop: { ownerId: user.sub } },
              { shopId: getOrdersInput.shopId },
              { status: getOrdersInput.status },
              { payment: { status: 'SUCCESS' } },
            ],
          },
          include: { orderItems: true, customer: true },
          orderBy: { updatedAt: 'desc' },
        });
        return { success: true, data: shopOrders };
        break;

      default:
        throw new InternalServerErrorException(
          'Something went wrong, try again later...',
        );
    }

    return { success: false };
  }

  async getOrder(
    { id }: GetOrderDto,
    user: { sub: number; role: Role },
  ): Promise<OrderQueryOutput> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, driver: true, shop: true },
    });

    if (!order) throw new NotFoundException('Order not found...');

    if (!this.canGetOrder(user, order))
      throw new ForbiddenException('You are not allowed not see this order...');

    return { success: true, data: order };
  }

  async getShopOrder({ id }: GetShopOrderDto): Promise<OrderQueryOutput> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Order not found...');

    return { success: true, data: order };
  }

  async deliveryOrderDetail({
    id,
  }: DeliveryOrderDetailDto): Promise<OrderQueryOutput> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, shop: true },
    });

    if (!order) throw new NotFoundException('Order not found...');

    return { success: true, data: order };
  }

  async editOrder(
    { id, status }: EditOrderDto,
    user: { sub: number; role: Role },
  ): Promise<MutationOutput> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: true,
        shop: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found...');

    if (!this.canGetOrder(user, order) && status !== 'PICKED')
      throw new ForbiddenException('You are not allowed not see this order...');

    if (user.role === Role.CLIENT) {
      throw new ForbiddenException(
        'You are not allowed not edit this order...',
      );
    }

    if (user.role === Role.SHOP) {
      if (status !== OrderStatus.PREPARING && status !== OrderStatus.READY) {
        throw new ForbiddenException(
          'You are not allowed not edit this order...',
        );
      }
    }

    if (user.role === Role.DELIVERY) {
      if (status !== OrderStatus.PICKED && status !== OrderStatus.DELIVERED) {
        throw new ForbiddenException(
          'You are not allowed not edit this order...',
        );
      }
    }

    // TODO: not hooked in client
    // if (user.role === Role.SHOP && readyOrder.status === OrderStatus.READY)
    //   await this.pubSub.publish(READY_ORDER, { readyOrder });

    if (user.role === Role.DELIVERY && status === OrderStatus.PICKED) {
      const { data } = await this.acceptNewOrder({ id, status }, user);
      await this.pubSub.publish(ORDER_STATUS, { orderStatus: data });

      return { success: true };
    } else {
      const readyOrder = await this.prisma.order.update({
        where: { id },
        data: { status },
        include: { shop: true, driver: true, customer: true },
      });

      await this.pubSub.publish(ORDER_STATUS, { orderStatus: readyOrder });

      return { success: true };
    }
  }

  async acceptNewOrder(
    { id, status }: AcceptNewOrderDto,
    user: { sub: number; role: Role },
  ): Promise<OrderQueryOutput> {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) throw new NotFoundException('Order not found...');

    if (order.driverId && order.driverId !== user.sub)
      throw new ForbiddenException(
        'A driver is already assigned to this order...',
      );

    const readyOrder = await this.prisma.order.update({
      where: { id },
      data: { driver: { connect: { id: user.sub } }, status },
      include: { shop: true, driver: true, customer: true },
    });

    return { success: true, data: readyOrder };
  }
}
