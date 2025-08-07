import { IsString } from 'class-validator';

export class DepartmentDto {
  @IsString()
  id: string;

  @IsString()
  name: string | null;
}
