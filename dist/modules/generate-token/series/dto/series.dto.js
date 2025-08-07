"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateTokenSubSeriesResponseDto = exports.FormFieldDto = exports.GenerateTokenSeriesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GenerateTokenSeriesDto {
    id;
    series_name;
    series_image;
    display_form;
}
exports.GenerateTokenSeriesDto = GenerateTokenSeriesDto;
__decorate([
    (0, class_validator_1.IsString)()
], GenerateTokenSeriesDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], GenerateTokenSeriesDto.prototype, "series_name", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], GenerateTokenSeriesDto.prototype, "series_image", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], GenerateTokenSeriesDto.prototype, "display_form", void 0);
class FormFieldDto {
    id;
    field_name;
    field_type;
    is_required;
}
exports.FormFieldDto = FormFieldDto;
__decorate([
    (0, class_validator_1.IsString)()
], FormFieldDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], FormFieldDto.prototype, "field_name", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], FormFieldDto.prototype, "field_type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], FormFieldDto.prototype, "is_required", void 0);
class GenerateTokenSubSeriesResponseDto {
    id;
    sub_series_present;
    display_form;
    form_data;
    series;
}
exports.GenerateTokenSubSeriesResponseDto = GenerateTokenSubSeriesResponseDto;
__decorate([
    (0, class_validator_1.IsString)()
], GenerateTokenSubSeriesResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)()
], GenerateTokenSubSeriesResponseDto.prototype, "sub_series_present", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], GenerateTokenSubSeriesResponseDto.prototype, "display_form", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FormFieldDto)
], GenerateTokenSubSeriesResponseDto.prototype, "form_data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GenerateTokenSeriesDto)
], GenerateTokenSubSeriesResponseDto.prototype, "series", void 0);
//# sourceMappingURL=series.dto.js.map