import {
  IsString,
  IsNumber,
  IsObject,
} from 'class-validator';

export class generateTokenUserCityDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class generateTokenUserStateDto {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class generateTokenUserMainCompanyDto {
  @IsString()
  id: string;

  @IsString()
  company_name: string;
}

export class CurrentUserDto {
  @IsNumber()
  id: number;

  @IsString()
  hash_id: string;

  @IsString()
  company_name: string;

  @IsString()
  fullname?: string | null;

  @IsString()
  email: string | null;

  @IsString()
  contact_no: string | null;

  @IsString()
  username: string | null;

  @IsString()
  latitude: string | null;

  @IsString()
  longitude: string | null;

  @IsObject()
  city: generateTokenUserCityDto | null;

  @IsObject()
  state: generateTokenUserStateDto | null;

  @IsObject()
  main_company: generateTokenUserMainCompanyDto | null;

  @IsNumber()
  appointment_generate: number;

  @IsNumber()
  saturday_off: number;

  @IsNumber()
  sunday_off: number;

  @IsNumber()
  is_generate_token_sms: number;

  @IsNumber()
  is_print_token: number;

  @IsNumber()
  is_download_token: number;

  @IsString()
  created_at: Date;

  @IsString()
  updated_at: string | null;
}
