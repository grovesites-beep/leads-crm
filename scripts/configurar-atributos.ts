/**
 * Script de configuração dos atributos das coleções do Appwrite
 * Corrigido para Appwrite 1.8.1: campos obrigatórios NÃO podem ter valor padrão
 *
 * Executar com: npx tsx scripts/configurar-atributos.ts
 */
import { Client, Databases } from 'node-appwrite';

const cliente = new Client()
    .setEndpoint('https://appwrite.grovehub.com.br/v1')
    .setProject('69a6d01c0019a0f64ff4')
    .setKey('standard_8f6abcd5d2bd527d89ef657634ed25108574570e959c29a427279be0248383a609781a8705c709b293c8472b953c0dbdefa7db44eb78b5f0d0ef8aef45ef0e45264316e6e4ccba148bdc4a890510dcf4e52569006cba57b758699fdb36574adfb6437cd5406309b7a38ae8e32c63cac2d67d96bbe5d77639238c255069354b2a');

const banco = new Databases(cliente);
const DB = 'leads_crm_db';

async function tentarCriar(fn: () => Promise<unknown>, nome: string) {
    try {
        await fn();
        console.log(`  ✅ ${nome}`);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists') || msg.includes('Attribute with the same key already exists')) {
            console.log(`  ℹ️  ${nome} (já existe)`);
        } else {
            console.error(`  ❌ ${nome}: ${msg}`);
        }
    }
}

async function configurarAtributos() {
    console.log('🔧 Configurando atributos das coleções...\n');

    // ===== COLEÇÃO: clientes =====
    console.log('📁 Coleção: clientes');
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'nome', 255, true), 'nome (obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'email', 255, true), 'email (obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'appwriteUserId', 36, true), 'appwriteUserId (obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'webhookToken', 64, true), 'webhookToken (obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'brandingLogo', 1024, false), 'brandingLogo (opcional)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'brandingCorPrimaria', 20, false), 'brandingCorPrimaria (opcional)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'clientes', 'plano', 50, false), 'plano (opcional)');
    await new Promise(r => setTimeout(r, 500));
    // ativo: obrigatório sem valor padrão
    await tentarCriar(() => banco.createBooleanAttribute(DB, 'clientes', 'ativo', true), 'ativo (obrigatório)');

    // Índices
    await new Promise(r => setTimeout(r, 3000));
    console.log('\n📑 Criando índices: clientes');
    await tentarCriar(() => banco.createIndex(DB, 'clientes', 'idx_webhook_token', 'key', ['webhookToken'], ['ASC']), 'idx_webhook_token');
    await tentarCriar(() => banco.createIndex(DB, 'clientes', 'idx_user_id', 'key', ['appwriteUserId'], ['ASC']), 'idx_user_id');
    await tentarCriar(() => banco.createIndex(DB, 'clientes', 'idx_ativo', 'key', ['ativo'], ['ASC']), 'idx_ativo');

    // ===== COLEÇÃO: leads =====
    console.log('\n📁 Coleção: leads');
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'clienteId', 36, true), 'clienteId (obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'nome', 255, true), 'nome (obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'email', 255, false), 'email (opcional)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'telefone', 50, false), 'telefone (opcional)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'origem', 255, false), 'origem (opcional)');
    await new Promise(r => setTimeout(r, 500));
    // status: enum obrigatório, sem default (Appwrite 1.8.1 não aceita required+default em enum)
    await tentarCriar(() => banco.createEnumAttribute(DB, 'leads', 'status', ['novo', 'contatado', 'qualificado', 'perdido', 'convertido'], true), 'status (enum obrigatório)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'notas', 5000, false), 'notas (opcional)');
    await new Promise(r => setTimeout(r, 500));
    await tentarCriar(() => banco.createStringAttribute(DB, 'leads', 'metadados', 10000, false), 'metadados (opcional)');

    // Índices
    await new Promise(r => setTimeout(r, 3000));
    console.log('\n📑 Criando índices: leads');
    await tentarCriar(() => banco.createIndex(DB, 'leads', 'idx_cliente_id', 'key', ['clienteId'], ['ASC']), 'idx_cliente_id');
    await tentarCriar(() => banco.createIndex(DB, 'leads', 'idx_status', 'key', ['status'], ['ASC']), 'idx_status');
    await tentarCriar(() => banco.createIndex(DB, 'leads', 'idx_cliente_created', 'key', ['clienteId', '$createdAt'], ['ASC', 'DESC']), 'idx_cliente_created');

    console.log('\n🎉 Atributos e índices configurados com sucesso!');
}

configurarAtributos().catch(console.error);
