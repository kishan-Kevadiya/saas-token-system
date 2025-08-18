import { IsNotEmpty, IsString } from 'class-validator';

export class GerateTokenInputDto {
  @IsString()
  @IsNotEmpty()
  asccode: string;

}
