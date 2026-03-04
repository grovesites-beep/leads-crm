import { listarClientes } from '@/lib/actions/clientes';
import { TabelaClientes } from '@/components/admin/TabelaClientes';

export const metadata = { title: 'Clientes – LeadsCRM Admin' };

export default async function PaginaAdminClientes() {
    const respostaClientes = await listarClientes();
    const clientes = respostaClientes.dados?.clientes || [];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-slate-900 dark:text-white text-2xl font-bold">Gestão de Clientes</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Crie, edite e gerencie o acesso dos seus clientes</p>
            </div>

            <div>
                <TabelaClientes clientesIniciais={clientes} />
            </div>
        </div>
    );
}
