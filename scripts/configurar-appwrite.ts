/**
 * Script de configuração inicial do Appwrite
 * Cria o banco de dados e as coleções necessárias para o CRM de Leads
 * 
 * Executar com: npx tsx scripts/configurar-appwrite.ts
 */
import { Client, Databases, ID } from 'node-appwrite';

const cliente = new Client()
    .setEndpoint('https://appwrite.grovehub.com.br/v1')
    .setProject('69a6d01c0019a0f64ff4')
    .setKey('standard_8f6abcd5d2bd527d89ef657634ed25108574570e959c29a427279be0248383a609781a8705c709b293c8472b953c0dbdefa7db44eb78b5f0d0ef8aef45ef0e45264316e6e4ccba148bdc4a890510dcf4e52569006cba57b758699fdb36574adfb6437cd5406309b7a38ae8e32c63cac2d67d96bbe5d77639238c255069354b2a');

const banco = new Databases(cliente);

const DATABASE_ID = 'leads_crm_db';
const COLECAO_CLIENTES = 'clientes';
const COLECAO_LEADS = 'leads';
const COLECAO_CONFIGURACOES = 'configuracoes';

async function configurar() {
    console.log('🚀 Iniciando configuração do Appwrite...\n');

    // 1. Cria o banco de dados
    try {
        await banco.create(DATABASE_ID, 'CRM de Leads');
        console.log('✅ Banco de dados "leads_crm_db" criado.');
    } catch (e: unknown) {
        if (e instanceof Error && e.message?.includes('already exists')) {
            console.log('ℹ️  Banco de dados já existe, continuando...');
        } else throw e;
    }

    // 2. Cria a coleção de Clientes
    try {
        await banco.createCollection(DATABASE_ID, COLECAO_CLIENTES, 'Clientes', [
            'read("any")', // leitura pública (controlada via API Key no server)
        ]);
        console.log('✅ Coleção "clientes" criada.');

        // Atributos da coleção clientes
        const atributosClientes = [
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'nome', 255, true),
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'email', 255, true),
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'appwriteUserId', 36, true),
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'webhookToken', 36, true),
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'brandingLogo', 1024, false),
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'brandingCorPrimaria', 20, false),
            banco.createStringAttribute(DATABASE_ID, COLECAO_CLIENTES, 'plano', 50, false),
            banco.createBooleanAttribute(DATABASE_ID, COLECAO_CLIENTES, 'ativo', true, true),
        ];
        await Promise.all(atributosClientes);
        console.log('✅ Atributos da coleção "clientes" criados.');

        // Índice para buscar por webhookToken
        await new Promise(r => setTimeout(r, 2000));
        await banco.createIndex(DATABASE_ID, COLECAO_CLIENTES, 'idx_webhook_token', 'key', ['webhookToken'], ['ASC']);
        await banco.createIndex(DATABASE_ID, COLECAO_CLIENTES, 'idx_user_id', 'key', ['appwriteUserId'], ['ASC']);
        console.log('✅ Índices da coleção "clientes" criados.');
    } catch (e: unknown) {
        if (e instanceof Error && e.message?.includes('already exists')) {
            console.log('ℹ️  Coleção "clientes" já existe.');
        } else console.error('❌ Erro ao criar coleção clientes:', e);
    }

    // 3. Cria a coleção de Leads
    try {
        await banco.createCollection(DATABASE_ID, COLECAO_LEADS, 'Leads');
        console.log('✅ Coleção "leads" criada.');

        const atributosLeads = [
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'clienteId', 36, true),
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'nome', 255, true),
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'email', 255, false),
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'telefone', 50, false),
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'origem', 255, false),
            banco.createEnumAttribute(DATABASE_ID, COLECAO_LEADS, 'status', ['novo', 'contatado', 'qualificado', 'perdido', 'convertido'], true, 'novo'),
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'notas', 5000, false),
            banco.createStringAttribute(DATABASE_ID, COLECAO_LEADS, 'metadados', 10000, false),
        ];
        await Promise.all(atributosLeads);
        console.log('✅ Atributos da coleção "leads" criados.');

        await new Promise(r => setTimeout(r, 2000));
        await banco.createIndex(DATABASE_ID, COLECAO_LEADS, 'idx_cliente_id', 'key', ['clienteId'], ['ASC']);
        await banco.createIndex(DATABASE_ID, COLECAO_LEADS, 'idx_status', 'key', ['status'], ['ASC']);
        console.log('✅ Índices da coleção "leads" criados.');
    } catch (e: unknown) {
        if (e instanceof Error && e.message?.includes('already exists')) {
            console.log('ℹ️  Coleção "leads" já existe.');
        } else console.error('❌ Erro ao criar coleção leads:', e);
    }

    // 4. Cria a coleção de Configurações
    try {
        await banco.createCollection(DATABASE_ID, COLECAO_CONFIGURACOES, 'Configurações');
        console.log('✅ Coleção "configuracoes" criada.');

        await Promise.all([
            banco.createStringAttribute(DATABASE_ID, COLECAO_CONFIGURACOES, 'clienteId', 36, true),
            banco.createBooleanAttribute(DATABASE_ID, COLECAO_CONFIGURACOES, 'permitirUsuariosExtras', false, false),
        ]);
        console.log('✅ Atributos da coleção "configuracoes" criados.');
    } catch (e: unknown) {
        if (e instanceof Error && e.message?.includes('already exists')) {
            console.log('ℹ️  Coleção "configuracoes" já existe.');
        } else console.error('❌ Erro ao criar coleção configuracoes:', e);
    }

    console.log('\n🎉 Configuração do Appwrite concluída com sucesso!');
}

configurar().catch(console.error);
