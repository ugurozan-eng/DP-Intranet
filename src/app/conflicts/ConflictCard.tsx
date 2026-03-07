"use client";

import { useTransition } from "react";
import { resolveConflict } from "./actions";

type ConflictCardProps = {
    chatId: string;
    contactName: string;
    phoneNumber: string;
    lastDate: string;
    prices: string[];
};

export function ConflictCard({ chatId, contactName, phoneNumber, lastDate, prices }: ConflictCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleResolve = (price: string) => {
        startTransition(async () => {
            await resolveConflict(chatId, price);
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-800">{contactName}</h3>
                    <p className="text-sm text-slate-500">{phoneNumber}</p>
                </div>
                <div className="text-sm bg-white px-3 py-1 rounded-full text-slate-600 border border-slate-200 shadow-sm">
                    {lastDate}
                </div>
            </div>
            <div className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-3">Detected Prices (Click to select the correct one):</p>
                <div className="flex flex-wrap gap-3">
                    {prices.map((price, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleResolve(price)}
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {price}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
