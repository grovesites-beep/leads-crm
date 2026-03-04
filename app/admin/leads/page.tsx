import { listarLeads } from '@/lib/actions/leads';
import { TabelaLeads } from '@/components/leads/TabelaLeads';

export const metadata = { title: 'Todos os Leads – LeadsCRM Admin' };

export default async function PaginaAdminLeads() {
    const respostaLeads = await listarLeads({ porPagina: 50 });
    const leads = respostaLeads.dados?.leads || [];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-slate-900 dark:text-white text-2xl font-bold">Todos os Leads</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Visão global de todos os leads capturados no sistema</p>
            </div>

            <div>
                <TabelaLeads leadsIniciais={leads} />
            </div>
        </div>
    );
}
