const xlsx = require('xlsx');

function readExcel() {
    console.log("Reading excel file...");
    try {
        const file = "C:\\Claude Projects\\intranet\\web\\klinik_fiyat_listesi.xlsx";
        const wb = xlsx.readFile(file);
        const name = wb.SheetNames[0];
        const sheet = wb.Sheets[name];
        const json = xlsx.utils.sheet_to_json(sheet);
        console.log("First 3 rows:", json.slice(0, 3));
    } catch (e) {
        console.error(e.message);
    }
}

readExcel();
