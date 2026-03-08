"use client";

import { useState, useTransition } from "react";
import { updateServicePrice, updateServiceName } from "./actions";
import { DeleteServiceButton } from "./DeleteServiceButton";
import { Loader2, Copy, Check } from "lucide-react";

type Props = {
    service: {
        id: string;
        name: string;
        listPrice: number | null;
        campaignPrice: number | null;
    }
};

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
            title="Kopyala"
        >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
    );
}

export function EditableServiceRow({ service }: Props) {
    const [name, setName] = useState(service.name);
    const [listPrice, setListPrice] = useState(service.listPrice?.toString() || "");
    const [campaignPrice, setCampaignPrice] = useState(service.campaignPrice?.toString() || "");
    const [isPending, startTransition] = useTransition();

    const handlePriceBlur = (type: 'listPrice' | 'campaignPrice', val: string) => {
        const num = parseFloat(val);
        if (isNaN(num) && val !== "") return;
        const finalNum = isNaN(num) ? 0 : num;

        // Skip if same
        if (type === 'listPrice' && finalNum === service.listPrice) return;
        if (type === 'campaignPrice' && finalNum === service.campaignPrice) return;

        startTransition(async () => {
            await updateServicePrice(service.id, type, finalNum);
        });
    };

    const handleNameBlur = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed || trimmed === service.name) {
            setName(service.name);
            return;
        }

        startTransition(async () => {
            await updateServiceName(service.id, trimmed);
        });
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td className="px-6 py-4 relative group w-auto min-w-[250px]">
                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={(e) => handleNameBlur(e.target.value)}
                            className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded outline-none text-slate-900 font-medium px-2 py-1 w-full transition-all focus:ring-2 focus:ring-blue-100"
                        />
                        {isPending && <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 bg-slate-50/80 px-1 py-1 rounded-md shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyBtn text={name} />
                        <div className="w-px h-4 bg-slate-200"></div>
                        <DeleteServiceButton id={service.id} />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 hidden sm:table-cell relative group">
                <div className="flex items-center gap-2 justify-between max-w-[150px]">
                    <div className="relative inline-flex items-center flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">₺</span>
                        <input
                            type="number"
                            min="0"
                            value={listPrice}
                            onChange={(e) => setListPrice(e.target.value)}
                            onBlur={(e) => handlePriceBlur('listPrice', e.target.value)}
                            className="pl-6 pr-2 py-1 w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded outline-none text-slate-500 line-through decoration-slate-300 transition-all font-medium focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <CopyBtn text={listPrice ? `₺${listPrice}` : "0"} />
                </div>
            </td>
            <td className="px-6 py-4 relative group">
                <div className="flex items-center gap-2 justify-between max-w-[150px]">
                    <div className="relative inline-flex items-center flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-800 text-sm font-medium z-10 pointer-events-none">₺</span>
                        <input
                            type="number"
                            min="0"
                            value={campaignPrice}
                            onChange={(e) => setCampaignPrice(e.target.value)}
                            onBlur={(e) => handlePriceBlur('campaignPrice', e.target.value)}
                            className="pl-6 pr-2 py-1 w-full bg-emerald-100 border border-transparent hover:bg-emerald-200 focus:bg-white focus:border-emerald-500 rounded outline-none text-emerald-800 font-bold transition-all z-0 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>
                    <CopyBtn text={campaignPrice ? `₺${campaignPrice}` : "0"} />
                </div>
            </td>
        </tr>
    );
}
