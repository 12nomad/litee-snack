import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserQueryOutput } from './entities/user-query-output.entity';
import { MutationOutput } from '../common/entities/mutation-output.entity';
import { EditUserProfileDto } from './dtos/edit-user-profile.dto';
import { GetUserByIdDto } from './dtos/get-user-by-id.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { name: 'getAuthUser', nullable: true })
  async getAuthUser(@AuthUser('sub') sub: number) {
    return await this.usersService.getAuthUser(sub);
  }

  @Query(() => UserQueryOutput, { name: 'getUserById' })
  async getUserById(
    @Args('getUserByIdInput') getUserByIdInput: GetUserByIdDto,
  ): Promise<UserQueryOutput> {
    return await this.usersService.getUserById(getUserByIdInput);
  }

  @Mutation(() => MutationOutput, { name: 'editUserProfile' })
  async editUserProfile(
    @Args('editUserProfileInput') editUserProfileInput: EditUserProfileDto,
    @AuthUser('sub') id: number,
  ): Promise<MutationOutput> {
    return await this.usersService.editUserProfile(id, editUserProfileInput);
  }

  @Mutation(() => MutationOutput, { name: 'deleteUserAccount' })
  async deleteUserAccount(
    @AuthUser('sub') id: number,
  ): Promise<MutationOutput> {
    return await this.usersService.deleteUserAccount(id);
  }
}
