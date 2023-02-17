import { InputType, PickType } from '@nestjs/graphql';
import { Verification } from '../../users/entities/verification.entity';

@InputType()
export class EmailVerificationDto extends PickType(Verification, ['code']) {}
