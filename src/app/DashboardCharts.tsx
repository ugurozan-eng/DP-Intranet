"use client";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { motion, Variants } from "framer-motion";

type FunnelStep = { name: string; value: number };
type Sentiment = { name: string; value: number };
type Service = { name: string; count: number };

export default function DashboardCharts({
    funnelData, sentimentData, serviceData
}: {
    funnelData: FunnelStep[],
    sentimentData: Sentiment[],
    serviceData: Service[]
}) {

    const COLORS = ['#10b981', '#cbd5e1', '#f43f5e'];

    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVar: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVar}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12"
        >

            {/* Sales Funnel */}
            <motion.div variants={itemVar} className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -z-10" />
                <h3 className="text-xl font-extrabold text-slate-800 mb-6 drop-shadow-sm tracking-tight">Satış Hunisi</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ left: 50, right: 20 }}>
                            <defs>
                                <linearGradient id="colorFunnel" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }} />
                            <Bar dataKey="value" fill="url(#colorFunnel)" radius={[0, 8, 8, 0]} barSize={26} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Service Demand */}
            <motion.div variants={itemVar} className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-50/50 rounded-br-full -z-10" />
                <h3 className="text-xl font-extrabold text-slate-800 mb-6 drop-shadow-sm tracking-tight">Hizmet Talep Dağılımı (Top 5)</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={serviceData} margin={{ top: 20 }}>
                            <defs>
                                <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#c084fc" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#7e22ce" stopOpacity={0.9} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontWeight: 'bold' }} />
                            <Bar dataKey="count" fill="url(#colorService)" radius={[8, 8, 0, 0]} barSize={38} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div variants={itemVar} className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden lg:col-span-2 mx-auto w-full lg:w-2/3">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-50/50 rounded-tl-full -z-10" />
                <h3 className="text-xl font-extrabold text-slate-800 mb-6 text-center drop-shadow-sm tracking-tight">Müşteri Duygu Analizi</h3>
                <div className="h-80 w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                                cornerRadius={12}
                                stroke="none"
                            >
                                {sentimentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 24px', fontWeight: 'bold' }} itemStyle={{ fontWeight: "bold" }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={12} wrapperStyle={{ fontWeight: 500, color: '#475569', fontSize: 14 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

        </motion.div>
    );
}
