"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const series_service_1 = __importDefault(require("./series.service"));
const api_1 = __importDefault(require("../../../lib/api"));
class SeriesController extends api_1.default {
    seriesService;
    constructor(seriesService) {
        super();
        this.seriesService = seriesService ?? new series_service_1.default();
    }
    getSeries = async (req, res, next) => {
        try {
            const series = await this.seriesService.getTopLevelSeries(req.params.company_id, req.params.langauge_id);
            this.send(res, series, axios_1.HttpStatusCode.Ok, 'Series retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getSubSeries = async (req, res, next) => {
        try {
            const subSeriesData = await this.seriesService.getSubSeries(req.params.series_id, req.params.langauge_id);
            this.send(res, subSeriesData, axios_1.HttpStatusCode.Ok, 'Sub-series data retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = SeriesController;
//# sourceMappingURL=series.controller.js.map