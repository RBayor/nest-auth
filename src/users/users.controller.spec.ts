import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth/auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) =>
        Promise.resolve({ id, email: '', password: '' } as User),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: '' }] as User[]),
      // remove: () => {},
      // update: () => {},
    };

    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUserService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find users with matching email', async () => {
    const users = await controller.findAllUsers('a@a.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('a@a.com');
  });

  it('findUser should find a user with given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
  });

  it('findUser throws error if id is not found', async (done) => {
    fakeUserService.findOne = () => null;

    try {
      await controller.findUser('1');
    } catch (e) {
      done();
    }
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: 5 };
    const user = await controller.siginin(
      {
        email: 'asdf@asdf.com',
        password: 'asdf',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toBe(1);
  });
});
