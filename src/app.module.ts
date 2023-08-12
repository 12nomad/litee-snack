import { MailerModule } from '@nestjs-modules/mailer';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AtGuard } from './auth/guards';
import { AtStrategy } from './auth/strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('test', 'production', 'development'),
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.string().required(),
        JWT_PRIVATE: Joi.string().required(),
        JWT_PUBLIC: Joi.string().required(),
        ACCESS_TOKEN_TTL: Joi.string().required(),
        REFRESH_TOKEN_TTL: Joi.string().required(),
        SUBSCRIPTION_TOKEN_TTL: Joi.string().required(),
        GMAIL_APP_PASSWORD: Joi.string().required(),
        GMAIL_APP_USER: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cache: 'bounded',
      cors: {
        origin: true,
        credentials: true,
      },
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (_, socket) => {
            return {
              req: {
                cookies: socket.upgradeReq.headers.cookie,
              },
            };
          },
        },
      },
      context: ({ req, res }) => {
        return { req, res };
      },
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
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
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    UsersModule,
    AuthModule,
    ShopsModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
  providers: [
    AtStrategy,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
