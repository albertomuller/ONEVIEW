const { getConnection } = require('../utils/database');

module.exports = async function (context, req) {
    context.log('Health check with database test');
    
    let dbStatus = 'disconnected';
    let dbMessage = 'Not tested';
    let dbInfo = {};
    
    try {
        // Test database connection
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                GETDATE() as currentTime,
                USER_NAME() as currentUser,
                DB_NAME() as currentDatabase,
                @@SERVERNAME as serverName
        `);
        
        dbStatus = 'connected';
        dbMessage = 'Database connection successful';
        dbInfo = result.recordset[0];
        
    } catch (error) {
        dbStatus = 'error';
        dbMessage = error.message;
        context.log('Database error:', error);
    }
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            message: 'OneView API Health Check',
            version: '3.0.0-azure-sql',
            database: {
                status: dbStatus,
                message: dbMessage,
                server: 'sqlsrv-datastaging-prd.database.windows.net',
                database: 'oneviewvfslatam',
                info: dbInfo
            },
            api: {
                structure: 'Azure Functions v4',
                runtime: 'Node.js ' + process.version
            }
        }
    };
};