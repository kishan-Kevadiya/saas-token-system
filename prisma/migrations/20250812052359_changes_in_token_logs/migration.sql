-- AlterTable
ALTER TABLE `token_logs` MODIFY `previous_status` ENUM('PENDING', 'HOLD', 'ACTIVE', 'TRANSFER', 'WAITING', 'COMPLETED') NULL,
    MODIFY `time_taken` VARCHAR(50) NOT NULL DEFAULT '00:00:00';
