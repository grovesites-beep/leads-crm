import { Client, Account, Databases, Storage, Users } from 'node-appwrite';

/**
 * Cria um cliente Appwrite para uso no servidor (com API Key)
 * Use este cliente em Server Components, Server Actions e API Routes
 */
export function criarClienteServidor() {
    const cliente = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    return {
        cliente,
        conta: new Account(cliente),
        banco: new Databases(cliente),
        armazenamento: new Storage(cliente),
        usuarios: new Users(cliente),
    };
}

/**
 * Cria um cliente Appwrite com sessão do usuário (via cookie)
 * Use este cliente para operações autenticadas como o usuário logado
 */
export function criarClienteComSessao(sessao: string) {
    const cliente = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setSession(sessao);

    return {
        cliente,
        conta: new Account(cliente),
        banco: new Databases(cliente),
        armazenamento: new Storage(cliente),
    };
}

// Constantes dos IDs do banco de dados e coleções
export const IDS_BANCO = {
    DATABASE_ID: process.env.APPWRITE_DATABASE_ID || 'leads_crm_db',
    COLECAO_CLIENTES: process.env.APPWRITE_COLLECTION_CLIENTS || 'clientes',
    COLECAO_LEADS: process.env.APPWRITE_COLLECTION_LEADS || 'leads',
    COLECAO_CONFIGURACOES: process.env.APPWRITE_COLLECTION_SETTINGS || 'configuracoes',
} as const;
