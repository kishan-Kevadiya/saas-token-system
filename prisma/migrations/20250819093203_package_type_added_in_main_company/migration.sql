/*
  Warnings:

  - Added the required column `expired_at` to the `main_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_limit` to the `main_company` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `main_company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `main_company` ADD COLUMN `expired_at` DATETIME(6) NOT NULL,
    ADD COLUMN `token_limit` INTEGER NOT NULL,
    MODIFY `type` ENUM('PAID', 'FREE') NOT NULL;
