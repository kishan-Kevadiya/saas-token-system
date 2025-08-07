import { IsNumber, IsString } from "class-validator";

export class CounterResponseBodyDto {
  @IsString()
  counter: CounterFilterDto[];
}

export class CounterFilterDto {
  @IsString()
  id: string;

  @IsNumber()
  counter_no: number;

  @IsString()
  counter_name: string;
}
