import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'testing' ? '.env.test' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('testing', 'production'),
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.string().required(),
        JWT_PRIVATE: Joi.string().required(),
        JWT_PUBLIC: Joi.string().required(),
        ACCESS_TOKEN_TTL: Joi.string().required(),
        REFRESH_TOKEN_TTL: Joi.string().required(),
        GMAIL_APP_PASSWORD: Joi.string().required(),
        GMAIL_APP_USER: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      context: ({ req, res }) => ({ req, res }),
      cors: {
        origin: true,
        credentials: true,
      },
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // buildSchemaOptions: {
      //   numberScalarMode: 'integer', // number type will be processed as Int not Float in the schema
      //   orphanedTypes: []
      // },
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: process.env.GMAIL_APP_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}
