import prisma from "@/lib/prisma";
import { LoginInputDto } from "./dto/login.input.dto";
import LogMessage from "@/decorators/log-message.decorator";
import bcrypt from 'bcrypt';
import { generateJWTToken } from "@/utils/generate-jwt-token";
import { HttpBadRequestError } from "@/lib/errors";



export default class AuthService {


     private async fetchUserInfo(whereClause) {
    return await prisma.ht_company.findFirst({
      where: whereClause,
      include: {
        main_company: true,
        city: true,
        state: true
      }
    });
  }

  public mapUserResponse(user) {
    return {
      id: user.hash_id,
      company_name: user.company_name,
      fullname: user.fullname,
      email: user.email,
      contact_no: user.contact_no,
      username: user.username,
      latitude: user.latitude,
      longitude: user.longitude,
      city: user.city ? 
      {
        id: user.city.hash_id,
        name: user.city.name
      }
      : null,
      state: user.state ? 
      {
        id: user.state.hash_id,
        name: user.state.name
      }
      : null,
      main_company: user.main_company ? 
      {
        id: user.main_company.hash_id,
        company_name: user.main_company.company_name
      }
      : null,
      appointment_generate: user.appointment_generate,
      saturday_off: user.saturday_off,
      sunday_off: user.sunday_off,
      is_generate_token_sms: user.is_generate_token_sms,
      is_print_token: user.is_print_token,
      is_download_token: user.is_download_token,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

      @LogMessage<[LoginInputDto]>({
    message: 'Inside login method of AuthService',
  })
  public async login(data: LoginInputDto): Promise<any> {
    const userInfo = await this.fetchUserInfo({
      asccode: data.asccode,
      deleted_at: null,
    });

    if (!userInfo) {
        throw new HttpBadRequestError('Invalid credential')
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      userInfo.password
    );
    if (!isPasswordValid) {
      throw new HttpBadRequestError('Invalid credentials!', []);
    }

    const token = generateJWTToken({
      sub: userInfo.hash_id,
      asccode: userInfo.asccode,
    });

    return {
      token,
      user: this.mapUserResponse(userInfo),
    };
  }


    public async getUserDetailsByHashId(
    userId: string
  ): Promise<any> {
    const userInfo = await this.fetchUserInfo({
      hash_id: userId,
      deleted_at: null
    });

    if (!userInfo) {
      return null;
    }

    return this.mapUserResponse(userInfo);
  }
}
