const { ClientSecretCredential } = require('@azure/identity');
require('dotenv').config();

async function testCredentialsDetailed() {
    console.log('=== TESTE DETALHADO DAS CREDENCIAIS ===\n');
    
    // Verificar se as variáveis estão sendo carregadas corretamente
    console.log('🔍 Verificando variáveis de ambiente:');
    console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID);
    console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID);
    console.log('AZURE_CLIENT_SECRET length:', process.env.AZURE_CLIENT_SECRET?.length || 0);
    console.log('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET);
    
    // Verificar se há espaços em branco ou caracteres especiais
    const tenantId = process.env.AZURE_TENANT_ID?.trim();
    const clientId = process.env.AZURE_CLIENT_ID?.trim();
    const clientSecret = process.env.AZURE_CLIENT_SECRET?.trim();
    
    if (!tenantId || !clientId || !clientSecret) {
        console.log('❌ Alguma credencial está faltando');
        return false;
    }
    
    try {
        console.log('\n🔄 Criando ClientSecretCredential...');
        const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        
        console.log('🔄 Tentando obter token para Graph API...');
        const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
        
        console.log('✅ Token obtido com sucesso!');
        console.log('📊 Token info:');
        console.log('   Expires on:', new Date(tokenResponse.expiresOnTimestamp));
        console.log('   Token length:', tokenResponse.token.length);
        console.log('   Token preview:', tokenResponse.token.substring(0, 100) + '...');
        
        // Agora testar SQL Database
        console.log('\n🔄 Tentando obter token para SQL Database...');
        try {
            const sqlToken = await credential.getToken('https://database.windows.net/.default');
            console.log('✅ SQL Database token obtido!');
            console.log('   Expires on:', new Date(sqlToken.expiresOnTimestamp));
            return { success: true, hasSqlAccess: true, sqlToken: sqlToken.token };
        } catch (sqlError) {
            console.log('❌ SQL Database token falhou:', sqlError.message);
            return { success: true, hasSqlAccess: false };
        }
        
    } catch (error) {
        console.error('❌ Falha na autenticação:', error);
        console.error('Erro detalhado:');
        console.error('   Name:', error.name);
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        
        return { success: false, error: error.message };
    }
}

async function testSqlConnection(token) {
    if (!token) {
        console.log('⚠️ Sem token SQL para testar conexão');
        return false;
    }
    
    try {
        console.log('\n🔄 Testando conexão SQL com token...');
        
        const sql = require('mssql');
        const config = {
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME,
            authentication: {
                type: 'azure-active-directory-access-token',
                options: {
                    token: token
                }
            },
            options: {
                encrypt: true,
                trustServerCertificate: false,
                enableArithAbort: true,
                requestTimeout: 30000,
                connectionTimeout: 60000
            }
        };
        
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        
        const result = await pool.request().query(`
            SELECT 
                USER_NAME() as current_user,
                DB_NAME() as database_name,
                @@VERSION as version
        `);
        
        console.log('✅ Conexão SQL bem-sucedida!');
        console.log('📊 Detalhes:', result.recordset[0]);
        
        await pool.close();
        return true;
        
    } catch (error) {
        console.log('❌ Conexão SQL falhou:', error.message);
        return false;
    }
}

async function runAllTests() {
    const credResult = await testCredentialsDetailed();
    
    if (credResult.success && credResult.hasSqlAccess) {
        await testSqlConnection(credResult.sqlToken);
    }
    
    console.log('\n=== RESUMO ===');
    if (credResult.success) {
        console.log('✅ Azure Authentication: SUCCESS');
        console.log('✅ Credenciais estão corretas!');
        
        if (credResult.hasSqlAccess) {
            console.log('✅ SQL Database Access: SUCCESS');
            console.log('💡 Pode usar o server.js normal');
        } else {
            console.log('❌ SQL Database Access: FAILED');
            console.log('💡 Precisa configurar permissões SQL no Azure');
        }
    } else {
        console.log('❌ Azure Authentication: FAILED');
        console.log('💡 Precisa verificar as credenciais no Azure Portal');
    }
}

runAllTests();