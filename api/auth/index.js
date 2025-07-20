const { getConnection, sql } = require('../utils/database');

module.exports = async function (context, req) {
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
        context.res = { status: 200, headers: corsHeaders };
        return;
    }

    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            headers: corsHeaders,
            body: { error: 'Method not allowed' }
        };
        return;
    }

    try {
        const { username, password } = req.body;

        // Try database authentication first
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('username', sql.NVarChar(100), username)
                .query('SELECT username, name, password FROM Users WHERE username = @username');

            if (result.recordset.length > 0) {
                const user = result.recordset[0];
                if (user.password === password) {
                    context.res = {
                        status: 200,
                        headers: corsHeaders,
                        body: {
                            success: true,
                            user: {
                                username: user.username,
                                name: user.name
                            },
                            source: 'Azure SQL Database'
                        }
                    };
                    return;
                }
            }
        } catch (dbError) {
            context.log('Database auth failed, trying fallback:', dbError.message);
        }

        // Fallback to hardcoded credentials
        const localCredentials = {
            "VFSDITLATAM": {
                password: "Vfsalberto2025",
                name: "VFS DIT LATAM User"
            }
        };

        if (localCredentials[username] && localCredentials[username].password === password) {
            context.res = {
                status: 200,
                headers: corsHeaders,
                body: {
                    success: true,
                    user: {
                        username: username,
                        name: localCredentials[username].name
                    },
                    source: 'Fallback Credentials'
                }
            };
        } else {
            context.res = {
                status: 401,
                headers: corsHeaders,
                body: {
                    success: false,
                    error: 'Invalid credentials'
                }
            };
        }

    } catch (error) {
        context.log('Auth error:', error);
        context.res = {
            status: 500,
            headers: corsHeaders,
            body: {
                success: false,
                error: 'Authentication service error'
            }
        };
    }
};