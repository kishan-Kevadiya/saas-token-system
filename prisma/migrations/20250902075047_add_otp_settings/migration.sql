-- AlterTable
ALTER TABLE `ht_counter_filter` ADD COLUMN `is_otp_restricted` TINYINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ht_series` ADD COLUMN `is_otp_required` TINYINT NOT NULL DEFAULT 0;
