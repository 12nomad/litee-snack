import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { CreateShopDto } from './dtos/create-shop.dto';
import { ShopsService } from './shops.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { EditShopDto } from './dtos/edit-shop.dto';
import { DeleteShopDto } from './dtos/delete-shop.dto';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import {
  ShopQueryOutput,
  ShopsQueryOutput,
} from './entities/shop-query-output.entity';
import { GetShopsDto } from './dtos/get-shops.dto';
import { GetShopByIdDto } from './dtos/get-shop-by-id.dto';
import { GetShopByNameDto } from './dtos/get-shop-by-name.dto';
import { GetOwnerIndividualShopDto } from './dtos/get-owner-individual-shop.dto';

// TODO: SHOPS
@Resolver()
export class ShopsResolver {
  constructor(private readonly shopsService: ShopsService) {}

  @Roles(['SHOP'])
  @Query(() => ShopsQueryOutput, { name: 'getOwnerShops' })
  async getOwnerShops(@AuthUser('sub') id: number): Promise<ShopsQueryOutput> {
    return this.shopsService.getOwnerShops(id);
  }

  @Roles(['SHOP'])
  @Query(() => ShopQueryOutput, { name: 'getOwnerIndividualShop' })
  async getOwnerIndividualShop(
    @AuthUser('sub') id: number,
    @Args('getOwnerIndividualShopInput')
    getOwnerIndividualShopInput: GetOwnerIndividualShopDto,
  ): Promise<ShopQueryOutput> {
    return this.shopsService.getOwnerIndividualShop(
      id,
      getOwnerIndividualShopInput,
    );
  }

  @Roles(['SHOP'])
  @Mutation(() => MutationOutput, { name: 'createShop' })
  async createShop(
    @Args('createShopInput') createShopInput: CreateShopDto,
    @AuthUser('sub') id: number,
  ): Promise<MutationOutput> {
    return this.shopsService.createShop(createShopInput, id);
  }

  @Roles(['SHOP'])
  @Mutation(() => MutationOutput, { name: 'editShop' })
  async editShop(
    @Args('editShopInput') editShopInput: EditShopDto,
    @AuthUser('sub') id: number,
  ): Promise<MutationOutput> {
    return this.shopsService.editShop(editShopInput, id);
  }

  @Roles(['SHOP'])
  @Mutation(() => MutationOutput, { name: 'deleteShop' })
  async deleteShop(
    @Args('deleteShopInput') deleteShopInput: DeleteShopDto,
    @AuthUser('sub') id: number,
  ): Promise<MutationOutput> {
    return this.shopsService.deleteShop(deleteShopInput, id);
  }

  @Roles(['PUBLIC'])
  @Query(() => ShopsQueryOutput, { name: 'getShops' })
  async getShops(
    @Args('getShopsInput') getShopsInput: GetShopsDto,
  ): Promise<ShopsQueryOutput> {
    return this.shopsService.getShops(getShopsInput);
  }

  @Roles(['PUBLIC'])
  @Query(() => ShopQueryOutput, { name: 'getShopById' })
  async getShopById(
    @Args('getShopByIdInput') getShopByIdInput: GetShopByIdDto,
  ): Promise<ShopQueryOutput> {
    return this.shopsService.getShopById(getShopByIdInput);
  }

  @Roles(['PUBLIC'])
  @Query(() => ShopsQueryOutput, { name: 'getShopByName' })
  async getShopByName(
    @Args('getShopByNameInput') getShopByNameInput: GetShopByNameDto,
  ): Promise<ShopsQueryOutput> {
    return this.shopsService.getShopByName(getShopByNameInput);
  }

  @Roles(['PUBLIC'])
  @Query(() => ShopsQueryOutput, { name: 'getPromotedShops' })
  async getPromotedShops(): Promise<ShopsQueryOutput> {
    return this.shopsService.getPromotedShops();
  }
}
