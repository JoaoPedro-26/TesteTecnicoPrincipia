export default class teste{
    constructor(root) {
        this.root = root;
    }

    update(listaPrincipal, headerColumns = []) {
        this.clear();
        this.setHeader(headerColumns);
        this.setBody(listaPrincipal);        
        fazerCalculo(listaPrincipal);
    }

    clear() {
        this.root.innerHTML = "";
    }

    setHeader(headerColumns) {
        this.root.insertAdjacentHTML("afterbegin", `
            <thead>
                ${headerColumns.map(text => `<th>${text}</th>`).join("")}
                <th>Opções</th>
            </thead>
        `);
    }

    setBody(listaPrincipal) {
        let count = 0;
        const rowsHtml = listaPrincipal.map(row => {         
            let htmlRetorno = `
                <tr id="row${count}">
                    ${row.map((text) => `<td>${text}</td>`).join("")}
                    <td><button type="submit" class="edit">Editar</button> <button class="delete">Deletar</button></td>
                </tr>
            `;
            count++; 
            return htmlRetorno;
        })
        this.root.insertAdjacentHTML("beforeend", `
            <tbody id="bodyTabela">
                ${rowsHtml.join("")}
            </tbody>            
        `);

        var buttonEdit = document.getElementsByClassName("edit");
        for (let i = 0; i < buttonEdit.length; i++) buttonEdit[i].onclick = function () { editButton(i, listaPrincipal) };

        var buttonDelete = document.getElementsByClassName("delete");
        for (let i = 0; i < buttonDelete.length; i++) buttonDelete[i].onclick = function () { deleteButton(i, listaPrincipal) };
    }
}

function editButton(editRow, data) {
    let stringText = '';
    data[editRow].map((text, aux) =>{
        if(aux == 3){
            stringText+=`
            <td>
                <select id="${aux}${editRow}" value="${text} name="status">
                    <option value="pago">pago</option>
                    <option value="aberto">aberto</option>
                </select>
            </td>`;
        }else{
            stringText+= `<td><input type="text" id="${aux}${editRow}" value="${text}"/></td>`;
        }
        
    });
    document.getElementById("row" + editRow).outerHTML = `
    <tr id="row${editRow}">
        ${stringText}
        <td><button class="confirm" id="confirm${editRow}">Confirmar</button> <button class="delete">Deletar</button></td>
    </tr>`;

    document.getElementById(`confirm${editRow}`).onclick = function () { confirm(editRow, data) };

    var buttonDelete = document.getElementsByClassName("delete");
    for (let i = 0; i < buttonDelete.length; i++) buttonDelete[i].onclick = function () { deleteButton(i, data) };
}

function ordenaBodyDelete(listaPrincipal){
    let count = 0;
    const tableRoot = document.querySelector("#table-container");
    document.getElementById("bodyTabela").outerHTML = "";
    const rowsHtml = listaPrincipal.map(row => {         
        let htmlRetorno = `
            <tr id="row${count}">
                ${row.map((text) => `<td>${text}</td>`).join("")}
                <td><button type="submit" class="edit">Editar</button> <button class="delete">Deletar</button></td>
            </tr>
        `;
        count++; 
        return htmlRetorno;
    })
    tableRoot.insertAdjacentHTML("beforeend", `
        <tbody id="bodyTabela">
            ${rowsHtml.join("")}
        </tbody>            
    `);

    var buttonEdit = document.getElementsByClassName("edit");
    for (let i = 0; i < buttonEdit.length; i++) buttonEdit[i].onclick = function () { editButton(i, listaPrincipal) };

    var buttonDelete = document.getElementsByClassName("delete");
    for (let i = 0; i < buttonDelete.length; i++) buttonDelete[i].onclick = function () { deleteButton(i, listaPrincipal) };
}

function deleteButton(rowDelete, data) {
    document.getElementById("row" + rowDelete).outerHTML = "";
    data.splice(rowDelete, 1);
    ordenaBodyDelete(data);
    fazerCalculo(data);
}

