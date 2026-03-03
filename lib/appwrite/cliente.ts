import { Client, Account, Databases, Storage } from 'appwrite';

// Cliente Appwrite para uso no navegador (browser)
const cliente = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const conta = new Account(cliente);
export const banco = new Databases(cliente);
export const armazenamento = new Storage(cliente);
export { cliente };
