const { Client, Users } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function grantAdmin() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const users = new Users(client);
    const targetEmail = 'nei@grovehub.com.br';

    try {
        const response = await users.list([
            require('node-appwrite').Query.equal('email', targetEmail)
        ]);

        if (response.total > 0) {
            const user = response.users[0];
            await users.updateLabels(user.$id, ['admin']);
            console.log(`✅ SUCESSO: O usuário ${targetEmail} agora é um ADMINISTRADOR oficial no Appwrite!`);
        } else {
            console.log(`❌ ERRO: Usuário ${targetEmail} não encontrado no Appwrite.`);
        }
    } catch (error) {
        console.error('❌ ERRO AO EXECUTAR SCRIPT:', error.message);
    }
}

grantAdmin();
