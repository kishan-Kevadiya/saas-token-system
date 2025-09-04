import { Router } from "express";
import DbSyncController from "./db-sync.controller";
import { verifyPublicRouteToken } from "@/middlewares/validate-public-route";

const dbSync: Router = Router();
const controller = new DbSyncController();

dbSync.post('/', controller.syncDatabase);

export default dbSync;
