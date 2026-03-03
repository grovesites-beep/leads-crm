// Tipos principais do sistema CRM de Leads

// ===== USUÁRIO =====
export interface Usuario {
    $id: string;
    nome: string;
    email: string;
    labels: string[];
    status: boolean;
    $createdAt: string;
}

// ===== CLIENTE (Tenant) =====
export interface Cliente {
    $id: string;
    nome: string;
    email: string;
    appwriteUserId: string;
    webhookToken: string;
    brandingLogo?: string;
    brandingCorPrimaria?: string;
    plano?: string;
    ativo: boolean;
    $createdAt: string;
    $updatedAt: string;
}

export interface ClienteFormulario {
    nome: string;
    email: string;
    senha?: string;
    brandingCorPrimaria?: string;
    plano?: string;
    ativo?: boolean;
}

// ===== LEAD =====
export type StatusLead = 'novo' | 'contatado' | 'qualificado' | 'perdido' | 'convertido';

export interface Lead {
    $id: string;
    clienteId: string;
    nome: string;
    email?: string;
    telefone?: string;
    origem?: string;
    status: StatusLead;
    notas?: string;
    metadados?: string; // JSON com dados extras do n8n
    $createdAt: string;
    $updatedAt: string;
}

export interface LeadFormulario {
    nome: string;
    email?: string;
    telefone?: string;
    origem?: string;
    status?: StatusLead;
    notas?: string;
}

// Mapeamento de cores para status dos leads
export const COR_STATUS_LEAD: Record<StatusLead, string> = {
    novo: 'bg-blue-500/15 text-blue-600 border-blue-200',
    contatado: 'bg-yellow-500/15 text-yellow-600 border-yellow-200',
    qualificado: 'bg-purple-500/15 text-purple-600 border-purple-200',
    perdido: 'bg-red-500/15 text-red-600 border-red-200',
    convertido: 'bg-green-500/15 text-green-600 border-green-200',
};

export const LABEL_STATUS_LEAD: Record<StatusLead, string> = {
    novo: 'Novo',
    contatado: 'Contatado',
    qualificado: 'Qualificado',
    perdido: 'Perdido',
    convertido: 'Convertido',
};

// ===== CONFIGURAÇÕES =====
export interface Configuracoes {
    $id: string;
    clienteId: string;
    webhookUrl?: string;
    permitirUsuariosExtras: boolean;
    $createdAt: string;
    $updatedAt: string;
}

// ===== RESPOSTA PADRÃO DAS ACTIONS =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RespostaAction<T = Record<string, any>> {
    sucesso: boolean;
    mensagem?: string;
    dados?: T;
    erro?: string;
}
