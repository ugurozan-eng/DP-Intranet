import { prisma } from "@/lib/prisma";
import { ConflictCard } from "./ConflictCard";

export const dynamic = 'force-dynamic';

export default async function ConflictsPage() {
    const allInsights = await prisma.crmInsight.findMany({
        where: {
            prices_mentioned: {
                not: null,
            },
        },
        include: {
            chat: {
                select: {
                    phone_number: true,
                    contact_name: true,
                    last_message_date: true,
                }
            }
        }
    });

    // Filter only those with multiple prices parsed as array
    // Ex: "["4.000 tl", "7.990 tl"]"
    const conflicts = allInsights.filter((insight) => {
        if (!insight.prices_mentioned) return false;
        try {
            const parsed = JSON.parse(insight.prices_mentioned);
            return Array.isArray(parsed) && parsed.length > 1;
        } catch {
            return false;
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Price Conflicts</h1>
                    <p className="text-slate-500 mt-2">
                        Resolve chats where AI detected multiple conflicting prices.
                    </p>
                </div>
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-medium">
                    {conflicts.length} Unresolved Conflicts
                </div>
            </div>

            <div className="grid gap-6">
                {conflicts.map((conflict) => {
                    const prices = JSON.parse(conflict.prices_mentioned || "[]") as string[];
                    let products: string[] = [];
                    try {
                        products = JSON.parse(conflict.products_mentioned || "[]");
                    } catch { }

                    return (
                        <ConflictCard
                            key={conflict.chat_id}
                            chatId={conflict.chat_id}
                            contactName={conflict.chat?.contact_name || "Unknown"}
                            phoneNumber={conflict.chat?.phone_number || conflict.chat_id}
                            lastDate={conflict.chat?.last_message_date || ""}
                            prices={prices}
                            products={products}
                        />
                    );
                })}
                {conflicts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                        <p className="text-slate-500 mt-1">No conflicting prices found in the database.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
