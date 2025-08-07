/*
  Warnings:

  - You are about to drop the column `no_of_calling_before` on the `ht_button_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ht_button_settings` DROP COLUMN `no_of_calling_before`,
    ADD COLUMN `minutes_of_calling_before` VARCHAR(100) NULL;
