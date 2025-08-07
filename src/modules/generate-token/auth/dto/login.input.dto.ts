import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInputDto {
  @IsString()
  @IsNotEmpty()
  asccode: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
