"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserDto = exports.processTokenUserMainCompanyDto = exports.processTokenUserStateDto = exports.processTokenUserCityDto = void 0;
const class_validator_1 = require("class-validator");
class processTokenUserCityDto {
    id;
    name;
}
exports.processTokenUserCityDto = processTokenUserCityDto;
__decorate([
    (0, class_validator_1.IsString)()
], processTokenUserCityDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], processTokenUserCityDto.prototype, "name", void 0);
class processTokenUserStateDto {
    id;
    name;
}
exports.processTokenUserStateDto = processTokenUserStateDto;
__decorate([
    (0, class_validator_1.IsString)()
], processTokenUserStateDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], processTokenUserStateDto.prototype, "name", void 0);
class processTokenUserMainCompanyDto {
    id;
    company_name;
}
exports.processTokenUserMainCompanyDto = processTokenUserMainCompanyDto;
__decorate([
    (0, class_validator_1.IsString)()
], processTokenUserMainCompanyDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], processTokenUserMainCompanyDto.prototype, "company_name", void 0);
class CurrentUserDto {
    id;
    company_name;
    fullname;
    email;
    contact_no;
    username;
    latitude;
    longitude;
    city;
    state;
    main_company;
    appointment_generate;
    saturday_off;
    sunday_off;
    is_generate_token_sms;
    is_print_token;
    is_download_token;
    created_at;
    updated_at;
}
exports.CurrentUserDto = CurrentUserDto;
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "company_name", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "fullname", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "contact_no", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsObject)()
], CurrentUserDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsObject)()
], CurrentUserDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsObject)()
], CurrentUserDto.prototype, "main_company", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], CurrentUserDto.prototype, "appointment_generate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], CurrentUserDto.prototype, "saturday_off", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], CurrentUserDto.prototype, "sunday_off", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], CurrentUserDto.prototype, "is_generate_token_sms", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], CurrentUserDto.prototype, "is_print_token", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], CurrentUserDto.prototype, "is_download_token", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "created_at", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], CurrentUserDto.prototype, "updated_at", void 0);
//# sourceMappingURL=current-user.dto.js.map