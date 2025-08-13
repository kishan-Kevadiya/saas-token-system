import prisma from '@/lib/prisma';

export default class JoinRoomService {
  public async getCouterService(hashId: string) {
    const counter = await prisma.ht_counter_filter.findUnique({
      where: {
        hash_id: hashId,
        deleted_at: null,
      },
      select: {
        company : {
          select : {
            hash_id: true
          }
        },
        series: true,
        id: true,
      },
    });

    if (!counter) throw Error('Counter not found!');

    const seriesIds = counter.series.split(',').map((id) => (Number(id)))

    const seriesData = await prisma.ht_series.findMany({
      where : {
        id : {
          in : seriesIds
        }
      },
      select: {
        hash_id: true
      }
    })

    return {
      id: counter.id,
      series_ids: seriesData.map((data)=> (data.hash_id)),
      company_id: counter.company.hash_id,
    };
  }
}
