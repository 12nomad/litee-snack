import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { AtGuard } from '../common/guards';
import { UsersService } from './users.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserQueryOutput } from './entities/user-query-output.entity';
import { UserMutationOutput } from './entities/user-mutation-output.entity';
import { EditUserProfileDto } from './dtos/edit-user-profile.dto';
import { GetUserByIdDto } from './dtos/get-user-by-id.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AtGuard)
  @Query(() => User, { name: 'getAuthUser', nullable: true })
  async getAuthUser(@AuthUser('sub') sub: number) {
    return await this.usersService.getAuthUser(sub);
  }

  @UseGuards(AtGuard)
  @Query(() => UserQueryOutput, { name: 'getUserById' })
  async getUserById(
    @Args('getUserByIdInput') getUserByIdInput: GetUserByIdDto,
  ): Promise<UserQueryOutput> {
    return await this.usersService.getUserById(getUserByIdInput.id);
  }

  @UseGuards(AtGuard)
  @Mutation(() => UserMutationOutput, { name: 'editUserProfile' })
  async editUserProfile(
    @Args('editUserProfileInput') editUserProfileInput: EditUserProfileDto,
    @AuthUser('sub') id: number,
  ): Promise<UserMutationOutput> {
    return await this.usersService.editUserProfile(id, editUserProfileInput);
  }

  @UseGuards(AtGuard)
  @Mutation(() => UserMutationOutput, { name: 'deleteUserAccount' })
  async deleteUserAccount(
    @AuthUser('sub') id: number,
  ): Promise<UserMutationOutput> {
    return await this.usersService.deleteUserAccount(id);
  }
}
