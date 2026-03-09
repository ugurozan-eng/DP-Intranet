const xlsx = require('xlsx');

function readExcel() {
    try {
        const file = "C:\\Claude Projects\\intranet\\web\\urun_scriptleri.xlsx";
        const wb = xlsx.readFile(file);
        const name = wb.SheetNames[0];
        const sheet = wb.Sheets[name];
        const json = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // read as array of arrays

        // Find row with Sıvı Yüz germe
        for (let i = 0; i < json.length; i++) {
            if (json[i] && json[i][0] && typeof json[i][0] === 'string' && json[i][0].includes('Sıvı Yüz germe')) {
                console.log(`Row ${i}:`, json[i]);
                for (let j = 1; j < 10; j++) {
                    console.log(`Row ${i + j}:`, json[i + j]);
                }
                break;
            }
        }

    } catch (e) {
        console.error(e.message);
    }
}

readExcel();
