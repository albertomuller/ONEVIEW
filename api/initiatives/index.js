const { getConnection, sql } = require('../utils/database');

module.exports = async function (context, req) {
    context.log('Initiatives API - Azure SQL version');
    
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        context.res = { status: 200, headers: corsHeaders };
        return;
    }

    try {
        const pool = await getConnection();

        if (req.method === 'GET') {
            // Get all initiatives from database
            const result = await pool.request().query(`
                SELECT 
                    id,
                    market,
                    dpm,
                    businessOwner,
                    po,
                    tdpo,
                    architect,
                    cybersecurity,
                    strategicIntent,
                    keyResults,
                    deadlineStatus,
                    extCost,
                    intRes,
                    lastModified,
                    modifiedBy
                FROM Initiatives
                ORDER BY lastModified DESC
            `);

            const initiatives = {};
            result.recordset.forEach(row => {
                initiatives[row.id] = {
                    market: row.market,
                    dpm: row.dpm,
                    businessOwner: row.businessOwner,
                    po: row.po,
                    tdpo: row.tdpo,
                    architect: row.architect,
                    cybersecurity: row.cybersecurity,
                    strategicIntent: row.strategicIntent,
                    keyResults: row.keyResults ? JSON.parse(row.keyResults) : [],
                    deadlineStatus: row.deadlineStatus,
                    extCost: row.extCost,
                    intRes: row.intRes,
                    lastModified: row.lastModified,
                    modifiedBy: row.modifiedBy
                };
            });

            context.res = {
                status: 200,
                headers: corsHeaders,
                body: {
                    success: true,
                    initiatives: initiatives,
                    count: Object.keys(initiatives).length,
                    source: 'Azure SQL Database',
                    timestamp: new Date().toISOString(),
                    version: '3.0.0-azure-sql'
                }
            };

        } else if (req.method === 'POST') {
            // Create or update initiative
            const data = req.body;
            const id = data.id || `INIT-${Date.now()}`;

            await pool.request()
                .input('id', sql.NVarChar(50), id)
                .input('market', sql.NVarChar(100), data.market)
                .input('dpm', sql.NVarChar(100), data.dpm)
                .input('businessOwner', sql.NVarChar(100), data.businessOwner)
                .input('po', sql.NVarChar(100), data.po)
                .input('tdpo', sql.NVarChar(100), data.tdpo)
                .input('architect', sql.NVarChar(100), data.architect)
                .input('cybersecurity', sql.NVarChar(100), data.cybersecurity)
                .input('strategicIntent', sql.NVarChar(sql.MAX), data.strategicIntent)
                .input('keyResults', sql.NVarChar(sql.MAX), JSON.stringify(data.keyResults || []))
                .input('deadlineStatus', sql.NVarChar(20), data.deadlineStatus)
                .input('extCost', sql.NVarChar(50), data.extCost)
                .input('intRes', sql.NVarChar(50), data.intRes)
                .input('modifiedBy', sql.NVarChar(100), data.modifiedBy || 'system')
                .query(`
                    MERGE Initiatives AS target
                    USING (SELECT @id as id) AS source
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
                        INSERT (id, market, dpm, businessOwner, po, tdpo, architect, cybersecurity, 
                               strategicIntent, keyResults, deadlineStatus, extCost, intRes, modifiedBy)
                        VALUES (@id, @market, @dpm, @businessOwner, @po, @tdpo, @architect, @cybersecurity,
                               @strategicIntent, @keyResults, @deadlineStatus, @extCost, @intRes, @modifiedBy);
                `);

            context.res = {
                status: 200,
                headers: corsHeaders,
                body: {
                    success: true,
                    message: 'Initiative saved successfully',
                    id: id,
                    timestamp: new Date().toISOString()
                }
            };

        } else {
            context.res = {
                status: 405,
                headers: corsHeaders,
                body: { error: 'Method not allowed' }
            };
        }

    } catch (error) {
        context.log('Database error:', error);
        
        // Fallback to sample data if database fails
        const sampleData = {
            "INIT-12345": {
                "market": "Sample Market",
                "dpm": "Sample DPM",
                "businessOwner": "Sample Owner",
                "po": "Sample PO",
                "tdpo": "Sample TDPO",
                "architect": "Sample Architect",
                "cybersecurity": "Sample Cybersecurity",
                "strategicIntent": "Sample Strategic Intent",
                "keyResults": ["Sample Key Result 1", "Sample Key Result 2"],
                "deadlineStatus": "On Track",
                "extCost": "$1000",
                "intRes": "$500",
                "lastModified": new Date().toISOString(),
                "modifiedBy": "system"
            }
        };

        context.res = {
            status: 200,
            headers: corsHeaders,
            body: {
                success: true,
                initiatives: sampleData,
                count: 1,
                source: 'Sample Data (Database offline)',
                error: error.message,
                timestamp: new Date().toISOString()
            }
        };
    }
};