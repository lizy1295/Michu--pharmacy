"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("./src/data-source");
async function testMigrations() {
    await data_source_1.AppDataSource.initialize();
    console.log('AppDataSource initialized');
    try {
        const migrations = await data_source_1.AppDataSource.runMigrations();
        console.log('Ran migrations:', migrations);
    }
    catch (err) {
        console.error('Migration error:', err);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
testMigrations();
//# sourceMappingURL=scratch_run_migrations.js.map