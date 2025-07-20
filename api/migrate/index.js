const { getConnection, sql } = require('../utils/database');

module.exports = async function (context, req) {
    context.log('=== REAL MIGRATION: Firebase to Azure SQL ===');
    
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        context.res = { status: 200, headers: corsHeaders };
        return;
    }

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            headers: corsHeaders,
            body: { error: 'Method not allowed. Use POST to start migration.' }
        };
        return;
    }

    try {
        const firebaseData = req.body;
        context.log('Starting REAL migration to Azure SQL Database...');
        context.log('Received initiatives:', Object.keys(firebaseData).length);

        // Connect to Azure SQL Database
        const pool = await getConnection();
        
        let migratedCount = 0;
        let errors = [];
        let successfulMigrations = [];

        // First, let's check if table exists and create if needed
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Initiatives' AND xtype='U')
                CREATE TABLE Initiatives (
                    id NVARCHAR(50) PRIMARY KEY,
                    market NVARCHAR(100),
                    dpm NVARCHAR(100),
                    businessOwner NVARCHAR(100),
                    po NVARCHAR(100),
                    tdpo NVARCHAR(100),
                    architect NVARCHAR(100),
                    cybersecurity NVARCHAR(100),
                    strategicIntent NVARCHAR(MAX),
                    keyResults NVARCHAR(MAX),
                    deadlineStatus NVARCHAR(20),
                    extCost NVARCHAR(50),
                    intRes NVARCHAR(50),
                    lastModified DATETIME2 DEFAULT GETDATE(),
                    modifiedBy NVARCHAR(100)
                )
            `);
            context.log('✅ Table Initiatives ready');
        } catch (tableError) {
            context.log('Table creation error:', tableError.message);
        }

        // Migrate each initiative
        for (const [id, initiative] of Object.entries(firebaseData)) {
            try {
                context.log(`Migrating initiative: ${id}`);
                
                // Clean and prepare data
                const cleanData = {
                    id: id,
                    market: initiative.market || '',
                    dpm: initiative.dpm || '',
                    businessOwner: initiative.businessOwner || '',
                    po: initiative.po || '',
                    tdpo: initiative.tdpo || '',
                    architect: initiative.architect || '',
                    cybersecurity: initiative.cybersecurity || '',
                    strategicIntent: initiative.strategicIntent || '',
                    keyResults: JSON.stringify(initiative.keyResults || []),
                    deadlineStatus: initiative.deadlineStatus || 'yellow',
                    extCost: initiative.extCost || '',
                    intRes: initiative.intRes || '',
                    modifiedBy: initiative.modifiedBy || 'migration-script'
                };

                // Insert or update the initiative in the database
                await pool.request()
                    .input('id', sql.NVarChar, cleanData.id)
                    .input('market', sql.NVarChar, cleanData.market)
                    .input('dpm', sql.NVarChar, cleanData.dpm)
                    .input('businessOwner', sql.NVarChar, cleanData.businessOwner)
                    .input('po', sql.NVarChar, cleanData.po)
                    .input('tdpo', sql.NVarChar, cleanData.tdpo)
                    .input('architect', sql.NVarChar, cleanData.architect)
                    .input('cybersecurity', sql.NVarChar, cleanData.cybersecurity)
                    .input('strategicIntent', sql.NVarChar, cleanData.strategicIntent)
                    .input('keyResults', sql.NVarChar, cleanData.keyResults)
                    .input('deadlineStatus', sql.NVarChar, cleanData.deadlineStatus)
                    .input('extCost', sql.NVarChar, cleanData.extCost)
                    .input('intRes', sql.NVarChar, cleanData.intRes)
                    .input('modifiedBy', sql.NVarChar, cleanData.modifiedBy)
                    .query(`
                        MERGE INTO Initiatives AS target
                        USING (SELECT @id AS id) AS source
                        ON target.id = source.id
                        WHEN MATCHED THEN
                            UPDATE SET
                                market = @market,
                                dpm = @dpm,
                                businessOwner = @businessOwner,
                                po = @po,
                                tdpo = @tdpo,
                                architect = @architect,
                                cybersecurity = @cybersecurity,
                                strategicIntent = @strategicIntent,
                                keyResults = @keyResults,
                                deadlineStatus = @deadlineStatus,
                                extCost = @extCost,
                                intRes = @intRes,
                                lastModified = GETDATE(),
                                modifiedBy = @modifiedBy
                        WHEN NOT MATCHED THEN
                            INSERT (id, market, dpm, businessOwner, po, tdpo, architect, cybersecurity, strategicIntent, keyResults, deadlineStatus, extCost, intRes, lastModified, modifiedBy)
                            VALUES (@id, @market, @dpm, @businessOwner, @po, @tdpo, @architect, @cybersecurity, @strategicIntent, @keyResults, @deadlineStatus, @extCost, @intRes, GETDATE(), @modifiedBy);
                    `);

                migratedCount++;
                successfulMigrations.push(id);
                context.log(`✅ Migrated initiative: ${id}`);
                
            } catch (error) {
                errors.push({ id, error: error.message });
                context.log(`❌ Error migrating ${id}:`, error.message);
            }
        }

        context.res = {
            status: 200,
            headers: corsHeaders,
            body: {
                success: true,
                message: 'Migration completed',
                migratedCount,
                totalReceived: Object.keys(firebaseData).length,
                successfulMigrations,
                errors,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        };

    } catch (error) {
        context.log('Migration error:', error);
        context.res = {
            status: 500,
            headers: corsHeaders,
            body: {
                success: false,
                error: 'Migration failed',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
};