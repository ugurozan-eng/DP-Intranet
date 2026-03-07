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
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Service"
        >
            <Trash2 size={18} />
        </button>
    );
}
