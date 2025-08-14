import {
  TokenStatus,
  TransferTokenMethod,
  TransferTokenWise,
} from '@prisma/client';
import { type UserResponseDto } from '../user-auth/dto/current-user-auth.dto';
import { type TokenStatusUpdateDto } from './dto/token-update-status-input.dto';
import { type TokenDto } from './dto/token.dto';
import socketService from '@/socket/socket.service';
import {
  CompanyTokenManager,
  type ITokenData,
} from '@/utils/redis-token-manager';
import prisma from '@/lib/prisma';
import { HttpBadRequestError } from '@/lib/errors';
import { SocketNamespace } from '@/enums/socket.enum';

export default class TokenService {

  private checkTokenDelay(timeTaken: string, tokenCallingTime: Date, delaySeconds = 10): void {
  const totalSeconds = this.convertTimeTakenToSeconds(timeTaken);

  if (totalSeconds <= delaySeconds) {
    const currentTime = new Date(new Date().getTime() + totalSeconds * 1000);
    const tokenTime = new Date(tokenCallingTime);
    const newTime = new Date(tokenTime.getTime() + delaySeconds * 1000);

    if (currentTime < newTime) {
      const remainingSeconds = Math.ceil((newTime.getTime() - currentTime.getTime()) / 1000);
      throw new HttpBadRequestError(`Next token call after ${remainingSeconds} seconds`);
    }
  }
}

private convertTimeTakenToSeconds(timeTaken: string): number {
  const [hours, minutes, seconds] = timeTaken.split(":").map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}

