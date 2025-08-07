"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenStatusUpdateDto = void 0;
const class_validator_1 = require("class-validator");
class tokenStatusUpdateDto {
    status;
    transfer_counter_id;
    transfer_department_id;
    reason;
}
exports.tokenStatusUpdateDto = tokenStatusUpdateDto;
__decorate([
    (0, class_validator_1.IsString)()
], tokenStatusUpdateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], tokenStatusUpdateDto.prototype, "transfer_counter_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], tokenStatusUpdateDto.prototype, "transfer_department_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], tokenStatusUpdateDto.prototype, "reason", void 0);
//# sourceMappingURL=token-update-status-input.dto.js.map