import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // FIXME: you can also create your own custom scalar types => check docs
      // buildSchemaOptions: {
      //   numberScalarMode: 'integer', number type will be processed as Int not Float
      //   orphanedTypes: [] // FIXME: for ObjectType entity who are not called inside a constructor or any provider but we still need to be in the generated graphQL schema
      // },
    }),
    PrismaModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
