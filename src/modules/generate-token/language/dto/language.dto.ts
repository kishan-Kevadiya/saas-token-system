import { IsString } from 'class-validator';

export class GenerateTokenlanguageDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  title: string;
}
