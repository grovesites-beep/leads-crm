const { Client, Users } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function listUsers() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const users = new Users(client);

    try {
        const response = await users.list();
        console.log('--- USUÁRIOS NO APPWRITE ---');
        response.users.forEach(u => {
            console.log(`- Email: ${u.email} | Nome: ${u.name} | Labels: ${u.labels.join(', ')}`);
        });
        console.log('----------------------------');
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

listUsers();
