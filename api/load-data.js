module.exports = async function (context, req) {
    context.log('Load data API called');

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: corsHeaders
        };
        return;
    }

    try {
        // Simulate loading data
        context.log('Data load requested - returning success');

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: {
                success: true,
                message: 'Data loaded successfully from Azure Functions',
                count: 2,
                source: 'azure_functions',
                public_access: true,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error) {
        context.log.error('Error in load-data API:', error);
        
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: { 
                success: false, 
                error: error.message || 'Internal server error'
            }
        };
    }
};