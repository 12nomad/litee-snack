import { Field, InputType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class PaginationDto {
  @Field({ defaultValue: 1 })
  @IsNumber()
  page: number;
}
