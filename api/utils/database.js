const sql = require('mssql');

let pool = null;

const config = {
    server: 'sqlsrv-datastaging-prd.database.windows.net',
    database: 'oneviewvfslatam',
    authentication: {
        type: 'azure-active-directory-default'
    },
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    }
};

async function getConnection() {
    if (pool && pool.connected) {
        return pool;
    }
    
    try {
        console.log('Connecting to Azure SQL Database...');
        pool = await sql.connect(config);
        console.log('✅ Connected to Azure SQL Database');
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

async function closeConnection() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed');
        }
    } catch (error) {
        console.error('Error closing connection:', error);
    }
}

module.exports = {
    getConnection,
    closeConnection,
    sql
};