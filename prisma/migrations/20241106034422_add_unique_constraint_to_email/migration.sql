/*
  Warnings:

  - A unique constraint covering the columns `[u_username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[u_email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_u_username_key` ON `User`(`u_username`);

-- CreateIndex
CREATE UNIQUE INDEX `User_u_email_key` ON `User`(`u_email`);
