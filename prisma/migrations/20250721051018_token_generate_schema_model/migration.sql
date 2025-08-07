-- CreateTable
CREATE TABLE `zones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `zones_hash_id_key`(`hash_id`),
    UNIQUE INDEX `zones_name_deleted_at_key`(`name`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `states` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `zone_id` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `states_hash_id_key`(`hash_id`),
    UNIQUE INDEX `states_name_deleted_at_key`(`name`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `districts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `state_id` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `districts_hash_id_key`(`hash_id`),
    UNIQUE INDEX `districts_name_deleted_at_key`(`name`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `city_categories_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `district_id` INTEGER NOT NULL,
    `city_category_id` INTEGER NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `cities_hash_id_key`(`hash_id`),
    UNIQUE INDEX `cities_name_district_id_deleted_at_key`(`name`, `district_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pin_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `pin_code` INTEGER NOT NULL,
    `city_id` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `pin_codes_hash_id_key`(`hash_id`),
    UNIQUE INDEX `pin_codes_pin_code_city_id_deleted_at_key`(`pin_code`, `city_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `constituency` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `description` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,
    `updated_by` INTEGER NULL,
    `deleted_by` INTEGER NULL,

    UNIQUE INDEX `constituency_hash_id_key`(`hash_id`),
    UNIQUE INDEX `constituency_name_deleted_at_key`(`name`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `constituency_pincodes` (
    `constituency_id` INTEGER NOT NULL,
    `pincode_id` INTEGER NOT NULL,

    PRIMARY KEY (`constituency_id`, `pincode_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `type` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `main_company_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `main_company_id` INTEGER NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `fullname` VARCHAR(255) NULL,
    `asccode` VARCHAR(125) NOT NULL,
    `email` VARCHAR(255) NULL,
    `contact_no` VARCHAR(255) NULL,
    `username` VARCHAR(125) NULL,
    `password` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(255) NULL,
    `latitude` VARCHAR(255) NULL,
    `longitude` VARCHAR(255) NULL,
    `sms_or_print` INTEGER NULL,
    `send_sms` INTEGER NULL,
    `appointment_generate` INTEGER NULL DEFAULT 0,
    `customer_register` INTEGER NULL DEFAULT 0,
    `state_id` INTEGER NULL,
    `city_id` INTEGER NULL,
    `saturday_off` TINYINT NOT NULL DEFAULT 0,
    `sunday_off` TINYINT NOT NULL DEFAULT 0,
    `app_hour` INTEGER NOT NULL DEFAULT 0,
    `parent_sub_series` TINYINT NOT NULL DEFAULT 0,
    `is_generate_token_sms` TINYINT NOT NULL DEFAULT 0,
    `generate_token_sms_url` TEXT NULL,
    `generate_token_sms_format` TEXT NULL,
    `is_print_token` BOOLEAN NULL,
    `is_download_token` BOOLEAN NULL,
    `token` VARCHAR(255) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_company_hash_id_key`(`hash_id`),
    UNIQUE INDEX `ht_company_asccode_email_contact_no_username_deleted_at_key`(`asccode`, `email`, `contact_no`, `username`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `dept_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `contact_no` VARCHAR(255) NOT NULL,
    `date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `email` VARCHAR(255) NOT NULL,
    `counter` VARCHAR(255) NULL,
    `ip` VARCHAR(255) NULL,
    `last_access` DATETIME(0) NULL,
    `show_report` VARCHAR(255) NULL,
    `is_active` TINYINT NOT NULL DEFAULT 1,
    `company_id` INTEGER NOT NULL,
    `rights` VARCHAR(50) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_users_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_languages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_languages_hash_id_key`(`hash_id`),
    UNIQUE INDEX `ht_languages_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_company_languages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `language_id` INTEGER NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_company_languages_hash_id_key`(`hash_id`),
    UNIQUE INDEX `ht_company_languages_company_id_language_id_deleted_at_key`(`company_id`, `language_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_series` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `series_english_name` VARCHAR(255) NOT NULL,
    `series_hindi_name` VARCHAR(255) NOT NULL,
    `series_regional_name` VARCHAR(255) NOT NULL,
    `comapany_id` INTEGER NOT NULL,
    `abbreviation` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `order` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL,
    `avg_waiting_time` INTEGER NULL,
    `start_token` INTEGER NULL,
    `end_token` INTEGER NULL,
    `parent_series_id` INTEGER NULL,
    `series_image` TEXT NULL,
    `start_time` VARCHAR(255) NULL,
    `end_time` VARCHAR(255) NULL,
    `slot_duration` INTEGER NULL,
    `total_counter` INTEGER NULL,
    `toke_per_slot` INTEGER NULL,
    `allow_future_appointment` INTEGER NULL,
    `allow_same_day_appointment` INTEGER NULL,
    `future_appointment_days` INTEGER NULL,
    `display_form` TINYINT NOT NULL DEFAULT 0,
    `is_active` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_series_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_counter_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `counter` INTEGER NULL,
    `height` VARCHAR(20) NOT NULL,
    `width` VARCHAR(20) NOT NULL,
    `counter_width` VARCHAR(20) NOT NULL,
    `font_size` VARCHAR(20) NOT NULL,
    `font_margin` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_counter_settings_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NULL,
    `dept_english_name` VARCHAR(255) NULL,
    `dept_hindi_name` TEXT NOT NULL,
    `dept_regional_name` TEXT NOT NULL,
    `allow_abbreviation` VARCHAR(255) NULL,
    `status` TINYINT NULL DEFAULT 0,
    `que` TINYINT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_department_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_series_input_fields` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `series_id` INTEGER NOT NULL,
    `field_english_name` VARCHAR(255) NOT NULL,
    `field_hindi_name` VARCHAR(255) NOT NULL,
    `field_regional_name` VARCHAR(255) NOT NULL,
    `field_type` VARCHAR(50) NOT NULL,
    `is_required` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_series_input_fields_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `generate_token_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `token_transfer_series_id` INTEGER NULL,
    `token_abbreviation` VARCHAR(50) NOT NULL,
    `token_series_id` INTEGER NOT NULL,
    `token_number` INTEGER NOT NULL,
    `token_date` DATE NOT NULL,
    `token_calling_time` DATETIME(6) NULL,
    `token_out_time` DATETIME(6) NULL,
    `priority` INTEGER NOT NULL,
    `counter_number_id` INTEGER NULL,
    `token_status` ENUM('PENDING', 'HOLD', 'ACTIVE', 'TRANSFER', 'WAITING', 'COMPLETED') NOT NULL,
    `bell_ring` TINYINT NOT NULL DEFAULT 0,
    `bell_time` DATETIME(6) NULL,
    `user_id` INTEGER NULL,
    `token_series_number` VARCHAR(50) NOT NULL,
    `reason` TEXT NULL,
    `language_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `customer_mobile_number` VARCHAR(50) NULL,
    `customer_name` VARCHAR(55) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `tokens_hash_id_key`(`hash_id`),
    UNIQUE INDEX `tokens_token_number_token_date_company_id_deleted_at_key`(`token_number`, `token_date`, `company_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_counter_filter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(191) NOT NULL,
    `dept_id` INTEGER NOT NULL,
    `company_id` INTEGER NOT NULL,
    `date` DATE NULL,
    `counter_no` INTEGER NOT NULL,
    `counter_name` VARCHAR(255) NOT NULL,
    `series` VARCHAR(256) NOT NULL,
    `enter_by_admin` TINYINT NOT NULL DEFAULT 0,
    `flag` VARCHAR(255) NULL,
    `start_time` VARCHAR(200) NOT NULL,
    `end_time` VARCHAR(200) NOT NULL,
    `auto_call` INTEGER NULL,
    `auto_time` INTEGER NULL,
    `dis_srs` INTEGER NULL,
    `ip_machine` VARCHAR(100) NULL,
    `transfer_token_wise` VARCHAR(255) NULL,
    `transfer_token` VARCHAR(255) NULL,
    `transfer_counter` INTEGER NULL,
    `transfer_department` INTEGER NULL,
    `transfer_token_next_click` INTEGER NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,
    `deleted_at` DATETIME(6) NULL,

    UNIQUE INDEX `ht_counter_filter_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ht_appointment_token_form_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `token_id` INTEGER NOT NULL,
    `appointment_id` INTEGER NULL,
    `form_data` JSON NOT NULL,

    UNIQUE INDEX `ht_appointment_token_form_data_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ht_counter_filter_ht_department` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ht_counter_filter_ht_department_AB_unique`(`A`, `B`),
    INDEX `_ht_counter_filter_ht_department_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `states` ADD CONSTRAINT `states_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `districts` ADD CONSTRAINT `districts_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_district_id_fkey` FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_city_category_id_fkey` FOREIGN KEY (`city_category_id`) REFERENCES `city_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pin_codes` ADD CONSTRAINT `pin_codes_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `constituency_pincodes` ADD CONSTRAINT `constituency_pincodes_constituency_id_fkey` FOREIGN KEY (`constituency_id`) REFERENCES `constituency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `constituency_pincodes` ADD CONSTRAINT `constituency_pincodes_pincode_id_fkey` FOREIGN KEY (`pincode_id`) REFERENCES `pin_codes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_company` ADD CONSTRAINT `ht_company_main_company_id_fkey` FOREIGN KEY (`main_company_id`) REFERENCES `main_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_company` ADD CONSTRAINT `ht_company_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_company` ADD CONSTRAINT `ht_company_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_users` ADD CONSTRAINT `ht_users_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_users` ADD CONSTRAINT `ht_users_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `ht_department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_company_languages` ADD CONSTRAINT `ht_company_languages_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_company_languages` ADD CONSTRAINT `ht_company_languages_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `ht_languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_series` ADD CONSTRAINT `ht_series_comapany_id_fkey` FOREIGN KEY (`comapany_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_series` ADD CONSTRAINT `ht_series_parent_series_id_fkey` FOREIGN KEY (`parent_series_id`) REFERENCES `ht_series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_counter_settings` ADD CONSTRAINT `ht_counter_settings_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_department` ADD CONSTRAINT `ht_department_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_series_input_fields` ADD CONSTRAINT `ht_series_input_fields_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `ht_series`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `ht_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `ht_languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_token_transfer_series_id_fkey` FOREIGN KEY (`token_transfer_series_id`) REFERENCES `ht_series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_counter_number_id_fkey` FOREIGN KEY (`counter_number_id`) REFERENCES `ht_counter_filter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_token_series_id_fkey` FOREIGN KEY (`token_series_id`) REFERENCES `ht_series`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_counter_filter` ADD CONSTRAINT `ht_counter_filter_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_appointment_token_form_data` ADD CONSTRAINT `ht_appointment_token_form_data_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ht_appointment_token_form_data` ADD CONSTRAINT `ht_appointment_token_form_data_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `tokens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ht_counter_filter_ht_department` ADD CONSTRAINT `_ht_counter_filter_ht_department_A_fkey` FOREIGN KEY (`A`) REFERENCES `ht_counter_filter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ht_counter_filter_ht_department` ADD CONSTRAINT `_ht_counter_filter_ht_department_B_fkey` FOREIGN KEY (`B`) REFERENCES `ht_department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
