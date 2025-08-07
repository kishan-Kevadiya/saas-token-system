import { TokenStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class tokenDto {
  @IsString()
  id: string;

  @IsEnum(TokenStatus)
  token_status: TokenStatus;

  @IsNumber()
  counter_no: number | null;
}
