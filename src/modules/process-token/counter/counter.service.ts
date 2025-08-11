// import { type CurrentUserDto } from '../auth/dto/current-user.dto';
import { UserResponseDto } from '../user-auth-old/dto/current-user-auth.dto';
import { CounterDropDownListDto } from './dto/counter-dropdown-list.dto';
import { type CounterResponseBodyDto } from './dto/counter.dto';
import prisma from '@/lib/prisma';

export default class CounterService {
  public async getCounterByCompanyId(
    currentUser: any
  ): Promise<CounterResponseBodyDto> {
    const counterResult = await prisma.ht_counter_filter.findMany({
      where: {
        company_id: currentUser.id,
        deleted_at: null,
      },
      select: {
        hash_id: true,
        counter_no: true,
        counter_name: true,
        transfer_token_wise: true,
        transfer_token_method: true,
      },
    });
    console.log('counterResult :>> ', counterResult);

    return {
      counter: counterResult.map((counter) => ({
        id: counter.hash_id,
        counter_no: counter.counter_no,
        counter_name: counter.counter_name,
        transfer_token_wise: counter.transfer_token_wise,
        transfer_token_method: counter.transfer_token_method
      })),
    };
  }
  public async counterListForDropDown(
    currentUser: UserResponseDto
  ): Promise<CounterDropDownListDto[]> {
    const counterDropDownList = await prisma.ht_counter_filter.findMany({
      where: {
        company_id: currentUser.company.id,
        is_logged_in: 1,
      },
      select: {
        hash_id: true,
        counter_name: true,
        counter_no: true,
      },
    });

    return counterDropDownList.map((counterList) => ({
      id: counterList.hash_id,
      counter_name: counterList.counter_name,
      counter_no: counterList.counter_no,
    }));
  }
}
