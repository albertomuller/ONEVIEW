const sql = require('mssql');

const sqlConfig = {
    user: 'CloudSA1a10d43e',
    password: 'sln4*931am<D3&2',
    server: 'sqlsrv-datastaging-prd.database.windows.net',
    database: 'oneviewvfslatam',
    options: { encrypt: true }
};

module.exports = async function (context, req) {
    if (req.method !== 'POST') {
        context.res = { status: 405, body: 'Method Not Allowed' };
        return;
    }

    const { initiatives } = req.body || {};
    if (!initiatives) {
        context.res = { status: 400, body: 'Missing initiatives' };
        return;
    }

    try {
        await sql.connect(sqlConfig);
        for (const id in initiatives) {
            const data = initiatives[id];
            await sql.query`
                MERGE Initiatives AS target
                USING (SELECT ${id} AS id) AS source
                ON (target.id = source.id)
                WHEN MATCHED THEN
                    UPDATE SET
                        market = ${data.market},
                        dpm = ${data.dpm},
                        businessOwner = ${data.businessOwner},
                        po = ${data.po},
                        tdpo = ${data.tdpo},
                        architect = ${data.architect},
                        cybersecurity = ${data.cybersecurity},
                        strategicIntent = ${data.strategicIntent},
                        keyResults = ${JSON.stringify(data.keyResults)},
                        deadlineStatus = ${data.deadlineStatus},
                        extCost = ${data.extCost},
                        intRes = ${data.intRes},
                        modifiedBy = ${data.modifiedBy}
                WHEN NOT MATCHED THEN
                    INSERT (id, market, dpm, businessOwner, po, tdpo, architect, cybersecurity, strategicIntent, keyResults, deadlineStatus, extCost, intRes, modifiedBy)
                    VALUES (${id}, ${data.market}, ${data.dpm}, ${data.businessOwner}, ${data.po}, ${data.tdpo}, ${data.architect}, ${data.cybersecurity}, ${data.strategicIntent}, ${JSON.stringify(data.keyResults)}, ${data.deadlineStatus}, ${data.extCost}, ${data.intRes}, ${data.modifiedBy});
            `;
        }
        context.res = { status: 200, body: { success: true } };
    } catch (err) {
        context.res = { status: 500, body: { success: false, error: err.message } };
    }
};