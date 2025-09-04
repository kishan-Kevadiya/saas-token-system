import Api from "@/lib/api";
import DbSyncService from "./db-sync.service";
import { HttpStatusCode } from "axios";
import { CustomResponse } from "@/types/common.type";
import { NextFunction, Request } from "express";

export default class DbSyncController extends Api {
  private readonly dbSyncService: DbSyncService;

  constructor(dbSyncService?: DbSyncService) {
    super();
    this.dbSyncService = dbSyncService ?? new DbSyncService();
  }

public syncDatabase = async (
  req: Request,
  res: CustomResponse<void>,
  next: NextFunction
): Promise<void> => {
  try {
    await this.dbSyncService.syncDatabase();
    this.send(res, null, HttpStatusCode.Ok, "Database synced successfully");
  } catch (error) {
    this.send(res, null, HttpStatusCode.InternalServerError, "Failed to sync database");
  }
};

}
