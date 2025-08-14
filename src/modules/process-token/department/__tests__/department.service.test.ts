import DepartmentService from '../department.service';
import { type UserResponseDto } from '../../user-auth/dto/current-user-auth.dto';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  ht_department: {
    findMany: jest.fn(),
  },
}));

describe('DepartmentService', () => {
  const service = new DepartmentService();

  const mockUser: UserResponseDto = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    company: {
      id: 101,
      hash_id: 'company_hash',
      company_name: 'Test Company',
    },
    department: {
      id: "202",
      dept_english_name: 'english_name',
      dept_hindi_name: 'hindi_name',
      dept_regional_name: 'regional_name',
    },
    contact_no: '7845122145',
    username: 'user_name',
    data: undefined,
    counter_details: null,
    ip: '21.21.1',
    is_active: 0,
    created_at: new Date(),
    updated_at: null,
  };

  const mockDbResponse = [
    {
      hash_id: 'dep_001',
      dept_english_name: 'Engineering',
      dept_hindi_name: 'इंजीनियरिंग',
      dept_regional_name: 'યાંત્રિક',
    },
    {
      hash_id: 'dep_002',
      dept_english_name: 'HR',
      dept_hindi_name: 'मानव संसाधन',
      dept_regional_name: 'માનવ સંસાધન',
    },
  ];

  it('should return formatted department list', async () => {
    (prisma.ht_department.findMany as jest.Mock).mockResolvedValue(
      mockDbResponse
    );

    const result = await service.getDepartment(mockUser);

    expect(prisma.ht_department.findMany).toHaveBeenCalledWith({
      where: {
        status: 1,
        company_id: 101
      },
      select: {
        hash_id: true,
        dept_english_name: true,
        dept_hindi_name: true,
        dept_regional_name: true,
      },
    });

    expect(result).toEqual([
      {
        id: 'dep_001',
        name: 'Engineering',
      },
      {
        id: 'dep_002',
        name: 'HR',
      },
    ]);
  });

  it('should return empty array when no departments found', async () => {
    (prisma.ht_department.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getDepartment(mockUser);
    expect(result).toEqual([]);
  });
});
