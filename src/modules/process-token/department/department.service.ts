import { type UserResponseDto } from '../user-auth/dto/current-user-auth.dto';
import { type DepartmentDto } from './dto/department.dto';
import prisma from '@/lib/prisma';

export default class DepartmentService {
  public async getDepartment(
    currentUser: UserResponseDto
  ): Promise<DepartmentDto[]> {
    const department = await prisma.ht_department.findMany({
      where: {
        company_id: currentUser.company.id,
        status: 1,
      },
      select: {
        hash_id: true,
        dept_english_name: true,
        dept_hindi_name: true,
        dept_regional_name: true,
      },
    });

    return department.map((departments) => ({
      id: departments.hash_id,
      name: departments.dept_english_name,
    }));
  }
}
