export default function FormsPage() {
    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Formlar</h1>
                <p className="text-slate-500 mt-2">
                    Klinik içi formlar ve belgeler burada listelenecektir.
                </p>
            </div>

            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 mt-6">
                <h3 className="text-lg font-medium text-slate-900">Henüz Form Eklenmedi</h3>
                <p className="text-slate-500 mt-1">Bu sayfa şu an için boştur.</p>
            </div>
        </div>
    );
}
