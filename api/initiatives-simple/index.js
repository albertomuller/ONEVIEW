module.exports = async function (context, req) {
    context.log('Simple initiatives test');
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: {
            success: true,
            message: 'Initiatives endpoint working',
            method: req.method,
            timestamp: new Date().toISOString(),
            sampleData: {
                'INIT-001': {
                    market: 'Brazil',
                    dpm: 'Test User',
                    strategicIntent: 'Test initiative'
                }
            }
        }
    };
};