// import LanguageService from '../language.service';
// import prisma from '@/lib/prisma';
// import { HttpNotFoundError } from '@/lib/errors';

// jest.mock('@/lib/prisma', () => ({
//   ht_company: {
//     findUnique: jest.fn(),
//   },
//   ht_company_languages: {
//     findMany: jest.fn(),
//   },
// }));

// describe('LanguageService', () => {
//   const service = new LanguageService();

//   const mockCompanyId = 'company_hash_123';
//   const mockCompanyDbResult = { id: 101 };

//   const mockLanguageDbResult = [
//     {
//       hash_id: 'comp_lang_hash_1',
//       languages: {
//         hash_id: 'lang_hash_1',
//         name: 'English',
//         code: 'en',
//         title: 'EN',
//       },
//     },
//     {
//       hash_id: 'comp_lang_hash_2',
//       languages: {
//         hash_id: 'lang_hash_2',
//         name: 'Hindi',
//         code: 'hi',
//         title: 'HI',
//       },
//     },
//   ];

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return languages successfully', async () => {
//     (prisma.ht_company.findUnique as jest.Mock).mockResolvedValue(
//       mockCompanyDbResult
//     );
//     (prisma.ht_company_languages.findMany as jest.Mock).mockResolvedValue(
//       mockLanguageDbResult
//     );

//     const result = await service.getLanguagesByCompanyId(mockCompanyId);

//     expect(prisma.ht_company.findUnique).toHaveBeenCalledWith({
//       where: {
//         hash_id: mockCompanyId,
//         deleted_at: null,
//       },
//       select: { id: true },
//     });

//     expect(prisma.ht_company_languages.findMany).toHaveBeenCalledWith({
//       where: {
//         company_id: mockCompanyDbResult.id,
//         deleted_at: null,
//       },
//       select: {
//         hash_id: true,
//         languages: {
//           select: {
//             hash_id: true,
//             name: true,
//             code: true,
//             title: true,
//           },
//         },
//       },
//       orderBy: {
//         languages: {
//           name: 'asc',
//         },
//       },
//     });

//     expect(result).toEqual([
//       { id: 'lang_hash_1', name: 'English', code: 'en', title: 'EN' },
//       { id: 'lang_hash_2', name: 'Hindi', code: 'hi', title: 'HI' },
//     ]);
//   });

//   it('should map languages response to Dto', () => {
//     const result = (service as any).mapLanguagesToDto(mockLanguageDbResult);

//     expect(result).toEqual([
//       { id: 'lang_hash_1', name: 'English', code: 'en', title: 'EN' },
//       { id: 'lang_hash_2', name: 'Hindi', code: 'hi', title: 'HI' },
//     ]);
//   });

//   it('should throw error if company is not found', async () => {
//     (prisma.ht_company.findUnique as jest.Mock).mockResolvedValue(null);

//     await expect(
//       service.getLanguagesByCompanyId(mockCompanyId)
//     ).rejects.toThrow(new HttpNotFoundError('Company not found'));
//   });

//   it('should throw error if no languages are found', async () => {
//     (prisma.ht_company.findUnique as jest.Mock).mockResolvedValue(
//       mockCompanyDbResult
//     );
//     (prisma.ht_company_languages.findMany as jest.Mock).mockResolvedValue([]);

//     await expect(
//       service.getLanguagesByCompanyId(mockCompanyId)
//     ).rejects.toThrow(
//       new HttpNotFoundError('No languages found for this company')
//     );
//   });
// });
