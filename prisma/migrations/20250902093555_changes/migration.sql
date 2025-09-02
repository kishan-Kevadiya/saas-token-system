-- CreateTable
CREATE TABLE `otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `token_id` INTEGER NOT NULL,
    `counter_id` INTEGER NULL,
    `otp` INTEGER NOT NULL,
    `mobile_no` VARCHAR(15) NOT NULL,
    `is_verify` TINYINT NOT NULL DEFAULT 0,
    `expired_at` TIME NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL,

    UNIQUE INDEX `otp_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `otp` ADD CONSTRAINT `otp_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `tokens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp` ADD CONSTRAINT `otp_counter_id_fkey` FOREIGN KEY (`counter_id`) REFERENCES `ht_counter_filter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp` ADD CONSTRAINT `otp_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