  private getTimeDifference(
    fromTimeStr: Date | string,
    toTimeStr?: string
  ): string {
    const parse = (str: string): Date => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${str}`);
      }
      return date;
    };
    const fromTime = parse(
      typeof fromTimeStr === 'string' ? fromTimeStr : fromTimeStr.toISOString()
    );
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
    const hours = h1 + h2 + Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  private async updateToken(args: {
    tokenId: string;
    status: TokenStatus;
    currentUser: UserResponseDto;
    reason?: string;
    timeTaken?: string;
  }): Promise<any> {
    const now = new Date();
    const updateData: any = {
      token_status: args.status,
      updated_at: now,
      ...(args.reason && { reason: args.reason }),
      ...(args.timeTaken && { time_taken: args.timeTaken }),
    };

    const currentToken = await prisma.tokens.findUnique({
      where: { hash_id: args.tokenId },
      select: {
        company_id: true,
        counter_number_id: true,
        hash_id: true,
        token_status: true,
        updated_at: true,
        created_at: true,
        time_taken: true,
        token_calling_time: true,
        company: {
          select: {
            hash_id: true,
          },
        },
      },
    });

    if (!currentToken) {
      throw new HttpBadRequestError('Token not found!');
    }

    if(args.status !== TokenStatus.WAITING) {
      if( currentToken && currentToken.time_taken && currentToken.token_calling_time) {
         this.checkTokenDelay(currentToken.time_taken, currentToken.token_calling_time);
      }
    }

    if (args.status === TokenStatus.HOLD) updateData.hold_in_time = now;
    if (args.status === TokenStatus.COMPLETED) updateData.token_out_time = now;
    if (args.status === TokenStatus.WAITING) updateData.time_taken =  '00:00:00';

    if (args.status === TokenStatus.ACTIVE) {
      updateData.hold_out_time = now;
      updateData.token_calling_time = now;

      const existingActiveToken = await prisma.tokens.findFirst({
        where: {
          token_status: TokenStatus.ACTIVE,
          deleted_at: null,
          company_id: currentToken.company_id,
          counter_number_id: currentToken.counter_number_id,
          NOT: { hash_id: args.tokenId },
        },
        orderBy: { updated_at: 'desc' },
      });

      if (existingActiveToken && existingActiveToken.token_calling_time){
    
         this.checkTokenDelay(existingActiveToken.time_taken, existingActiveToken.token_calling_time);

        const timeDiff = this.getTimeDifference(
          existingActiveToken.hold_out_time
            ? existingActiveToken.hold_out_time
            : existingActiveToken.token_calling_time,
          now.toISOString()
        );

        const timeTaken = this.addTimeStrings(
          existingActiveToken.time_taken,
          timeDiff
        );

        const timeTakenForCurrentToken = this.getTimeDifference(
          existingActiveToken.updated_at
            ? existingActiveToken.updated_at
            : existingActiveToken.created_at,
          now.toISOString()
        );

        const previousToken = await prisma.$transaction(async (tx) => {
          const previousToken = await tx.tokens.update({
            where: {
              hash_id: existingActiveToken.hash_id,
            },
            data: {
              token_status: TokenStatus.COMPLETED,
              token_out_time: now,
              time_taken: timeTaken,
              updated_at: now,
            },
          });

          await tx.token_logs.create({
            data: {
              token_id: previousToken.id,
              previous_status: TokenStatus.ACTIVE,
              current_status: TokenStatus.COMPLETED,
              counter_id: args.currentUser.counter_details.id,
              company_id: args.currentUser.company.id,
              time_taken: timeTakenForCurrentToken,
              created_at: now,
              created_by: args.currentUser.id,
            },
          });

          return previousToken;
        });

        const tokenManager = new CompanyTokenManager(
          currentToken.company.hash_id
        );

        await tokenManager.updateToken(previousToken.hash_id, {
          time_taken: timeTaken,
          token_out_time: now,
          token_status: TokenStatus.COMPLETED,
        });
      }
    }
    const updated = await prisma.$transaction(async (tx) => {
      const updatedToken = await tx.tokens.update({
        where: { hash_id: args.tokenId },
        data: updateData,
        select: {
          hash_id: true,
          id: true,
          token_abbreviation: true,
          token_number: true,
          token_transfer_counter_id: true,
          token_date: true,
          priority: true,
          counter: {
            select: {
              hash_id: true,
              counter_no: true,
              counter_name: true,
            },
          },
          token_series_number: true,
          ht_language: {
            select: {
              name: true,
              hash_id: true,
            },
          },
          customer_mobile_number: true,
          customer_name: true,
          generate_token_time: true,
          ht_appointment_token_form_data: {
            select: {
              form_data: true,
            },
          },
          token_status: true,
          company_id: true,
          company: {
            select: {
              hash_id: true,
              company_name: true,
            },
          },
          time_taken: true,
          series_id: true,
          token_calling_time: true,
          token_out_time: true,
          bell_ring: true,
          bell_time: true,
          hold_in_time: true,
          hold_out_time: true,
          reason: true,
          ht_series: {
            select: {
              hash_id: true,
              series_english_name: true,
              series_hindi_name: true,
              series_regional_name: true,
              abbreviation: true,
            },
          },
          token_series: {
            select: {
              hash_id: true,
              series_english_name: true,
              series_hindi_name: true,
              series_regional_name: true,
              abbreviation: true,
            },
          },
          token_transfer_department: {
            select: {
              hash_id: true,
              dept_hindi_name: true,
              dept_english_name: true,
              dept_regional_name: true,
            },
          },
          ht_user: { select: { name: true, hash_id: true } },
        },
      });

      await tx.token_logs.create({
        data: {
          token_id: updatedToken.id,
          previous_status: currentToken.token_status,
          current_status: updatedToken.token_status,
          counter_id: args.currentUser.counter_details.id,
          company_id: updatedToken.company_id,
          time_taken: this.getTimeDifference(
            currentToken.updated_at
              ? currentToken.updated_at
              : currentToken.created_at,
            new Date().toISOString()
          ),
          created_by: args.currentUser.id,
        },
      });

      return updatedToken;
    });

    const tokenManager = new CompanyTokenManager(updated.company.hash_id);

    await tokenManager.updateToken(updated.hash_id, {
      token_id: updated.hash_id,
      token_status: updated.token_status,
      ...(args.timeTaken && { time_taken: args.timeTaken }),
      hold_out_time: updated.hold_out_time,
      hold_in_time: updated.hold_in_time,
    });

    const roomName = `company:${updated.company.hash_id}:series:${updated.token_series.hash_id}`;
    this.emitRoomRefresh(args.tokenId, roomName);

    return {
      token_id: updated.hash_id,
      token_status: updated.token_status,
      token_generate_time: updated.generate_token_time,
      token_abbreviation: updated.token_abbreviation,
      token_number: updated.token_number,
      token_date: updated.token_date,
      token_calling_time: updated.token_calling_time,
      token_out_time: updated.token_out_time,
      priority: updated.priority,
      company_id: updated.company.hash_id,
      language_id: updated.ht_language.hash_id,
      series_id: updated.token_series.hash_id,
      user_id: updated.ht_user ? updated.ht_user.hash_id : null,
      counter_id: updated.counter ? updated.counter.hash_id : null,
      transfer_counter_id: updated.counter ? updated.counter.hash_id : null,
      transfer_department_id: updated.token_transfer_department ? updated.token_transfer_department.hash_id : null,
      token_series_number: updated.token_series_number,
      customer_name: updated.customer_name,
      customer_mobile_number: updated.customer_mobile_number,
      hold_in_time: updated.hold_in_time,
      hold_out_time: updated.hold_out_time,
      time_taken: updated.time_taken,
      form_data: updated.ht_appointment_token_form_data?.[0]?.form_data ?? null
    };
  }

  private async transferToken(
    tokenId: string,
    tokenManager: CompanyTokenManager,
    currentUser: UserResponseDto,
    transferDepartmentId?: string | undefined,
    transferCounterId?: string
  ) {
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
          token_status: true,
          token_calling_time: true,
          created_at: true,
          updated_at: true,
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

    await prisma.$transaction(async (tx) => {
      await tx.tokens.update({
        where: { id: tokenDetails.id },
        data: {
          ...tokenUpdateData,
        },
      });

      await tx.token_logs.create({
        data: {
          token_id: tokenDetails.id,
          previous_status: tokenDetails.token_status,
          current_status: TokenStatus.TRANSFER,
          counter_id: counterId,
          company_id: companyId,
          time_taken: this.getTimeDifference(
            tokenDetails.updated_at
              ? tokenDetails.updated_at
              : tokenDetails.created_at,
            new Date().toISOString()
          ),
          created_at: new Date(),
          created_by: currentUser.id,
        },
      });
    });

    await tokenManager.updateToken(tokenId, {
      token_id: tokenId,
      ...redisUpdateData,
    });

    const roomName = `company:${currentUser.company.hash_id}:series:${tokenDetails.token_series.hash_id}`;
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
    data: TokenStatusUpdateDto,
    currentUser: UserResponseDto,
    tokenId?: string
  ): Promise<TokenDto | any> {
    const tokenManager = new CompanyTokenManager(
      currentUser.company.hash_id,
      currentUser.counter_details.hash_id
    );

    let tokenDetails: any = null;

    if (tokenId) {
      tokenDetails = await prisma.tokens.findUniqueOrThrow({
        where: {
          hash_id: tokenId,
          deleted_at: null,
        },
        include:{
          token_series: true,
        }
      });
      
       if (tokenDetails?.time_taken) {
            this.checkTokenDelay(tokenDetails.time_taken, tokenDetails.token_calling_time);
        }
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
                ht_company_settings: {
                  select: {
                    minutes_of_calling_before: true,
                  },
                },
              },
            },
          },
        });

        if (tokenDetails) {
          const timeDiff = this.getTimeDifference(
            (tokenDetails.hold_out_time
              ? tokenDetails.hold_out_time
              : tokenDetails.token_calling_time
            ).toISOString()
          );

          const timeTaken = this.addTimeStrings(
            tokenDetails.time_taken,
            timeDiff
          );

          const timeTakenForNextToken = this.getTimeDifference(
            tokenDetails.updated_at
              ? tokenDetails.updated_at
              : tokenDetails.created_at,
            new Date().toISOString()
          );

          await prisma.$transaction(async (tx) => {
            await tx.tokens.update({
              where: {
                id: tokenDetails.id,
              },
              data: {
                token_status: !counterDetail.transfer_token_next_click
                  ? TokenStatus.COMPLETED
                  : TokenStatus.TRANSFER,
                token_out_time: new Date(),
                time_taken: timeTaken,
                updated_at: new Date(),
              },
            });

            await tx.token_logs.create({
              data: {
                token_id: tokenDetails.id,
                previous_status: tokenDetails.token_status,
                current_status: !counterDetail.transfer_token_next_click
                  ? TokenStatus.COMPLETED
                  : TokenStatus.TRANSFER,
                counter_id: currentUser.counter_details.id,
                company_id: currentUser.company.id,
                time_taken: timeTakenForNextToken,
                created_at: new Date(),
                created_by: currentUser.id,
              },
            });
          });

          await tokenManager.updateToken(tokenDetails.hash_id, {
            token_status: TokenStatus.COMPLETED,
            token_out_time: new Date(),
            time_taken: timeTaken,
          });

          const roomName = `company:${currentUser.company.hash_id}:series:${tokenDetails.token_series.hash_id}`;
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
              token_series:{
                select: {
                  hash_id: true,
                }
              },
              created_at: true,
              updated_at: true,
            },
          });

          if (!tokenDetails) {
            throw new HttpBadRequestError('Transfered token not found!');
          }


         const updateTokenData = await prisma.$transaction(async (tx) => {
          const updateTokenData =  await tx.tokens.update({
              where: {
                id: tokenDetails.id,
              },
              data: {
                token_status: TokenStatus.ACTIVE,
                token_calling_time: new Date(),
                updated_at: new Date(),
                time_taken: "00:00:00"
              },
              select: {
                updated_at: true,
                id: true,
                time_taken: true,
                token_calling_time: true
              }
            });

            await tx.token_logs.create({
              data: {
                token_id: tokenDetails.id,
                previous_status: TokenStatus.ACTIVE,
                current_status: TokenStatus.TRANSFER,
                counter_id: currentUser.counter_details.id,
                company_id: currentUser.company.id,
                time_taken: this.getTimeDifference(
                  tokenDetails.updated_at
                    ? tokenDetails.updated_at
                    : tokenDetails.created_at,
                  new Date().toISOString()
                ),
                created_at: new Date(),
                created_by: currentUser.id,
              },
            });
            return updateTokenData
          });
          await tokenManager.updateToken(data.transfered_token_id, {
            token_status: TokenStatus.ACTIVE,
            token_out_time: new Date(),
            time_taken :  '00:00:00',
            updated_at : updateTokenData.updated_at,
            token_calling_time : updateTokenData.token_calling_time,
            counter: {
              id: currentUser.counter_details.id,
              hash_id: currentUser.counter_details.hash_id,
              counter_no: currentUser.counter_details.counter_no,
            },
          });

          const roomName = `company:${currentUser.company.hash_id}:series:${tokenDetails.token_series.hash_id}`;
          this.emitRoomRefresh(data.transfered_token_id, roomName);

          const transferedCallingToken = await tokenManager.getTokenById(
            data.transfered_token_id
          );

          return {
            token: transferedCallingToken,
          };
        }

        const tokenData: ITokenData[] = await tokenManager.priorityTokens(
          data.filter_series_id
        );
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
        clonePriorityToken.time_taken = '00:00:00',
        clonePriorityToken.counter = {
          id: currentUser.counter_details.id,
          hash_id: currentUser.counter_details.hash_id,
          counter_no: currentUser.counter_details.counter_no,
        };
        clonePriorityToken.updated_at = new Date();

        await tokenManager.updateToken(
          clonePriorityToken.token_id,
          clonePriorityToken
        );

        const timeTakenForNextToken = this.getTimeDifference(
          priorityToken.updated_at
            ? priorityToken.updated_at
            : priorityToken.created_at,
          new Date().toISOString()
        );

        await prisma.$transaction(async (tx) => {
          const updatedToken = await tx.tokens.update({
            where: {
              hash_id: priorityToken.token_id,
            },
            data: {
              token_status: TokenStatus.ACTIVE,
              counter_number_id: currentUser.counter_details.id,
              token_calling_time: new Date(),
              updated_at: new Date(),
              time_taken: '00:00:00'
            },
          });

          await tx.token_logs.create({
            data: {
              token_id: updatedToken.id,
              previous_status: priorityToken.token_status,
              current_status: TokenStatus.ACTIVE,
              counter_id: currentUser.counter_details.id,
              company_id: currentUser.company.id,
              time_taken: timeTakenForNextToken,
              created_at: new Date(),
              created_by: currentUser.id,
            },
          });
        });

        const roomName = `company:${priorityToken.company.hash_id}:series:${!priorityToken ? tokenDetails.series_id : priorityToken.series.hash_id}`;
        this.emitRoomRefresh(clonePriorityToken.token_id, roomName);

        return {
          token: clonePriorityToken,
        };

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
        return await this.updateToken({
          tokenId: tokenDetails.hash_id,
          status: TokenStatus.PENDING,
          currentUser,
        });
      }

      case 'HOLD': {
        if (tokenDetails.token_status !== TokenStatus.ACTIVE) {
          throw new HttpBadRequestError(
            'Only ACTIVE tokens can be moved to HOLD!'
          );
        }

        const tokenDetail = await tokenManager.getTokenById(
          tokenDetails.hash_id
        );
        if (!tokenDetail || !tokenDetail.token_calling_time) {
          throw new HttpBadRequestError('Token not found!');
        }
        const timeDiff = this.getTimeDifference(
          tokenDetail.hold_out_time
            ? (tokenDetail.time_taken === '00:00:00' ? tokenDetail.token_calling_time : tokenDetail.hold_out_time ) 
            : tokenDetail.token_calling_time
        );

        const timeTaken = this.addTimeStrings(tokenDetail.time_taken, timeDiff);

        return await this.updateToken({
          tokenId: tokenDetails.hash_id,
          status: TokenStatus.HOLD,
          currentUser,
          reason: data.reason,
          timeTaken,
        });
      }

      case 'BREAK': {
        if (!tokenDetails) {
          return null;
        }
        if (tokenDetails.token_status !== TokenStatus.ACTIVE) {
          throw new HttpBadRequestError(
            'Only ACTIVE tokens can be marked as COMPLETED!'
          );
        }

        return await this.updateToken({
          tokenId: tokenDetails.hash_id,
          status: TokenStatus.COMPLETED,
          currentUser,
        });
      }

      case 'WAITING': {
        if (tokenDetails.token_status !== TokenStatus.PENDING) {
          throw new HttpBadRequestError(
            'Only PENDING tokens can be marked as WAITING!'
          );
        }

        return await this.updateToken({
          tokenId: tokenDetails.hash_id,
          status: TokenStatus.WAITING,
          currentUser,
        });
      }

      case 'ACTIVE': {
        if (tokenDetails.token_status !== TokenStatus.HOLD) {
          throw new HttpBadRequestError(
            'Only HOLD tokens can be marked as ACTIVE!'
          );
        }

        return await this.updateToken({
          tokenId: tokenDetails.hash_id,
          status: TokenStatus.ACTIVE,
          currentUser,
        });
      }

      default:
        throw new HttpBadRequestError(`Invalid status value: ${data.status}`);
    }
  }
}
