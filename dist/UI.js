"use strict";
const SyncComponents = () => {
    const [PCText, MARText, MDRText, CIRText, AccText] = [document.getElementById("PCText"), document.getElementById("MARText"), document.getElementById("MDRText"), document.getElementById("CIRText"), document.getElementById("AccumulatorText")];
    PCText.innerText = String(PC);
    MARText.innerText = (MAR == undefined) ? "" : String(MAR);
    MDRText.innerText = (MDR.operand == undefined) ? "" : `${MDR.opcode} ${MDR.operand}`; //opcode can be undefined since the value may just be a static number
    CIRText.innerText = (CIR.operand == undefined) ? "" : `${CIR.opcode} ${CIR.operand}`;
    AccText.innerText = (Accumulator == undefined) ? "" : String(Accumulator);
    const RAMTable = document.getElementById("RAM");
    RAMTable.innerHTML = "";
    const headers = document.createElement('tr');
    headers.innerHTML = `
    <th> Address </th>
    <th> Value </th>
    `;
    RAMTable.append(headers);
    for (const [i, data] of RAM.entries()) {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td> ${i} </td>
        <td> ${data.opcode} ${data.operand} </td>
        `;
        RAMTable.append(row);
    }
    const cycleProgressText = document.getElementById("cycleProgressText");
    cycleProgressText.innerText = `Cycle ${CYCLE_COUNTER + 1}`; //CYCLE_COUNTER starts at 0, but 1 is more understandable
    const progressTable = document.getElementById("progress");
    progressTable.innerHTML = "";
    for (const update of CURRENT_CYCLE) {
        const row = document.createElement('tr');
        row.innerHTML = `<td> ${update} </td>`;
        if (update == "Prepare for next cycle") {
            row.className = "final";
        }
        else if (update == "Stopped program") {
            row.className = "finalStopped";
        }
        progressTable.append(row);
    }
    if (CURRENT_CYCLE.length == 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td><i> No progress yet... </i></td>`;
        progressTable.append(row);
    }
};
const InitialiseInstructionSet = () => {
    const instructionSetTable = document.getElementById("instructionSet");
    instructionSetTable.innerHTML = "";
    const headers = document.createElement('tr');
    headers.innerHTML = `
    <th> Instruction </th>
    <th> Explanation </th>
    `;
    instructionSetTable.append(headers);
    for (const key in OPERATIONS) {
        const instruction = OPERATIONS[key];
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${instruction.description}</td>
        <td>${instruction.explanation}</td>
        `;
        instructionSetTable.append(row);
    }
};
const InitListeners = () => {
    const compileButton = document.getElementById("compile");
    const nextStepButton = document.getElementById("increment");
    const nextCycleButton = document.getElementById("nextCycle");
    compileButton.onclick = () => {
        CompileAssemblyCode();
    };
    nextStepButton.onclick = () => {
        IncrementStep();
    };
    nextCycleButton.onclick = () => {
        if (STEP_COUNTER == STEPS.length - 1) {
            IncrementStep();
        }
        while (STEP_COUNTER != STEPS.length - 1) {
            IncrementStep();
        }
    };
};
const PositionArrows = () => {
    const addressBus = document.getElementById("addressBus");
    const dataBus = document.getElementById("dataBus");
    const [MAR, MDR] = [document.getElementById("MAR").getBoundingClientRect(), document.getElementById("MDR").getBoundingClientRect()];
    const [MARHeight, MDRHeight] = [MAR.height, MDR.height];
    addressBus.style.translate = `0 ${MARHeight / 1.5}px`;
    dataBus.style.translate = `0 -${MDRHeight / 1.5}px`;
};
