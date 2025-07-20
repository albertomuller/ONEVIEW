module.exports = async function (context, req) {
    context.log('=== HEALTH SIMPLE CHECK ===');
    context.log('Method:', req.method);
    context.log('URL:', req.url);
    
    const response = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'OneView API is running - simple check',
        version: '2.0.4-debug',
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch
        },
        debug: {
            method: req.method,
            url: req.url || 'not available',
            headers: req.headers || {}
        }
    };
    
    context.log('Response:', JSON.stringify(response, null, 2));
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: response
    };
    
    context.log('=== HEALTH SIMPLE COMPLETE ===');
};