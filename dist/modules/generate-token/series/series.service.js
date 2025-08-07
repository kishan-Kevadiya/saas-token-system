"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../../lib/errors");
const prisma_1 = __importDefault(require("../../../lib/prisma"));
class SeriesService {
    getTopLevelSeries = async (companyId, langaugeId) => {
        const [company, language] = await Promise.all([
            prisma_1.default.ht_company.findUnique({
                where: {
                    hash_id: companyId,
                    deleted_at: null,
                },
                select: { id: true },
            }),
            prisma_1.default.ht_languages.findUnique({
                where: {
                    hash_id: langaugeId,
                    deleted_at: null,
                },
            }),
        ]);
        if (!company) {
            throw new errors_1.HttpNotFoundError('Company not found');
        }
        if (!language) {
            throw new errors_1.HttpNotFoundError('Language not found');
        }
        const series = await prisma_1.default.ht_series.findMany({
            where: {
                comapany_id: company.id,
                deleted_at: null,
                parent_series_id: null,
                is_active: 1,
            },
            select: {
                hash_id: true,
                series_english_name: true,
                series_hindi_name: true,
                series_regional_name: true,
                series_image: true,
            },
        });
        return series.map((item) => ({
            id: item.hash_id,
            series_name: item[this.getLanguageField(language.name)],
            series_image: item.series_image ?? null,
        }));
    };
    getSubSeries = async (seriesId, langaugeId) => {
        const [parentSeries, language] = await Promise.all([
            prisma_1.default.ht_series.findUnique({
                where: {
                    hash_id: seriesId,
                    deleted_at: null,
                    is_active: 1,
                },
                select: {
                    id: true,
                    hash_id: true,
                    parent_series_id: true,
                    display_form: true,
                },
            }),
            prisma_1.default.ht_languages.findUnique({
                where: {
                    hash_id: langaugeId,
                    deleted_at: null,
                },
            }),
        ]);
        if (!parentSeries) {
            throw new errors_1.HttpNotFoundError('Parent series not found');
        }
        if (!language) {
            throw new errors_1.HttpNotFoundError('Language not found');
        }
        const subSeries = await this.getChildSeries(parentSeries.id);
        if (subSeries.length === 0) {
            return await this.handleNoSubSeries(parentSeries, language);
        }
        return this.buildSubSeriesResponse(parentSeries, subSeries, language);
    };
    getChildSeries = async (parentSeriesId) => {
        return await prisma_1.default.ht_series.findMany({
            where: {
                parent_series_id: parentSeriesId,
                deleted_at: null,
                is_active: 1,
            },
            select: {
                hash_id: true,
                series_english_name: true,
                series_hindi_name: true,
                series_regional_name: true,
                series_image: true,
                display_form: true,
            },
        });
    };
    async getFormFields(seriesId, language) {
        const formFields = await prisma_1.default.ht_series_input_fields.findMany({
            where: {
                series_id: seriesId,
                deleted_at: null,
            },
            select: {
                hash_id: true,
                field_english_name: true,
                field_hindi_name: true,
                field_regional_name: true,
                field_type: true,
                is_required: true,
            },
        });
        return formFields.map((field) => ({
            id: field.hash_id,
            field_name: field[this.getLanguageFormField(language.name)],
            field_type: field.field_type,
            is_required: field.is_required,
        }));
    }
    async handleNoSubSeries(parentSeries, language) {
        if (parentSeries.display_form === 1) {
            const formData = await this.getFormFields(parentSeries.id, language);
            return {
                id: parentSeries.hash_id,
                sub_series_present: false,
                display_form: 1,
                form_data: formData,
                series: null,
            };
        }
        return {
            id: parentSeries.hash_id,
            sub_series_present: false,
            display_form: 0,
            form_data: null,
            series: null,
        };
    }
    buildSubSeriesResponse(parentSeries, subSeries, language) {
        const seriesData = subSeries.map((data) => ({
            id: data.hash_id,
            series_name: data[this.getLanguageField(language.name)],
            series_image: data.series_image,
            display_form: data.display_form,
        }));
        return {
            id: parentSeries.hash_id,
            sub_series_present: true,
            display_form: parentSeries.display_form,
            form_data: null,
            series: seriesData,
        };
    }
    getLanguageField(language) {
        const name = language.toLowerCase();
        if (name === 'english')
            return 'series_english_name';
        if (name === 'hindi')
            return 'series_hindi_name';
        return 'series_regional_name';
    }
    getLanguageFormField(language) {
        const name = language.toLowerCase();
        if (name === 'english')
            return 'field_english_name';
        if (name === 'hindi')
            return 'field_hindi_name';
        return 'field_regional_name';
    }
}
exports.default = SeriesService;
//# sourceMappingURL=series.service.js.map