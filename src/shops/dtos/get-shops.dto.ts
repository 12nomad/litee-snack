import { Field, InputType } from '@nestjs/graphql';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { IsString } from 'class-validator';

@InputType()
export class GetShopsDto extends PaginationDto {
  @Field({ nullable: true })
  @IsString()
  search: string;

  @Field({ nullable: true })
  @IsString()
  slug: string;
}
