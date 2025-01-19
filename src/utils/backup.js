import fs from 'fs/promises';
import path from 'path';

export class BackupManager {
  constructor(baseDir, maxBackups = 5) {
    this.baseDir = baseDir;
    this.maxBackups = maxBackups;
  }

  async createBackup(data) {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    const backupFile = path.join(this.baseDir, `backup-${timestamp}.json`);

    try {
      await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
      await this.cleanOldBackups();
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async cleanOldBackups() {
    try {
      const files = await fs.readdir(this.baseDir);
      const backups = files
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        await Promise.all(
          toDelete.map(file =>
            fs.unlink(path.join(this.baseDir, file))
          )
        );
      }
    } catch (error) {
      console.error(`Failed to clean old backups: ${error.message}`);
    }
  }

  async restoreFromBackup(backupFile) {
    try {
      const data = await fs.readFile(backupFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error.message}`);
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.baseDir);
      return files
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();
    } catch (error) {
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }
}
