-- CreateTable
CREATE TABLE `User` (
    `u_id` INTEGER NOT NULL AUTO_INCREMENT,
    `u_uid` VARCHAR(191) NOT NULL,
    `u_fullname` VARCHAR(191) NOT NULL,
    `u_username` VARCHAR(191) NOT NULL,
    `u_email` VARCHAR(191) NOT NULL,
    `u_balance` DOUBLE NOT NULL,
    `u_salt` VARCHAR(191) NOT NULL,
    `u_password` VARCHAR(191) NOT NULL,
    `u_resetPasswordToken` VARCHAR(191) NULL,
    `u_resetPasswordExpires` DATETIME(3) NULL,
    `u_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `u_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `u_is_deleted` BOOLEAN NOT NULL,

    UNIQUE INDEX `User_u_uid_key`(`u_uid`),
    PRIMARY KEY (`u_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `t_id` INTEGER NOT NULL AUTO_INCREMENT,
    `t_uid` VARCHAR(191) NOT NULL,
    `t_u_uid` VARCHAR(191) NOT NULL,
    `t_name` VARCHAR(191) NOT NULL,
    `t_type` VARCHAR(191) NOT NULL,
    `t_category` VARCHAR(191) NOT NULL,
    `t_amount` DOUBLE NOT NULL,
    `t_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `t_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `t_is_deleted` BOOLEAN NOT NULL,

    UNIQUE INDEX `Transaction_t_uid_key`(`t_uid`),
    PRIMARY KEY (`t_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_t_u_uid_fkey` FOREIGN KEY (`t_u_uid`) REFERENCES `User`(`u_uid`) ON DELETE RESTRICT ON UPDATE CASCADE;
