import { registerEnumType } from '@nestjs/graphql';

// FIXME: To use in an entity
export enum Role {
  SHOP = 'SHOP',
  CLIENT = 'CLIENT',
  DELIVERY = 'DELIVERY',
}

registerEnumType(Role, { name: 'Role' });
