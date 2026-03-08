"use client";

import { useTransition } from "react";
import { deleteService } from "./actions";
import { Trash2 } from "lucide-react";

export function DeleteServiceButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => startTransition(() => deleteService(id))}
            disabled={isPending}
            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
            title="Sil"
        >
            <Trash2 size={14} />
        </button>
    );
}
