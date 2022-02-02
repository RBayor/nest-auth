import { Expose } from 'class-transformer';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  password: string;
}

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}
