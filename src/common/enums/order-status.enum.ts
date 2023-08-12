import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  PICKED = 'PICKED',
  DELIVERED = 'DELIVERED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
