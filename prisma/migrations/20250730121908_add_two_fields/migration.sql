-- AlterTable
ALTER TABLE `tokens` ADD COLUMN `hold_in_time` DATETIME(6) NULL,
    ADD COLUMN `hold_out_time` DATETIME(6) NULL;
