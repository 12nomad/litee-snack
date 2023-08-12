import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

type Options = `${Role}` | 'PUBLIC';

export const Roles = (roles: Options[]) => SetMetadata('roles', roles);
