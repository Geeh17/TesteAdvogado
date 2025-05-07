-- CreateTable
CREATE TABLE `Andamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fichaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Andamento` ADD CONSTRAINT `Andamento_fichaId_fkey` FOREIGN KEY (`fichaId`) REFERENCES `Ficha`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
