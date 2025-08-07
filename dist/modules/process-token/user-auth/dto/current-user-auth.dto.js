"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = exports.UserDepartmentDto = exports.UserCompanyDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UserCompanyDto {
    id;
    hash_id;
    company_name;
}
exports.UserCompanyDto = UserCompanyDto;
__decorate([
    (0, class_validator_1.IsNumber)()
], UserCompanyDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], UserCompanyDto.prototype, "hash_id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], UserCompanyDto.prototype, "company_name", void 0);
class UserDepartmentDto {
    id;
    dept_english_name;
    dept_hindi_name;
    dept_regional_name;
}
exports.UserDepartmentDto = UserDepartmentDto;
__decorate([
    (0, class_validator_1.IsString)()
], UserDepartmentDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], UserDepartmentDto.prototype, "dept_english_name", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], UserDepartmentDto.prototype, "dept_hindi_name", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], UserDepartmentDto.prototype, "dept_regional_name", void 0);
class UserResponseDto {
    id;
    name;
    email;
    contact_no;
    username;
    data;
    counter;
    ip;
    is_active;
    company;
    department;
    created_at;
    updated_at;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, class_validator_1.IsNumber)()
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], UserResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], UserResponseDto.prototype, "contact_no", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], UserResponseDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
], UserResponseDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)()
], UserResponseDto.prototype, "counter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], UserResponseDto.prototype, "ip", void 0);
__decorate([
    (0, class_validator_1.IsNumber)()
], UserResponseDto.prototype, "is_active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserCompanyDto)
], UserResponseDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserDepartmentDto)
], UserResponseDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsDate)()
], UserResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)()
], UserResponseDto.prototype, "updated_at", void 0);
//# sourceMappingURL=current-user-auth.dto.js.map