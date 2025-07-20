const { getConnection } = require('./utils/database');

module.exports = async function (context, req) {
    context.log('=== HEALTH CHECK START ===');
    
    let dbStatus = 'disconnected';
    let dbMessage = 'Not tested';
    let dbInfo = {};
    let errorDetails = null;
    
    // Log all environment variables (without sensitive data)
    context.log('Environment check:', {
        nodeVersion: process.version,
        platform: process.platform,
        hasConnectionUtil: typeof getConnection === 'function'
    });
    
    try {
        context.log('Attempting database connection...');
        const pool = await getConnection();
        context.log('Pool created successfully');
        
        // Test basic connection with timeout
        const result = await Promise.race([
            pool.request().query('SELECT 1 as test, GETDATE() as currentTime'),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
            )
        ]);
        
        context.log('Query executed successfully:', result.recordset[0]);
        
        dbStatus = 'connected';
        dbMessage = 'Basic connection successful';
        dbInfo.basicTest = result.recordset[0];
        
        // Try more detailed query
        try {
            const detailResult = await pool.request().query(`
                SELECT 
                    GETDATE() as currentTime, 
                    USER_NAME() as currentUser,
                    DB_NAME() as currentDatabase,
                    @@SERVERNAME as serverName
            `);
            
            dbInfo.details = detailResult.recordset[0];
            context.log('Detailed query successful:', dbInfo.details);
            
        } catch (detailError) {
            context.log('Detailed query failed:', detailError.message);
            dbInfo.detailError = detailError.message;
        }
        
    } catch (error) {
        dbStatus = 'error';
        dbMessage = error.message;
        errorDetails = {
            message: error.message,
            code: error.code,
            number: error.number,
            state: error.state,
            class: error.class,
            stack: error.stack?.substring(0, 500)
        };
        
        context.log('=== DATABASE ERROR ===');
        context.log('Error message:', error.message);
        context.log('Error code:', error.code);
        context.log('Error number:', error.number);
        context.log('Error state:', error.state);
        context.log('Full error:', error);
    }
    
    const response = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'OneView API Health Check',
        version: '2.0.1-debug',
        database: {
            status: dbStatus,
            message: dbMessage,
            server: 'sqlsrv-datastaging-prd.database.windows.net',
            database: 'oneviewvfslatam',
            authType: 'Azure AD Integrated',
            info: dbInfo,
            error: errorDetails
        }
    };
    
    context.log('=== HEALTH CHECK RESPONSE ===');
    context.log(JSON.stringify(response, null, 2));
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: response
    };
};