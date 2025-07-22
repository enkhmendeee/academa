/*
  Warnings:

  - You are about to drop the column `Description` on the `Homework` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Homework` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Homework` DROP COLUMN `Description`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `grade` INTEGER NULL,
    MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'PENDING';
