import { registerEnumType } from '@nestjs/graphql';

// FIXME: To use in an entity
export enum ERole {
  'SHOP' = 'SHOP',
  'CLIENT' = 'CLIENT',
  'DELIVERY' = 'DELIVERY',
}

registerEnumType(ERole, { name: 'ERole' });
