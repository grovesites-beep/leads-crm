"use client";

import * as React from "react";
import { useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, Trash2, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteLead } from "@/lib/appwrite/actions";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

export type Lead = {
    $id: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    status: string;
    clientName?: string;
    $createdAt: string;
};

export const columns: ColumnDef<Lead>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-medium ml-4">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "clientName",
        header: "Proprietário",
        cell: ({ row }) => {
            const clientName = row.getValue("clientName") as string;
            if (!clientName) return null;
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 gap-1 font-bold">
                        <Building2 className="h-3 w-3" /> {clientName}
                    </Badge>
                </div>
            );
        }
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "phone",
        header: "Telefone",
        cell: ({ row }) => <div>{row.getValue("phone") || "N/A"}</div>,
    },
    {
        accessorKey: "source",
        header: "Origem",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("source")}</Badge>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge className={status === "new" ? "bg-blue-500" : "bg-zinc-500"}>
                    {status === "new" ? "Novo" : status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "$createdAt",
        header: "Data",
        cell: ({ row }) => {
            const date = new Date(row.getValue("$createdAt"));
            return <div>{date.toLocaleDateString("pt-BR")}</div>;
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row, table }) => {
            const lead = row.original;
            // @ts-ignore
            const setSelectedLead = table.options.meta?.setSelectedLead;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(lead.$id)}
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                            Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                                if (confirm("Tem certeza que deseja excluir este lead?")) {
                                    const res = await deleteLead(lead.$id);
                                    if (res.success) {
                                        toast.success("Lead excluído!");
                                        // @ts-ignore
                                        table.options.meta?.refresh();
                                    } else {
                                        toast.error("Erro ao excluir");
                                    }
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function LeadsDataTable({ data }: { data: Lead[] }) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Esconder a coluna de cliente se nenhum lead tiver clientName (ex: visão do cliente normal)
    React.useEffect(() => {
        const hasClientInfo = data.some(l => !!l.clientName);
        if (!hasClientInfo) {
            setColumnVisibility(prev => ({ ...prev, clientName: false }));
        } else {
            setColumnVisibility(prev => ({ ...prev, clientName: true }));
        }
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        meta: {
            setSelectedLead: (lead: Lead) => setSelectedLead(lead),
            refresh: () => router.refresh()
        },
    });

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filtrar por nome..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Colunas <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id === "name" ? "Nome" :
                                            column.id === "clientName" ? "Proprietário" :
                                                column.id === "email" ? "Email" :
                                                    column.id === "phone" ? "Telefone" :
                                                        column.id === "source" ? "Origem" :
                                                            column.id === "status" ? "Status" :
                                                                column.id === "$createdAt" ? "Data" : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Nenhum lead encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} lead(s) captado(s).
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Próximo
                    </Button>
                </div>
            </div>

            <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Detalhes do Lead</SheetTitle>
                        <SheetDescription>
                            Informações completas captadas via landing page.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                        {selectedLead?.clientName && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Pertence ao Parceiro</Label>
                                <div className="flex items-center gap-2 font-bold text-primary">
                                    <Building2 className="h-4 w-4" /> {selectedLead?.clientName}
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Nome Completo</Label>
                            <p className="text-lg font-semibold">{selectedLead?.name}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">E-mail</Label>
                            <p className="font-medium">{selectedLead?.email}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">WhatsApp / Telefone</Label>
                            <p className="font-medium">{selectedLead?.phone || "Não informado"}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Origem da Captação</Label>
                            <div><Badge variant="secondary">{selectedLead?.source}</Badge></div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Data da Captação</Label>
                            <p className="text-sm">
                                {selectedLead?.$createdAt && new Date(selectedLead.$createdAt).toLocaleString("pt-BR")}
                            </p>
                        </div>
                        <div className="pt-4 flex gap-2">
                            <Button className="w-full" variant="outline" onClick={() => window.open(`https://wa.me/${selectedLead?.phone?.replace(/\D/g, "")}`, "_blank")}>
                                Chamar no WhatsApp
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
