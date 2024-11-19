/*
  Warnings:

  - A unique constraint covering the columns `[u_google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `u_google_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_u_google_id_key` ON `User`(`u_google_id`);
