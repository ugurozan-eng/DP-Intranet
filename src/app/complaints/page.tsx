import { AlertCircle, FileText } from "lucide-react";
import { CopyBtn } from "../scripts/ClientComponents";

const complaintsData = [
    {
        type: "İade Talebi",
        protocol: "1. Müşterinin neden iade istediğini nazikçe sorun.\n2. Sözleşme şartlarına atıfta bulunmadan önce müşteri memnuniyetine odaklanın.\n3. İade sürecini başlatmak için finans departmanı onayı gerektiğini belirtin.",
        template: "Merhaba [İsim] Hanım, iade talebinizle ilgili görüşlerinizi dikkate alıyoruz. Yaşadığınız durum için üzgünüz. Konuyu ilgili yöneticilerimize iletiyorum, en kısa sürede tarafınıza geri dönüş sağlanacaktır."
    },
    {
        type: "Hizmet Memnuniyetsizliği",
        protocol: "1. Müşteriyle empati kurun ve suçlayıcı dil kullanmayın.\n2. Ücretsiz kontrol veya telafi seansı teklif edin.\n3. Olayı detaylandırarak şube müdürüne raporlayın.",
        template: "Merhaba [İsim] Hanım, belirtmiş olduğunuz durumla ilgili sizi dinlemek ve sorunu çözmek isteriz. Dilerseniz uzmanlarımız eşliğinde ücretsiz bir değerlendirme seansı planlayabiliriz. Sizi ne zaman aramamızı istersiniz?"
    },
    {
        type: "SMS Şikayeti / İptali",
        protocol: "1. Müşterinin numarasını anında SMS iptal listesine ekleyin.\n2. Sistemden onaylayın ve müşteriye bilgi verin.",
        template: "Merhaba, tarafınıza gönderilen bilgilendirme mesajlarından rahatsızlık duyduğunuz için özür dileriz. Numaranız sistemden pasife alınmıştır, bir daha mesaj almayacaksınız. İyi günler dileriz."
    },
    {
        type: "Eski Paket / Fiyat İtirazı",
        protocol: "1. Müşterinin eski ödediği fiyatın kampanya dönemi olduğunu açıklayın.\n2. Güncel maliyetler nedeniyle eski fiyattan işlem yapılamayacağını yumuşak bir dille belirtin.\n3. Varsa mevcut en uygun kampanyayı sunun.",
        template: "Merhaba [İsim] Hanım, bir önceki paketinizde yer alan fiyatlar ilgili ayın kampanya şartlarına özeldi. Şu an uygulamakta olduğumuz güncel liste fiyatlarımız üzerinden yardımcı olabiliyoruz. Size özel sunabileceğim şu anki en avantajlı kampanyamız şudur: [Kampanya Bilgisi]"
    }
];

export default function ComplaintsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Şikayet Yönetimi</h1>
                <p className="text-slate-500 mt-2">Kriz durumlarında uygulanması gereken protokoller ve hazır yanıt taslakları.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {complaintsData.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
                            <AlertCircle className="text-red-500" />
                            <h2 className="text-xl font-bold text-red-900">{item.type}</h2>
                        </div>

                        <div className="p-6 flex-1 flex flex-col gap-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FileText size={16} /> Karşılama Protokolü
                                </h3>
                                <ul className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
                                    {item.protocol.split("\n").map((line, i) => (
                                        <li key={i}>{line.replace(/^\d+\.\s/, "")}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-auto bg-slate-50 rounded-lg p-5 relative border border-slate-100 group">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded-md">
                                    <CopyBtn text={item.template} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Hazır Yanıt Şablonu</h3>
                                <p className="text-slate-600 font-mono text-sm leading-relaxed">{item.template}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
