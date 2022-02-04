import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../user.entity';
import { UsersService } from '../users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let fakeUserService: Partial<UsersService>;
  let service: AuthService;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('can create a new user with salted and hashed password', async () => {
    const user = await service.signup('a@a.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email in use', async (done) => {
    await service.signup('asdf@asdf', 'asdf');

    try {
      await service.signup('asdf@asdf', 'asdf');
    } catch (err) {
      done();
    }
  });

  it('throws if sign in is called with an unused email', async (done) => {
    try {
      await service.signin('dasd@dasd', 'dasdasa');
    } catch (e) {
      done();
    }
  });

  it('throws if an invalid password is provided', async (done) => {
    await service.signup('afsda@dfsdf.com', 'sada11');

    try {
      await service.signin('afsda@dfsdf.com', 'sada');
    } catch (e) {
      done();
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('a@a.com', '12345678');
    const user = await service.signin('a@a.com', '12345678');

    expect(user).toBeDefined();
  });
});
