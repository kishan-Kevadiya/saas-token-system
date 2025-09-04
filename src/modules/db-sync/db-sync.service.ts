import { exec } from "child_process";
import path from "path";

export default class DbSyncService {

    public async syncDatabase(): Promise<void> {
        const scriptPath = path.join(process.cwd(), "scripts", "db-sync.sh");

        // Run the shell script
        exec(`sh ${scriptPath}`, { shell: '/bin/sh' }, (err, stdout, stderr) => {
            console.log('📄 STDOUT:', stdout);
            console.error('⚠️ STDERR:', stderr);

            if (err) {
                console.error('❌ Error running db-sync script:', err);
                return;
            }

            console.log('✅ db-sync script completed successfully.');
        });

    }
}
