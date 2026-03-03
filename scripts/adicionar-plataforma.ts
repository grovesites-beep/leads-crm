/**
 * Script para adicionar plataforma Web no Appwrite via REST API
 * Executar com: npx tsx scripts/adicionar-plataforma.ts
 */

const ENDPOINT = 'https://appwrite.grovehub.com.br/v1';
const PROJECT_ID = '69a6d01c0019a0f64ff4';
const API_KEY = 'standard_8f6abcd5d2bd527d89ef657634ed25108574570e959c29a427279be0248383a609781a8705c709b293c8472b953c0dbdefa7db44eb78b5f0d0ef8aef45ef0e45264316e6e4ccba148bdc4a890510dcf4e52569006cba57b758699fdb36574adfb6437cd5406309b7a38ae8e32c63cac2d67d96bbe5d77639238c255069354b2a';

async function adicionarPlataforma(nome: string, hostname: string) {
    console.log(`🌐 Adicionando plataforma Web: ${hostname}...`);

    const resposta = await fetch(`${ENDPOINT}/projects/${PROJECT_ID}/platforms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Key': API_KEY,
            'X-Appwrite-Project': PROJECT_ID,
        },
        body: JSON.stringify({
            type: 'web',
            name: nome,
            hostname: hostname,
        }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
        console.log(`✅ Plataforma "${nome}" adicionada com sucesso!`);
        console.log(`   ID: ${dados.$id}`);
        console.log(`   Hostname: ${dados.hostname}`);
    } else {
        if (dados.message?.includes('already exists') || dados.type === 'platform_already_exists') {
            console.log(`ℹ️  Plataforma "${hostname}" já existe.`);
        } else {
            console.error(`❌ Erro: ${dados.message || JSON.stringify(dados)}`);
        }
    }
}

async function listarPlataformas() {
    const resposta = await fetch(`${ENDPOINT}/projects/${PROJECT_ID}/platforms`, {
        headers: {
            'X-Appwrite-Key': API_KEY,
            'X-Appwrite-Project': PROJECT_ID,
        },
    });
    const dados = await resposta.json();
    console.log('\n📋 Plataformas cadastradas:');
    if (dados.platforms?.length) {
        dados.platforms.forEach((p: { hostname: string; name: string; type: string }) => {
            console.log(`   - ${p.type}: ${p.hostname} (${p.name})`);
        });
    } else {
        console.log('   Nenhuma plataforma cadastrada.');
    }
}

async function main() {
    // Adiciona plataformas para produção e localhost
    await adicionarPlataforma('LeadsCRM Produção', 'leads.grovehub.com.br');
    await adicionarPlataforma('LeadsCRM Local', 'localhost');
    await listarPlataformas();
}

main().catch(console.error);
