import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';

jest.setTimeout(1000000);

const GRAPHQL_ENDPOINT = '/graphql';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let header: string[];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.reset();
  });

  afterAll(async () => {
    app.close();
  });

  describe('signup', () => {
    const mockSignupDto = {
      email: 'rharji2@gmail.com',
    };

    it('should create a new user account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              signup(
                signupInput: {
                  role: CLIENT
                  email: "${mockSignupDto.email}"
                  password: "123456"
                }
              ) {
                success
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.signup.success).toBe(true);
        });
    });

    it('should fail if user exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              signup(
                signupInput: {
                  role: CLIENT
                  email: "${mockSignupDto.email}"
                  password: "123456"
                }
              ) {
                success
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('E-mail is already used...');
        });
    });
  });

  describe('login', () => {
    const mockLoginDto = {
      email: 'rharji2@gmail.com',
      password: '123456',
    };

    it('should fail if e-mail not associated with any account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
            login(loginInput: { email: "fail@fail.com", password: "${mockLoginDto.password}" }) {
              success
            }
          }
        `,
        })
        .expect((res) => {
          expect(res.body.errors[0].message).toBe(
            'There is no account associated with that e-mail, please create an account before continuing...',
          );
        });
    });

    it('should fail if password is wrong', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(loginInput: { email: "${mockLoginDto.email}", password: "000000" }) {
                success
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.errors[0].message).toBe(
            'E-mail or password does not match...',
          );
        });
    });

    it('should login user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(loginInput: { email: "${mockLoginDto.email}", password: "${mockLoginDto.password}" }) {
                success
              }
            }
        `,
        })
        .expect((res) => {
          header = res.headers['set-cookie'];
          expect(res.body.data.login.success).toBe(true);
        });
    });
  });

  describe('getAuthUser', () => {
    it('should find auth user in the database', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Cookie', header)
        .send({
          query: `
            {
              getAuthUser {
                id
                role
                email
                password
                verified
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.data.getAuthUser).toBeTruthy();
        });
    });

    it('should throw an error if no auth user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
             {
              getAuthUser {
                id
                role
                email
                password
                verified
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.errors[0].message).toBe('Unauthorized');
        });
    });
  });

  describe('getUserById', () => {
    let userId: number | undefined;

    beforeAll(async () => {
      const user = await prisma.user.findFirst();
      userId = user?.id;
    });

    it('should find the user with specific id in the database', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Cookie', header)
        .send({
          query: `
            {
              getUserById(getUserByIdInput: { id: ${userId} }) {
                success
                data {
                  id
                  email
                  verified
                }
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.data.getUserById.success).toBe(true);
        });
    });
  });

  describe('emailVerification', () => {
    let verificationCode: string | undefined;

    beforeAll(async () => {
      const verification = await prisma.verification.findFirst();
      verificationCode = verification?.code;
    });

    it('should fail on invalid verification code', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              emailVerification(emailVerificationInput: { code: "xxxxxxxxxx" }) {
                success
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.errors[0].message).toBe(
            'Please enter a correct verification code...',
          );
        });
    });

    it('should succeed on valid verification code', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              emailVerification(emailVerificationInput: { code: "${verificationCode}" }) {
                success
              }
            }
        `,
        })
        .expect((res) => {
          expect(res.body.data.emailVerification.success).toBe(true);
        });
    });
  });
});
