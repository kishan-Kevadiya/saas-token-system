import prisma from '@/lib/prisma';

export default class JoinRoomService {
  public async getCouterService(hashId: string) {
    const counter = await prisma.ht_counter_filter.findUnique({
      where: {
        hash_id: hashId,
        deleted_at: null,
      },
      select: {
        company_id: true,
        series: true,
        id: true,
      },
    });

    if (!counter) throw Error('Counter not found!');

    return {
      id: counter.id,
      series_ids: counter.series.split(','),
      company_id: counter.company_id,
    };
  }
}
