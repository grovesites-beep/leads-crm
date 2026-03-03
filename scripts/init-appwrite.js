const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const initAppwrite = async () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        console.log('--- INICIANDO ESTRUTURA MULTI-TENANT (SAAS) ---');

        console.log('Criando Banco de Dados...');
        const db = await databases.create(ID.unique(), 'GroveCRM_v2');
        const databaseId = db.$id;
        console.log(`Banco de Dados criado: ${databaseId}`);

        // 1. COLEÇÃO DE CLIENTES (TENANTS)
        console.log('Criando Coleção de Clientes...');
        const clientsCollection = await databases.createCollection(databaseId, ID.unique(), 'Clients');
        const clientsCollectionId = clientsCollection.$id;

        await databases.createStringAttribute(databaseId, clientsCollectionId, 'name', 255, true);
        await databases.createEmailAttribute(databaseId, clientsCollectionId, 'email', true);
        await databases.createStringAttribute(databaseId, clientsCollectionId, 'userId', 255, true); // Link com o Usuário do Appwrite Auth
        await databases.createStringAttribute(databaseId, clientsCollectionId, 'slug', 100, true); // Para URLs amigáveis
        await databases.createStringAttribute(databaseId, clientsCollectionId, 'branding', 2000, false); // JSON de cores/identidade
        console.log(`Coleção de Clientes criada: ${clientsCollectionId}`);

        // 2. COLEÇÃO DE LEADS (COM CLIENTID)
        console.log('Criando Coleção de Leads...');
        const leadsCollection = await databases.createCollection(databaseId, ID.unique(), 'Leads');
        const leadsCollectionId = leadsCollection.$id;

        await databases.createStringAttribute(databaseId, leadsCollectionId, 'clientId', 255, true); // RELAÇÃO COM O CLIENTE
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'name', 255, true);
        await databases.createEmailAttribute(databaseId, leadsCollectionId, 'email', true);
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'phone', 20, false);
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'source', 255, false);
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'status', 50, false, 'new');
        console.log(`Coleção de Leads criada: ${leadsCollectionId}`);

        // 3. COLEÇÃO DE CONFIGURAÇÕES DO SISTEMA (PARA O ADMIN)
        console.log('Criando Coleção de Configurações Admin...');
        const systemCollection = await databases.createCollection(databaseId, ID.unique(), 'SystemSettings');
        const systemCollectionId = systemCollection.$id;
        await databases.createStringAttribute(databaseId, systemCollectionId, 'appName', 100, false, 'Grove CRM Admin');
        console.log(`Coleção Sistema criada: ${systemCollectionId}`);

        console.log('\n--- ATUALIZE SEU .ENV.LOCAL COM ESTE NOVOS IDS ---');
        console.log(`NEXT_PUBLIC_APPWRITE_DATABASE_ID=${databaseId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_CLIENTS_COLLECTION_ID=${clientsCollectionId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID=${leadsCollectionId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID=${systemCollectionId}`);

        console.log('\n🚀 Estrutura SaaS inicializada com sucesso!');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
}

initAppwrite();
