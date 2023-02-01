import { ObjectType } from '@nestjs/graphql';
import { Shared } from '../../common/enums/entities/shared.entity';
import { ERole } from '../../common/enums/role.enum';

@ObjectType()
export class User extends Shared {
  email: string;
  password: string;
  role: ERole;
}
