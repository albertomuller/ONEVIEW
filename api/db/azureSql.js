const sql = require('mssql');

const config = {
    user: 'CloudSA1a10d43e',
    password: 'sln4*931am<D3&2',
    server: 'sqlsrv-datastaging-prd.database.windows.net',
    database: 'oneviewvfslatam',
    options: {
        encrypt: true // Required for Azure SQL
    }
};

async function connectAzureSql() {
    try {
        await sql.connect(config);
        console.log('Connected to Azure SQL');
        // Example query
        const result = await sql.query('SELECT TOP 10 * FROM INFORMATION_SCHEMA.TABLES');
        console.log(result.recordset);
        return result.recordset;
    } catch (err) {
        console.error('Azure SQL connection error:', err);
        throw err;
    }
}

module.exports = { connectAzureSql };