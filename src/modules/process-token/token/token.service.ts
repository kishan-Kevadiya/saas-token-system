import {
  TokenStatus,
  TransferTokenMethod,
  TransferTokenWise,
} from '@prisma/client';
// import EmailNotificationService from '../email-notifications/email-notifications.service';
import { type UserResponseDto } from '../user-auth/dto/current-user-auth.dto';
import { type tokenStatusUpdateDto } from './dto/token-update-status-input.dto';
import { type tokenDto } from './dto/token.dto';
import socketService from '@/socket/socket.service';
import {
  CompanyTokenManager,
  type ITokenData,
} from '@/utils/redis-token-manager';
import prisma from '@/lib/prisma';
import { HttpBadRequestError } from '@/lib/errors';
import { SocketNamespace } from '@/enums/socket.enum';

export default class TokenService {

private getTimeDifference(fromTimeStr: string, toTimeStr?: string): string {
  const parse = (str: string): Date => {
    const cleaned = str.replace(/(\.\d{3})\d{3}/, '$1'); 
    return new Date(cleaned.replace(' ', 'T') + 'Z'); 
  };

  const fromTime = parse(fromTimeStr);
  const toTime = toTimeStr ? parse(toTimeStr) : new Date();

  let diffMs = toTime.getTime() - fromTime.getTime();
  if (diffMs < 0) diffMs = 0;

  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

private addTimeStrings(time1: string, time2: string): string {
  const [h1, m1, s1] = time1.split(':').map(Number);
  const [h2, m2, s2] = time2.split(':').map(Number);

  let seconds = s1 + s2;
  let minutes = m1 + m2 + Math.floor(seconds / 60);
  let hours = h1 + h2 + Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}



  private async updateToken(
    tokenId: string,
    status: TokenStatus,
    reason?: string,
    timeTaken?: string
  ): Promise<any> {
    const now = new Date();
    const updateData: any = {
      token_status: status,
      updated_at: now,
      ...(reason && { reason }),
      ...(timeTaken && { time_taken: timeTaken }),
    };

    if (status === TokenStatus.ACTIVE) updateData.hold_out_time = now;
    if (status === TokenStatus.HOLD) updateData.hold_in_time = now;
    if (status === TokenStatus.COMPLETED) updateData.token_out_time = now;

    const updated = await prisma.tokens.update({
      where: { hash_id: tokenId },
      data: updateData,
      select: {
        hash_id: true,
        token_status: true,
        company_id: true,
        counter_number_id: true,
        company: {
          select: {
            hash_id: true,
          },
        },
        series_id: true,
        token_calling_time: true,
        token_out_time: true,
        hold_in_time: true,
        hold_out_time: true,
        user_id: true,
        reason: true,
        ht_user: { select: { name: true } },
      },
    });

    const tokenManager = new CompanyTokenManager(updated.company.hash_id);
    await tokenManager.updateToken(updated.hash_id, {
      token_id: updated.hash_id,
      token_status: updated.token_status,
      ...(timeTaken && { time_taken: timeTaken }),
    });

    const roomName = `company:${updated.company_id}:series:${updated.series_id}`;
    this.emitRoomRefresh(tokenId, roomName);

    return {
      id: updated.hash_id,
      token_status: updated.token_status,
      reason: updated.reason,
      company_id: updated.company_id,
      counter_no: updated.counter_number_id,
      user_id: updated.user_id,
      user_name: updated.ht_user?.name ?? null,
      hold_in_time: updated.hold_in_time,
      hold_out_time: updated.hold_out_time,
      token_calling_time: updated.token_calling_time,
      token_out_time: updated.token_out_time,
    };
  }

  private async transferToken(
    tokenId: string,
    tokenManager: CompanyTokenManager,
    currentUser: UserResponseDto,
    transferDepartmentId?: string | undefined,
    transferCounterId?: string
  ) {
    console.log('currentUser ', currentUser);
    const {
      counter_details: { hash_id: counterHashId, id: counterId },
      company: { hash_id: companyHashId, id: companyId },
    } = currentUser;

    const [
      counterSettings,
      tokenDetails,
      departmentDetails,
      transferCounterDetails,
    ] = await Promise.all([
      prisma.ht_counter_filter.findFirst({
        where: { hash_id: counterHashId, deleted_at: null },
        select: {
          id: true,
          hash_id: true,
          counter_no: true,
          transfer_token_wise: true,
          transfer_token_method: true,
          transfer_counter_id: true,
          transfer_department_id: true,
          transfer_counter: {
            select: {
              id: true,
              hash_id: true,
              counter_no: true,
            },
          },
          department: {
            select: {
              id: true,
              hash_id: true,
              dept_english_name: true,
              dept_regional_name: true,
            },
          },
        },
      }),
      prisma.tokens.findUniqueOrThrow({
        where: { hash_id: tokenId, deleted_at: null },
        select: {
          id: true,
          token_series: {
            select: { hash_id: true, id: true },
          },
        },
      }),
      transferDepartmentId
        ? prisma.ht_department.findUniqueOrThrow({
          where: { hash_id: transferDepartmentId, deleted_at: null },
          select: {
            id: true,
            hash_id: true,
            dept_english_name: true,
            dept_regional_name: true,
          },
        })
        : Promise.resolve(null),
      transferCounterId
        ? prisma.ht_counter_filter.findUniqueOrThrow({
          where: { hash_id: transferCounterId, deleted_at: null },
          select: { id: true, hash_id: true, counter_no: true },
        })
        : Promise.resolve(null),
    ]);

    if (!counterSettings) {
      throw new Error('Counter settings not found.');
    }

    const tokenUpdateData: any = {
      token_status: TokenStatus.TRANSFER,
      updated_at: new Date(),
    };

    const redisUpdateData: Partial<ITokenData> = {
      token_id: tokenId,
      token_status: TokenStatus.TRANSFER,
    };

    if (counterSettings.transfer_token_wise === TransferTokenWise.COUNTER) {
      if (
        counterSettings.transfer_token_method === TransferTokenMethod.DIRECT
      ) {
        tokenUpdateData.token_transfer_counter_id =
          counterSettings.transfer_counter_id;
        redisUpdateData.transfer_counter = {
          id: counterSettings.transfer_counter?.id!,
          hash_id: counterSettings.transfer_counter?.hash_id!,
          counter_no: counterSettings.transfer_counter?.counter_no!,
        };
      } else {
        if (!transferCounterDetails) {
          throw new HttpBadRequestError('Transfer counter details not found.');
        }
        tokenUpdateData.token_transfer_counter_id = transferCounterDetails.id;
        redisUpdateData.transfer_counter = {
          id: transferCounterDetails.id,
          hash_id: transferCounterDetails.hash_id,
          counter_no: transferCounterDetails.counter_no,
        };
      }
    } else if (
      counterSettings.transfer_token_wise === TransferTokenWise.DEPARTMENT
    ) {
      if (
        counterSettings.transfer_token_method === TransferTokenMethod.DIRECT
      ) {
        tokenUpdateData.token_transfer_department_id =
          counterSettings.transfer_department_id;
        redisUpdateData.transfer_department = {
          id: counterSettings.department.id,
          hash_id: counterSettings.department.hash_id,
          name:
            counterSettings.department.dept_english_name ??
            counterSettings.department.dept_regional_name,
        };
      } else {
        if (!departmentDetails) {
          throw new HttpBadRequestError(
            'Transfer department details not found.'
          );
        }
        tokenUpdateData.token_transfer_department_id = departmentDetails?.id;
        redisUpdateData.transfer_department = {
          id: departmentDetails.id,
          hash_id: departmentDetails.hash_id,
          name:
            departmentDetails.dept_english_name ??
            departmentDetails.dept_regional_name,
        };
      }
    } else {
      throw new Error('Invalid transfer_token_wise setting.');
    }

    await prisma.tokens.update({
      where: { id: tokenDetails.id },
      data: {
        ...tokenUpdateData,
      },
    });

    await tokenManager.updateToken(tokenId, {
      token_id: tokenId,
      ...redisUpdateData,
    });

    const roomName = `company:${companyId}:series:${tokenDetails.token_series.id}`;
    this.emitRoomRefresh(tokenId, roomName);
  }

  private emitRoomRefresh(
    tokenId: string,
    roomName: string,
    message: string = 'add token'
  ): void {
    socketService.emitToRoom(
      roomName,
      'refresh',
      {
        token_id: tokenId,
        message,
      },
      `/${SocketNamespace.PROCESS_TOKEN}`
    );
  }

  public async updateTokenStatus(
    data: tokenStatusUpdateDto,
    currentUser: UserResponseDto,
    tokenId?: string
  ): Promise<tokenDto | any> {
    const tokenManager = new CompanyTokenManager(
      currentUser.company.hash_id,
      currentUser.counter_details.hash_id
    );

    let tokenDetails: any = null;
    console.log("tokenId", tokenId)
    if (tokenId) {
      tokenDetails = await prisma.tokens.findUniqueOrThrow({
        where: {
          hash_id: tokenId,
          deleted_at: null,
        }
      });
    }

    switch (data.status) {
      case 'NEXT':
        const counterDetail = await prisma.ht_counter_filter.findUniqueOrThrow({
          where: {
            hash_id: currentUser.counter_details.hash_id,
            deleted_at: null,
          },
          select: {
            id: true,
            transfer_token_next_click: true,
            company: {
              select: {
                logo_url: true,
                ht_button_settings: {
                  select: {
                    minutes_of_calling_before: true,
                  },
                },
              },
            },
          },
        });
        
        if (!counterDetail.transfer_token_next_click) {

          if (tokenDetails) {
            const timeDiff = this.getTimeDifference((tokenDetails.hold_out_time ? tokenDetails.hold_out_time : tokenDetails.token_calling_time).toISOString());
            const timeTaken = this.addTimeStrings(
              tokenDetails.time_taken,
              timeDiff
            );
            await prisma.tokens.update({
              where: {
                id: tokenDetails.id,
              },
              data: {
                token_status: TokenStatus.COMPLETED,
                token_out_time: new Date(),
                time_taken: timeTaken,
                updated_at: new Date(),
              },
            });

            await tokenManager.updateToken(tokenDetails.hash_id, {
              token_status: TokenStatus.COMPLETED,
              token_out_time: new Date(),
              time_taken: timeTaken,
            });

            const roomName = `company:${currentUser.company.id}:series:${tokenDetails.series_id}`;
            this.emitRoomRefresh(tokenDetails.hash_id, roomName);
          }

          if (data.transfered_token_id) {
            tokenDetails = await prisma.tokens.findUnique({
              where: {
                hash_id: data.transfered_token_id,
                deleted_at: null,
              },
              select: {
                id: true,
                series_id: true,
              },
            });

            if (!tokenDetails) {
              throw new HttpBadRequestError(
                'Transfered token not found!'
              );

            }

            await prisma.tokens.update({
              where: {
                id: tokenDetails.id,
              },
              data: {
                token_status: TokenStatus.ACTIVE,
                token_calling_time: new Date(),
                updated_at: new Date(),
              },
            });

            await tokenManager.updateToken(data.transfered_token_id, {
              token_status: TokenStatus.ACTIVE,
              token_out_time: new Date(),
              counter: {
                id: currentUser.counter_details.id,
                hash_id: currentUser.counter_details.hash_id,
                counter_no: currentUser.counter_details.counter_no,
              }
            });

            const roomName = `company:${currentUser.company.id}:series:${tokenDetails.series_id}`;
            this.emitRoomRefresh(data.transfered_token_id, roomName);

            const transferedCallingToken = await tokenManager.getTokenById(
              data.transfered_token_id
            );

            return {
              token: transferedCallingToken
            }
          }

          const tokenData: ITokenData[] = await tokenManager.priorityTokens(data.filter_series_id);
          if (tokenData.length === 0) {
            return tokenData;
          }

          const priorityToken = tokenData[0];
          let nextPriorityToken: ITokenData | null = null;
          if (tokenData.length > 1) {
            nextPriorityToken = tokenData[1];
          }

          const clonePriorityToken = structuredClone(priorityToken);
          clonePriorityToken.token_status = TokenStatus.ACTIVE;
          clonePriorityToken.token_calling_time = new Date();
          clonePriorityToken.counter = {
            id: currentUser.counter_details.id,
            hash_id: currentUser.counter_details.hash_id,
            counter_no: currentUser.counter_details.counter_no,
          };

          await tokenManager.updateToken(
            clonePriorityToken.token_id,
            clonePriorityToken
          );

          await prisma.tokens.update({
            where: {
              hash_id: priorityToken.token_id,
            },
            data: {
              token_status: TokenStatus.ACTIVE,
              counter_number_id: currentUser.counter_details.id,
              token_calling_time: new Date(),
              updated_at: new Date(),
            },
          });

          const roomName = `company:${priorityToken.company.id}:series:${!priorityToken ? tokenDetails.series_id : priorityToken.series.id}`;
          this.emitRoomRefresh(clonePriorityToken.token_id, roomName);

          return {
            token: clonePriorityToken,
          };

        } else {
          if (!tokenId) {
            throw new HttpBadRequestError(
              'Transfer counter ID and token ID are required'
            );
          }
          await this.transferToken(
            tokenId,
            tokenManager,
            currentUser,
            data.transfer_department_id,
            data.transfer_counter_id
          );
        }
        break;

      case 'TRANSFER':
        if (!tokenId) {
          throw new HttpBadRequestError(
            'Transfer counter ID and token ID are required'
          );
        }
        await this.transferToken(
          tokenId,
          tokenManager,
          currentUser,
          data.transfer_department_id,
          data.transfer_counter_id
        );
        break;

      case 'PENDING': {
        if (tokenDetails.token_status !== TokenStatus.ACTIVE) {
          throw new HttpBadRequestError(
            'Only ACTIVE tokens can be moved to PENDING!'
          );
        }
        return await this.updateToken(
          tokenDetails.hash_id,
          TokenStatus.PENDING,
          data.reason
        );
      }

      case 'HOLD': {
        if (tokenDetails.token_status !== TokenStatus.ACTIVE) {
          throw new HttpBadRequestError(
            'Only ACTIVE tokens can be moved to HOLD!'
          );
        }

        const tokenDetail = await tokenManager.getTokenById(tokenDetails.hash_id);
        if (!tokenDetail || !tokenDetail.token_calling_time) {
          throw new HttpBadRequestError('Token not found!');
        }
        const timeDiff = this.getTimeDifference(tokenDetail.token_calling_time.toISOString())
        const timeTaken = this.addTimeStrings(
          tokenDetail.time_taken,
          timeDiff
        );

        return await this.updateToken(
          tokenDetails.hash_id,
          TokenStatus.HOLD,
          data.reason,
          timeTaken
        );
      }

      case 'BREAK': {
        if(!tokenDetails){
          return null
        } 
        if (tokenDetails.token_status !== TokenStatus.ACTIVE) {
          throw new HttpBadRequestError(
            'Only ACTIVE tokens can be marked as COMPLETED!'
          );
        }

        return await this.updateToken(
          tokenDetails.hash_id,
          TokenStatus.COMPLETED,
          data.reason
        );
      }

      case 'WAITING': {
        if (tokenDetails.token_status !== TokenStatus.PENDING) {
          throw new HttpBadRequestError(
            'Only PENDING tokens can be marked as WAITING!'
          );
        }

        return await this.updateToken(
          tokenDetails.hash_id,
          TokenStatus.WAITING,
          data.reason
        );
      }

      case 'ACTIVE': {
        if (tokenDetails.token_status !== TokenStatus.HOLD) {
          throw new HttpBadRequestError(
            'Only HOLD tokens can be marked as ACTIVE!'
          );
        }

        return await this.updateToken(
          tokenDetails.hash_id,
          TokenStatus.ACTIVE,
          data.reason
        );
      }

      default:
        throw new HttpBadRequestError(`Invalid status value: ${data.status}`);
    }
  }
}
