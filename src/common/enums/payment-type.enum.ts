import { registerEnumType } from '@nestjs/graphql';

export enum PaymentType {
  ORDER = 'ORDER',
  PROMOTION = 'PROMOTION',
}

// FIXME: querying union type requires inline fragment to work
// createUnionType({
//   name: '',
//   types: () => ['', '']
// })

registerEnumType(PaymentType, { name: 'PaymentType' });
