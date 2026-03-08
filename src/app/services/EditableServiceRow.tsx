"use client";

import { useState, useTransition } from "react";
import { updateServicePrice } from "./actions";
import { DeleteServiceButton } from "./DeleteServiceButton";
import { Loader2 } from "lucide-react";

type Props = {
    service: {
        id: string;
        name: string;
        listPrice: number | null;
        campaignPrice: number | null;
    }
};

export function EditableServiceRow({ service }: Props) {
    const [listPrice, setListPrice] = useState(service.listPrice?.toString() || "");
    const [campaignPrice, setCampaignPrice] = useState(service.campaignPrice?.toString() || "");
    const [isPending, startTransition] = useTransition();

    const handleBlur = (type: 'listPrice' | 'campaignPrice', val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return;

        // Skip if same
        if (type === 'listPrice' && num === service.listPrice) return;
        if (type === 'campaignPrice' && num === service.campaignPrice) return;

        startTransition(async () => {
            await updateServicePrice(service.id, type, num);
        });
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-4 text-slate-900 font-medium flex items-center gap-2">
                {service.name}
                {isPending && <Loader2 size={14} className="animate-spin text-slate-400" />}
            </td>
            <td className="px-6 py-4 hidden sm:table-cell relative">
                <span className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₺</span>
                <input
                    type="number"
                    min="0"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    onBlur={(e) => handleBlur('listPrice', e.target.value)}
                    className="pl-5 pr-2 py-1 w-24 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded outline-none text-slate-500 line-through decoration-slate-300 transition-all font-medium"
                />
            </td>
            <td className="px-6 py-4 relative">
                <div className="relative inline-flex flex-col items-start justify-center">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-800 text-sm font-medium z-10">₺</span>
                    <input
                        type="number"
                        min="0"
                        value={campaignPrice}
                        onChange={(e) => setCampaignPrice(e.target.value)}
                        onBlur={(e) => handleBlur('campaignPrice', e.target.value)}
                        className="pl-5 pr-2 py-1 w-24 bg-emerald-100 border border-transparent focus:border-emerald-500 rounded outline-none text-emerald-800 font-medium transition-all z-0"
                    />
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteServiceButton id={service.id} />
                </div>
            </td>
        </tr>
    );
}
