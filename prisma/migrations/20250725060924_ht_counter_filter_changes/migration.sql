/*
  Warnings:

  - You are about to drop the column `transfer_counter` on the `ht_counter_filter` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_department` on the `ht_counter_filter` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_token` on the `ht_counter_filter` table. All the data in the column will be lost.
  - You are about to alter the column `transfer_token_wise` on the `ht_counter_filter` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Enum(EnumId(1))`.
  - Added the required column `dept_id` to the `ht_buttons` table without a default value. This is not possible if the table is not empty.
  - Made the column `transfer_token_next_click` on table `ht_counter_filter` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ht_buttons` ADD COLUMN `dept_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ht_counter_filter` DROP COLUMN `transfer_counter`,
    DROP COLUMN `transfer_department`,
    DROP COLUMN `transfer_token`,
    ADD COLUMN `transfer_counter_id` INTEGER NULL,
    ADD COLUMN `transfer_department_id` INTEGER NULL,
    ADD COLUMN `transfer_token_method` ENUM('MANUAL', 'DIRECT') NULL,
    MODIFY `transfer_token_wise` ENUM('COUNTER', 'DEPARTMENT') NULL,
    MODIFY `transfer_token_next_click` TINYINT NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE `ht_counter_filter` ADD CONSTRAINT `ht_counter_filter_transfer_counter_id_fkey` FOREIGN KEY (`transfer_counter_id`) REFERENCES `ht_counter_settings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_counter_filter` ADD CONSTRAINT `ht_counter_filter_transfer_department_id_fkey` FOREIGN KEY (`transfer_department_id`) REFERENCES `ht_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_buttons` ADD CONSTRAINT `ht_buttons_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `ht_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
