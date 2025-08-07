-- DropForeignKey
ALTER TABLE `ht_counter_filter` DROP FOREIGN KEY `ht_counter_filter_transfer_counter_id_fkey`;

-- DropIndex
DROP INDEX `ht_counter_filter_transfer_counter_id_fkey` ON `ht_counter_filter`;

-- AlterTable
ALTER TABLE `ht_users` MODIFY `last_access` DATETIME(6) NULL;

-- AlterTable
ALTER TABLE `tokens` ADD COLUMN `token_transfer_department_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_token_transfer_department_id_fkey` FOREIGN KEY (`token_transfer_department_id`) REFERENCES `ht_department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_counter_filter` ADD CONSTRAINT `ht_counter_filter_transfer_counter_id_fkey` FOREIGN KEY (`transfer_counter_id`) REFERENCES `ht_counter_filter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
