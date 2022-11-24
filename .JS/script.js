"use strict";
//https://www.futurelearn.com/info/courses/how-computers-work/0/steps/49284
const PopulateRAM = (bits) => {
    const RAMTable = document.getElementById("RAM");
    RAMTable.innerHTML = "";
    const headers = document.createElement('tr');
    headers.innerHTML = `
    <th> Address </th>
    <th> Value/Instruction </th>
    `;
    RAMTable.append(headers);
    for (let i = 0; i != bits; i += 1) {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td> ${i} </td>
        <td> 0 </td>
        `;
        RAMTable.append(row);
    }
};
const Main = () => {
    PopulateRAM(16);
};
Main();
