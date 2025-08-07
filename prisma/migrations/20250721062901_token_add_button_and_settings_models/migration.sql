/*
  Warnings:

  - You are about to drop the column `token_series_id` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the `_ht_counter_filter_ht_department` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `series_id` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_ht_counter_filter_ht_department` DROP FOREIGN KEY `_ht_counter_filter_ht_department_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ht_counter_filter_ht_department` DROP FOREIGN KEY `_ht_counter_filter_ht_department_B_fkey`;

-- DropForeignKey
ALTER TABLE `tokens` DROP FOREIGN KEY `tokens_token_series_id_fkey`;

-- DropIndex
DROP INDEX `tokens_token_series_id_fkey` ON `tokens`;

-- AlterTable
ALTER TABLE `ht_company` ADD COLUMN `logo_url` TEXT NULL;

-- AlterTable
ALTER TABLE `tokens` DROP COLUMN `token_series_id`,
    ADD COLUMN `series_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_ht_counter_filter_ht_department`;

-- CreateTable
CREATE TABLE `ht_buttons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `dept_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_buttons_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_button_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `language_id` VARCHAR(255) NOT NULL,
    `view_style` TINYINT NOT NULL DEFAULT 0,
    `display_scroll` TINYINT NOT NULL DEFAULT 0,
    `service_selection` TINYINT NOT NULL DEFAULT 0,
    `srs_count` INTEGER NULL,
    `next_view` INTEGER NULL,
    `block_size` INTEGER NULL,
    `font_size` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `no_of_calling_before` VARCHAR(100) NULL,
    `display_transfer_token` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_button_settings_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `ht_series`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_counter_filter` ADD CONSTRAINT `ht_counter_filter_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `ht_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_buttons` ADD CONSTRAINT `ht_buttons_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `ht_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_buttons` ADD CONSTRAINT `ht_buttons_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_button_settings` ADD CONSTRAINT `ht_button_settings_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `ht_languages`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_button_settings` ADD CONSTRAINT `ht_button_settings_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
