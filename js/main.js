import TableCsv from "./TableCsv.js";

const tableRoot = document.querySelector("#table-container");
const csvFileInput = document.querySelector("#csvFileInput");
const tableCsv = new TableCsv(tableRoot);

csvFileInput.addEventListener("change", e => {
    console.log(csvFileInput.files[0]);

    Papa.parse(csvFileInput.files[0], {
        delimiter: ",",
        skipEmptyLines: true,
        complete: results => {
            tableCsv.update(results.data.splice(1), results.data[0]);
        }
    });
});