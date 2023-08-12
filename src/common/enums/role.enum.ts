import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  SHOP = 'SHOP',
  CLIENT = 'CLIENT',
  DELIVERY = 'DELIVERY',
}

// FIXME: querying union type requires inline fragment to work
// createUnionType({
//   name: '',
//   types: () => ['', '']
// })

registerEnumType(Role, { name: 'Role' });
