"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const counter_service_1 = __importDefault(require("./counter.service"));
const api_1 = __importDefault(require("../../../lib/api"));
class CounterController extends api_1.default {
    counterService;
    constructor(counterService) {
        super();
        this.counterService = counterService ?? new counter_service_1.default();
    }
    getCounterByCompanyId = async (req, res, _next) => {
        try {
            console.log('res.locals.currentUser :>> ', res.locals.currentUser);
            const counter = await this.counterService.getCounterByCompanyId(res.locals.currentUser);
            this.send(res, counter, axios_1.HttpStatusCode.Ok, 'Counter data retrieved successfully.');
        }
        catch (e) {
            console.log('e :>> ', e);
            if (e.message === 'No ht_company found') {
                this.send(res, null, axios_1.HttpStatusCode.NotFound, 'Company not found!');
            }
            else {
                this.send(res, null, axios_1.HttpStatusCode.InternalServerError, 'An unexpected error occurred');
            }
        }
    };
}
exports.default = CounterController;
//# sourceMappingURL=counter.controller.js.map