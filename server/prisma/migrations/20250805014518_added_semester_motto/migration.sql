-- AlterTable
ALTER TABLE `Course` ADD COLUMN `semester` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Homework` ADD COLUMN `semester` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `motto` VARCHAR(191) NULL;