function confirm(confirmRow, data) {
    data[confirmRow].map((value,index) => {
        let valorLinha = document.getElementById(`${index}${confirmRow}`);
        data[confirmRow][index] = valorLinha.value;
    })
    let dados = document.getElementById("row" + confirmRow);

    dados.outerHTML = `
    <tr id="row${confirmRow}">
        ${data[confirmRow].map((text) => `<td>${text}</td>`).join("")}
        <td><button class="edit">Editar</button> <button class="delete">Deletar</button></td>
    </tr>`;

    var buttonEdit = document.getElementsByClassName("edit");

    for (let i = 0; i < buttonEdit.length; i++) buttonEdit[i].onclick = function () { editButton(i, data) };

    var buttonDelete = document.getElementsByClassName("delete");
    for (let i = 0; i < buttonDelete.length; i++) buttonDelete[i].onclick = function () { deleteButton(i, data) };

    fazerCalculo(data);
}

function tableToCSV(data) {
    var csv_data = [];
    var tabela = ["mes", "inadimplência"];
    csv_data.push(tabela);
    data.map(teste => {
        var csvRow = [];
        teste.map(outroTeste => {
            csvRow.push(outroTeste);
        })
        csv_data.push(csvRow.join(","))
    })

    csv_data = csv_data.join('\n');
    downloadCSVFile(csv_data);
}

function downloadCSVFile(csv_data) {

    var CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });

    var temp_link = document.createElement('a');

    temp_link.download = "tabela.csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    temp_link.click();
    document.body.removeChild(temp_link);
}

function fazerCalculo(data) {
    let listaPrincipal = [];
    let listaSecundaria = [];
    let total = 0;
    let naoPago = 0;
    let inadimplencia = 0;
    data.map(enviarDados => {
        listaPrincipal.push(enviarDados);
    })
    listaPrincipal.sort(function (a, b) {
        let dataA = new Date(a[1]);
        let dataB = new Date(b[1]);
        if (dataA < dataB) {
            return -1
        }
        if (dataA > dataB) {
            return 1;
        }
        return 0;
    });
    let trocaMes = listaPrincipal[0][1];
    let countyMes = 0;

    listaPrincipal.map((row, index) => {
        if (trocaMes != row[1]) {
            inadimplencia = (naoPago / total);
            let rowInadimplencia = [trocaMes, inadimplencia.toFixed(3)];
            listaSecundaria.push(rowInadimplencia);
            trocaMes = row[1];
            countyMes++;

            if (countyMes == 6) {
                total = 0;
                naoPago = 0;
                countyMes = 0;
            }
        }

        if (row[3] == "aberto") {
            naoPago += parseFloat(row[2]);
        }

        total += parseFloat(row[2]);

        if (index == listaPrincipal.length - 1) {
            inadimplencia = (naoPago / total);
            let rowInadimplencia = [trocaMes, inadimplencia.toFixed(3)];
            listaSecundaria.push(rowInadimplencia);
            trocaMes = row[1];
        }
    });
    tabelaInadimplencia(listaSecundaria);
}

function tabelaInadimplencia(resultadoInadimplencia) {
    var Table = document.getElementById("table-container-inadimplencia");
    Table.innerHTML = "";
    const tableInadimplencia = document.querySelector("#table-container-inadimplencia");
    tableInadimplencia.insertAdjacentHTML("afterbegin", `
        <thead>
            <th>Mês</th>
            <th>Inadimplencia</th>
        </thead>
    `);
    const rowsHtml = resultadoInadimplencia.map(row => {
        return `
            <tr>
                ${row.map((text) => `<td>${text}</td>`).join("")}
            </tr>
        `;
    })
    tableInadimplencia.insertAdjacentHTML("beforeend", `
        <tbody>
            ${rowsHtml.join("")}
        </tbody>
        <button class="downloadButton" id="tableToCSV">Download CSV</button>
    `)
    document.getElementById(`tableToCSV`).onclick = function () { tableToCSV(resultadoInadimplencia) };
}