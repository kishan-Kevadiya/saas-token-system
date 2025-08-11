/*
  Warnings:

  - You are about to alter the column `last_access` on the `ht_users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(6)` to `DateTime(0)`.
  - You are about to drop the `ht_button_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ht_button_settings` DROP FOREIGN KEY `ht_button_settings_company_id_fkey`;

-- DropForeignKey
ALTER TABLE `ht_button_settings` DROP FOREIGN KEY `ht_button_settings_language_id_fkey`;

-- AlterTable
ALTER TABLE `ht_counter_filter` ADD COLUMN `is_logged_in` TINYINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ht_series` ADD COLUMN `is_series_generate_type_apply` TINYINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ht_users` MODIFY `last_access` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `tokens` ADD COLUMN `time_taken` VARCHAR(70) NOT NULL DEFAULT '00:00:00';

-- DropTable
DROP TABLE `ht_button_settings`;

-- CreateTable
CREATE TABLE `ht_company_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `language_id` VARCHAR(255) NOT NULL,
    `view_style` TINYINT NOT NULL DEFAULT 0,
    `display_scroll` TINYINT NOT NULL DEFAULT 0,
    `series_selection` ENUM('SINGLE', 'MULTIPLE') NOT NULL DEFAULT 'SINGLE',
    `series_token_generate_type` ENUM('SharedTokenSeries', 'IndividualTokenSeries', 'RangeTokenGeneration') NOT NULL DEFAULT 'SharedTokenSeries',
    `srs_count` INTEGER NULL,
    `next_view` INTEGER NULL,
    `block_size` INTEGER NULL,
    `font_size` INTEGER NULL,
    `company_id` INTEGER NOT NULL,
    `minutes_of_calling_before` VARCHAR(100) NULL,
    `display_transfer_token` ENUM('WAITING_LIST', 'TRANSFER_LIST') NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_company_settings_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_user_session_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `counter_id` INTEGER NOT NULL,
    `login_time` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `logout_time` DATETIME(6) NULL,

    UNIQUE INDEX `ht_user_session_logs_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `counter_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `previous_status` ENUM('PENDING', 'HOLD', 'ACTIVE', 'TRANSFER', 'WAITING', 'COMPLETED') NOT NULL,
    `current_status` ENUM('PENDING', 'HOLD', 'ACTIVE', 'TRANSFER', 'WAITING', 'COMPLETED') NOT NULL,
    `time_taken` VARCHAR(50) NOT NULL,
    `token_id` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `created_by` INTEGER NOT NULL,

    UNIQUE INDEX `token_logs_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `print_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `setting_key` ENUM('NO_OF_PRINT_TOKEN', 'TOKEN_SPACE_BETWEEN_LINES', 'TOKEN_PWIDTH', 'TOKEN_PHEIGHT', 'DISPLAY_LOGO', 'LOGO_SIZE', 'LOGO_STARTPOS', 'ISSUE_DATE_TIME', 'ISSUE_DATE_TIME_SIZE', 'ISSUE_DATE_TIME_SPOS', 'DISPLAY_COMPANY_LOCATION', 'COMPANY_LOCATION_FONT_SIZE', 'COMPANY_LOCATION_POS', 'DISPLAY_COMPANY_TITLE', 'COMPANY_TITLE_FONT_SIZE', 'COMPANY_TITLE_POS', 'DISPLAY_DEPARTMENT_TITLE', 'DEPT_TITLE_SIZE', 'DEPT_TITLE_SPOS', 'DISPLAY_COUNTER_TITLE', 'COUNTER_TITLE_SIZE', 'COUNTER_TITLE_SPOS', 'TOKEN_NO_FONT_SIZE', 'TOKEN_NO_POS', 'TOKEN_TITLE_BEFORE_PRINT', 'HINDI_TOKEN_TITLE_BEFORE_PRINT', 'RLANGUAGE_TOKEN_TITLE_BEFORE_PRINT', 'TITLE_BEFORE_PRINT_TOKEN_NO_FONT_SIZE', 'TOKEN_TITLE_START_POS', 'DISPLAY_TOKEN_BARCODE', 'BARCODE_SIZE', 'BARCODE_STARTPOS', 'DISPLAY_WAITING_TOKEN_COUNT', 'LABEL_DISPLAY_WAITING_TOKEN', 'HINDI_LABEL_DISPLAY_WAITING_TOKEN', 'RLANGUAGE_LABEL_DISPLAY_WAITING_TOKEN', 'WAITING_TOKEN_LBL_FONT_SIZE', 'WAITING_TOKEN_START_POS', 'DISPLAY_WAITING_TOKEN_TIME', 'AVERAGE_WAITING_TIME', 'DISPLAY_TOKEN_WAITING_TIME', 'HINDI_DISPLAY_TOKEN_WAITING_TIME', 'RLANGUAGE_DISPLAY_TOKEN_WAITING_TIME', 'WAITING_TOKEN_TIME_FONT_SIZE', 'WAITING_TIME_START_POS', 'DISPLAY_FOOTER_1', 'FOOTER_1_TXT', 'HINDI_FOOTER_1_TXT', 'RLANGUAGE_FOOTER_1_TXT', 'FOOTER_1_SIZE', 'FOOTER_1_SPOS', 'DISPLAY_FOOTER_2', 'FOOTER_2_TXT', 'HINDI_FOOTER_2_TXT', 'RLANGUAGE_FOOTER_2_TXT', 'FOOTER_2_SIZE', 'FOOTER_2_SPOS', 'DISPLAY_FOOTER_3', 'FOOTER_3_TXT', 'HINDI_FOOTER_3_TXT', 'RLANGUAGE_FOOTER_3_TXT', 'FOOTER_3_SIZE', 'FOOTER_3_SPOS', 'DISPLAY_CAUTIONARY_TOKEN_MESSAGE', 'LBL_FOR_DISPLAY_TOKEN_CAUTIONARY', 'HINDI_LBL_FOR_DISPLAY_TOKEN_CAUTIONARY', 'RLANGUAGE_LBL_FOR_DISPLAY_TOKEN_CAUTIONARY', 'TOKEN_CAUTIONARY_SIZE', 'TOKEN_CAUTIONARY_POS', 'PRINTORDER', 'DISPLAY_WELCOME_TOKEN_MESSAGE', 'LBL_FOR_DISPLAY_TOKEN_WELCOME', 'HINDI_LBL_FOR_DISPLAY_TOKEN_WELCOME', 'RLANGUAGE_LBL_FOR_DISPLAY_TOKEN_WELCOME', 'TOKEN_WELCOME_SIZE', 'TOKEN_WELCOME_POS', 'LOGO_HEIGHT', 'LOGO_WIDTH', 'BARCODE_HEIGHT', 'BARCODE_WIDTH', 'WAITING_TIME_TYPE') NOT NULL,
    `setting_value` TEXT NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NOT NULL,

    UNIQUE INDEX `print_settings_hash_id_key`(`hash_id`),
    UNIQUE INDEX `print_settings_company_id_setting_key_key`(`company_id`, `setting_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ht_company_settings` ADD CONSTRAINT `ht_company_settings_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `ht_languages`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_company_settings` ADD CONSTRAINT `ht_company_settings_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_user_session_logs` ADD CONSTRAINT `ht_user_session_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `ht_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_user_session_logs` ADD CONSTRAINT `ht_user_session_logs_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_user_session_logs` ADD CONSTRAINT `ht_user_session_logs_counter_id_fkey` FOREIGN KEY (`counter_id`) REFERENCES `ht_counter_filter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_logs` ADD CONSTRAINT `token_logs_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_logs` ADD CONSTRAINT `token_logs_counter_id_fkey` FOREIGN KEY (`counter_id`) REFERENCES `ht_counter_filter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token_logs` ADD CONSTRAINT `token_logs_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `tokens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `print_settings` ADD CONSTRAINT `print_settings_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
