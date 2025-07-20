const { ClientSecretCredential } = require('@azure/identity');
require('dotenv').config();

console.log('=== TESTE RÁPIDO DE AUTENTICAÇÃO ===');
console.log('Tenant:', process.env.AZURE_TENANT_ID);
console.log('Client:', process.env.AZURE_CLIENT_ID);
console.log('Secret presente:', !!process.env.AZURE_CLIENT_SECRET);

async function quickTest() {
    try {
        const credential = new ClientSecretCredential(
            process.env.AZURE_TENANT_ID,
            process.env.AZURE_CLIENT_ID,
            process.env.AZURE_CLIENT_SECRET
        );
        
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        console.log('✅ Autenticação Azure funcionando!');
        return true;
    } catch (error) {
        console.log('❌ Erro na autenticação:', error.message);
        return false;
    }
}

quickTest();