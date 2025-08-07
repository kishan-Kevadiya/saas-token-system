/*
  Warnings:

  - You are about to drop the column `token_transfer_series_id` on the `tokens` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tokens` DROP FOREIGN KEY `tokens_token_transfer_series_id_fkey`;

-- DropIndex
DROP INDEX `tokens_token_transfer_series_id_fkey` ON `tokens`;

-- AlterTable
ALTER TABLE `tokens` DROP COLUMN `token_transfer_series_id`,
    ADD COLUMN `token_transfer_counter_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `_tokens_ht_series_transfer_series` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_tokens_ht_series_transfer_series_AB_unique`(`A`, `B`),
    INDEX `_tokens_ht_series_transfer_series_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_token_transfer_counter_id_fkey` FOREIGN KEY (`token_transfer_counter_id`) REFERENCES `ht_counter_filter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tokens_ht_series_transfer_series` ADD CONSTRAINT `_tokens_ht_series_transfer_series_A_fkey` FOREIGN KEY (`A`) REFERENCES `ht_series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tokens_ht_series_transfer_series` ADD CONSTRAINT `_tokens_ht_series_transfer_series_B_fkey` FOREIGN KEY (`B`) REFERENCES `tokens`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
