/*
  Warnings:

  - You are about to drop the column `dept_id` on the `ht_buttons` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ht_buttons` DROP FOREIGN KEY `ht_buttons_dept_id_fkey`;

-- DropIndex
DROP INDEX `ht_buttons_dept_id_fkey` ON `ht_buttons`;

-- AlterTable
ALTER TABLE `ht_buttons` DROP COLUMN `dept_id`;
