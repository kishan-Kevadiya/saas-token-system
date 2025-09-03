/*
  Warnings:

  - You are about to drop the column `status` on the `ht_department` table. All the data in the column will be lost.
  - Made the column `company_id` on table `ht_department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dept_english_name` on table `ht_department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `allow_abbreviation` on table `ht_department` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ht_department` DROP FOREIGN KEY `ht_department_company_id_fkey`;

-- DropIndex
DROP INDEX `ht_department_company_id_fkey` ON `ht_department`;

-- AlterTable
ALTER TABLE `ht_department` DROP COLUMN `status`,
    ADD COLUMN `is_active` TINYINT NOT NULL DEFAULT 1,
    MODIFY `company_id` INTEGER NOT NULL,
    MODIFY `dept_english_name` VARCHAR(255) NOT NULL,
    MODIFY `allow_abbreviation` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `ht_department` ADD CONSTRAINT `ht_department_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `ht_company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
