-- CreateTable
CREATE TABLE `ht_holidays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hash_id` VARCHAR(36) NOT NULL,
    `company_id` INTEGER NOT NULL,
    `holiday_date` DATE NOT NULL,
    `is_active` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `ht_holidays_hash_id_key`(`hash_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ht_holidays` ADD CONSTRAINT `ht_holidays_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
