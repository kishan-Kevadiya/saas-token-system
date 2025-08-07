import { HttpBadRequestError } from "@/lib/errors";
import bcrypt from "bcrypt";
import { generateJWTToken } from "@/utils/generate-jwt-token";
import { LoginInputDto } from "./dto/login.input.dto";
import prisma from "@/lib/prisma";
import { CurrentUserDto } from "../company-auth/dto/current-user.dto";

export default class UserAuthService {
  private async fetchUserInfo(whereClause) {
    return await prisma.ht_users.findFirst({
      where: whereClause,
      include: {
        ht_company: {
          select:{
            id: true,
            hash_id: true,
            company_name: true
          },
          include: {
            ht_counter_filter: true,
          },
        },
        ht_department: true,
      },
    });
  }

  
  public mapUserResponse(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      contact_no: user.contact_no,
      username: user.username,
      data: user.data ?? null,
      counter: user.counter ?? null,
      ip: user.ip ?? null,
      is_active: user.is_active ?? 1,
      counter_id: user.counter_id,
      counter_details: {
        id: user.counter_details.id,
        hash_id: user.counter_details.hash_id,
        counter_name: user.counter_details.counter_name,
      },
      company: user.ht_company
        ? {
            id: user.ht_company.id,
            hash_id: user.ht_company.hash_id,
            company_name: user.ht_company.company_name,
          }
        : null,
      department: user.ht_department
        ? {
            id: user.ht_department.hash_id,
            english_name: user.ht_department.english_name,
            dept_hindi_name: user.ht_department.dept_hindi_name,
            dept_regional_name: user.ht_department.dept_regional_name,
          }
        : null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  public async login(
    data: LoginInputDto,
    currentUser: CurrentUserDto
  ): Promise<any> {
    const userInfo = await this.fetchUserInfo({
      username: data.username,
      company_id: currentUser.id,
      deleted_at: null,
    });

    const counterResult = await prisma.ht_counter_filter.findUniqueOrThrow({
      where: {
        hash_id: data.counter_id,
        company_id: currentUser.id,
        deleted_at: null,
      },

      select: {
        id: true,
        hash_id: true,
        counter_name: true
      },
    });

    if (!userInfo) {
      throw new HttpBadRequestError("Invalid credentials!");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      userInfo.password
    );
    if (!isPasswordValid) {
      throw new HttpBadRequestError("Invalid credentials!");
    }

    const token = generateJWTToken({
      sub: userInfo.hash_id,
      username: userInfo.username,
      counter_id: counterResult.hash_id,
    });

    return {
      token,
      user: this.mapUserResponse({...userInfo, counter_details: counterResult}),
    };
  }

  public async getUserDetailsByHashId(
    userId: string,
    counterId?: string
  ): Promise<any> {
    const userInfo = await this.fetchUserInfo({
      hash_id: userId,
      deleted_at: null,
    });

    console.log("calll ", userId, counterId)
    let counterResult;
    if (counterId) {
      counterResult = await prisma.ht_counter_filter.findUniqueOrThrow({
        where: {
          hash_id: counterId,
          deleted_at: null,
        },
        select: {
          id: true,
          hash_id: true,
          counter_name: true,
        },
      });
    }

    if (!userInfo) {
      return null;
    }

    return this.mapUserResponse({...userInfo, counter_details: counterResult});
  }
}
