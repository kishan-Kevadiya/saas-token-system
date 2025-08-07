/*
  Warnings:

  - You are about to alter the column `display_transfer_token` on the `ht_button_settings` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `ht_button_settings` MODIFY `display_transfer_token` ENUM('WAITING_LIST', 'TRANSFER_LIST') NOT NULL;
