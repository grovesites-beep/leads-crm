/**
 * Script para criar o usuário administrador principal no Appwrite
 * e definir a label "admin" no seu perfil.
 *
 * Executar com: npx tsx scripts/criar-admin.ts
 */
import { Client, Users } from 'node-appwrite';

const cliente = new Client()
    .setEndpoint('https://appwrite.grovehub.com.br/v1')
    .setProject('69a6d01c0019a0f64ff4')
    .setKey('standard_8f6abcd5d2bd527d89ef657634ed25108574570e959c29a427279be0248383a609781a8705c709b293c8472b953c0dbdefa7db44eb78b5f0d0ef8aef45ef0e45264316e6e4ccba148bdc4a890510dcf4e52569006cba57b758699fdb36574adfb6437cd5406309b7a38ae8e32c63cac2d67d96bbe5d77639238c255069354b2a');

const usuarios = new Users(cliente);

const ADMIN_EMAIL = 'nei@grovehub.com.br';
const ADMIN_NOME = 'Nei Espíndola';

async function criarAdmin() {
    console.log(`🔐 Verificando/criando usuário admin: ${ADMIN_EMAIL}\n`);

    try {
        // Verifica se o usuário já existe
        const lista = await usuarios.list();
        const adminExistente = lista.users.find(u => u.email === ADMIN_EMAIL);

        if (adminExistente) {
            console.log(`ℹ️  Usuário já existe (ID: ${adminExistente.$id})`);

            // Garante que tem a label admin
            if (!adminExistente.labels.includes('admin')) {
                await usuarios.updateLabels(adminExistente.$id, ['admin']);
                console.log('✅ Label "admin" adicionada ao usuário existente.');
            } else {
                console.log('✅ Usuário já possui a label "admin".');
            }
            return;
        }

        // Cria o usuário admin
        // IMPORTANTE: Defina a senha do admin abaixo ou via argumento
        const senhaAdmin = process.argv[2] || 'Admin@2025!';

        const novoAdmin = await usuarios.create(
            'ID.unique()',
            ADMIN_EMAIL,
            undefined,
            senhaAdmin,
            ADMIN_NOME
        );
        console.log(`✅ Usuário admin criado (ID: ${novoAdmin.$id})`);

        // Adiciona a label admin
        await usuarios.updateLabels(novoAdmin.$id, ['admin']);
        console.log('✅ Label "admin" definida com sucesso.');

        console.log(`\n📧 E-mail: ${ADMIN_EMAIL}`);
        console.log(`🔑 Senha: ${senhaAdmin}`);
        console.log('\n⚠️  Guarde essa senha em local seguro!');

    } catch (erro) {
        console.error('❌ Erro:', erro);
    }
}

criarAdmin();
