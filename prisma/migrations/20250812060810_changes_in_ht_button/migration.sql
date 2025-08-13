/*
  Warnings:

  - You are about to alter the column `name` on the `ht_buttons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Enum(EnumId(3))`.
  - A unique constraint covering the columns `[dept_id,name,company_id,deleted_at]` on the table `ht_buttons` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ht_buttons` MODIFY `name` ENUM('NEXT', 'HOLD', 'TRANSFER', 'BELL', 'BREAK', 'PENDING') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ht_buttons_dept_id_name_company_id_deleted_at_key` ON `ht_buttons`(`dept_id`, `name`, `company_id`, `deleted_at`);

-- AddForeignKey
ALTER TABLE `token_logs` ADD CONSTRAINT `token_logs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `ht_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
