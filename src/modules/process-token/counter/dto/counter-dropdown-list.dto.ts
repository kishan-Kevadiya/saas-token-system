import { IsNumber, IsString } from 'class-validator';

export class CounterDropDownListDto {
  @IsString()
  id: string;

  @IsString()
  counter_name: string;

  @IsNumber()
  counter_no: number;
}
