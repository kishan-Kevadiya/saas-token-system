import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ForgotPasswordInputDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
