import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';

@InputType()
export class getCategoryShopsDto extends PaginationDto {
  @Field()
  @IsString()
  @MinLength(3)
  slug: string;
}
