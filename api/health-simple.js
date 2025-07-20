module.exports = async function (context, req) {
    context.log('Simple health check');
    
    const response = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'OneView API is running - simple check',
        version: '2.0.1-simple',
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch
        }
    };
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: response
    };
};