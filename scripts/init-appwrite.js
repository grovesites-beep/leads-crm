const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const initAppwrite = async () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        console.log('Criando Banco de Dados...');
        const db = await databases.create(ID.unique(), 'LeadsCRM');
        const databaseId = db.$id;
        console.log(`Banco de Dados criado: ${databaseId}`);

        console.log('Criando Coleção de Leads...');
        const leadsCollection = await databases.createCollection(databaseId, ID.unique(), 'Leads');
        const leadsCollectionId = leadsCollection.$id;
        console.log(`Coleção de Leads criada: ${leadsCollectionId}`);

        // Atributos para Leads
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'name', 255, true);
        await databases.createEmailAttribute(databaseId, leadsCollectionId, 'email', true);
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'phone', 20, false);
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'source', 255, false); // Landing Page de origem
        await databases.createStringAttribute(databaseId, leadsCollectionId, 'status', 50, false, 'new');

        console.log('Criando Coleção de Configurações...');
        const settingsCollection = await databases.createCollection(databaseId, ID.unique(), 'Settings');
        const settingsCollectionId = settingsCollection.$id;
        console.log(`Coleção de Configurações criada: ${settingsCollectionId}`);

        await databases.createStringAttribute(databaseId, settingsCollectionId, 'key', 100, true);
        await databases.createStringAttribute(databaseId, settingsCollectionId, 'value', 2000, true);

        console.log('\n--- CONFIGURAÇÕES PARA O .ENV.LOCAL ---');
        console.log(`NEXT_PUBLIC_APPWRITE_DATABASE_ID=${databaseId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID=${leadsCollectionId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID=${settingsCollectionId}`);

        // Inicializar documento padrão de configurações
        try {
            await databases.createDocument(databaseId, settingsCollectionId, 'global', {
                appName: "Grove Leads CRM",
                primaryColor: "#000000"
            });
            console.log('✅ Documento de configurações globais criado.');
        } catch (e) {
            console.log('ℹ️ Documento de configurações já existe.');
        }

        console.log('🚀 Appwrite inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar Appwrite:', error);
    }
};

initAppwrite();
