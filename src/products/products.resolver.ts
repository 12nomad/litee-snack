import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { DeleteProductDto } from './dtos/delete-product.dto';
import { EditProductDto } from './dtos/edit-product.dto';
import { ProductsService } from './products.service';

@Resolver()
export class ProductsResolver {
  constructor(private readonly productServices: ProductsService) {}

  @Roles(['SHOP'])
  @Mutation(() => MutationOutput, { name: 'createProduct' })
  async createProduct(
    @AuthUser('sub') ownerId: number,
    @Args('createProductInput')
    createProductInput: CreateProductDto,
  ): Promise<MutationOutput> {
    return this.productServices.createProduct(createProductInput, ownerId);
  }

  @Roles(['SHOP'])
  @Mutation(() => MutationOutput, { name: 'deleteProduct' })
  async deleteProduct(
    @AuthUser('sub') ownerId: number,
    @Args('deleteProductInput')
    deleteProductInput: DeleteProductDto,
  ): Promise<MutationOutput> {
    return this.productServices.deleteProduct(deleteProductInput, ownerId);
  }

  @Roles(['SHOP'])
  @Mutation(() => MutationOutput, { name: 'editProduct' })
  async editProduct(
    @AuthUser('sub') ownerId: number,
    @Args('editProductInput')
    editProductInput: EditProductDto,
  ): Promise<MutationOutput> {
    return this.productServices.editProduct(editProductInput, ownerId);
  }
}
