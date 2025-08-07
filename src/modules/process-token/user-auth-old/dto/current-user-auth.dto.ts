import { IsString, IsNumber, IsOptional, IsObject, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserCompanyDto {
  @IsNumber()
  id: number;

  @IsString()
  hash_id: string;

  @IsString()
  company_name: string;
}

export class UserDepartmentDto {
  @IsString()
  id: string;

  @IsString()
  dept_english_name: string;

  @IsString()
  dept_hindi_name: string;

  @IsString()
  dept_regional_name: string;
}

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  contact_no: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  data: any;

  @IsOptional()
  counter_details: any;

  @IsOptional()
  @IsString()
  ip: string;

  @IsNumber()
  is_active: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserCompanyDto)
  company: UserCompanyDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserDepartmentDto)
  department: UserDepartmentDto | null;

  @IsDate()
  created_at: Date;

  @IsOptional()
  @IsDate()
  updated_at: Date | null;
}
