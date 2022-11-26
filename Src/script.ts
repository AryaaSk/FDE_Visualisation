//https://www.futurelearn.com/info/courses/how-computers-work/0/steps/49284
interface Instruction {
    opcode: string;
    operand?: number;
}
const Instruction = (opcode: string, operand?: number) => {
    return { opcode: opcode, operand: operand };
}
const OperationVorR: {[operation: string] : string} = { //dictionary containing information whether an instruction's operand is a value or reference in RAM
    "LOADV" : "V",
    "LOADA" : "R",
    "ADD": "R",
    "STORE": "V"
}
//V stands for value, R stands for reference

let PC = 0;
let MAR: number | undefined = undefined;
let MDR = Instruction("", undefined);;
let CIR = Instruction("", undefined);;
let Accumulator: number | undefined = undefined;

const RAM: Instruction[] = [];

const STEPS = [
    //Fetch
    "Copy PC into MAR",
    "Fetch from RAM into MDR",
    "Copy MDR into CIR",
    "Increment PC",

    //Decode
    "Copy CIR Operand into MAR/MDR",
    "Fetch value from RAM into MDR",

    //Execute
    "Execute CIR Opcode",

    //Preparing for next step
    "Next cycle"
];
let STEP_COUNTER = 0;



const ResetRAM = (bits: number) => {
    for (let _ = 0; _ != bits; _ += 1) {
        RAM.push(Instruction("", 0));
    }
}

const ResetComponents = () => {
    PC = 0;
    MAR = undefined;
    MDR = Instruction("", undefined);;
    CIR = Instruction("", undefined);;
    Accumulator = undefined;
}
const SyncComponents = () => {
    const [PCText, MARText, MDRText, CIRText, AccText] = [document.getElementById("PCText")!, document.getElementById("MARText")!, document.getElementById("MDRText")!, document.getElementById("CIRText")!, document.getElementById("AccumulatorText")!];
    PCText.innerText = String(PC);
    MARText.innerText = (MAR == undefined) ? "" : String(MAR);
    MDRText.innerText = (MDR.operand == undefined) ? "" : `${MDR.opcode} ${MDR.operand}`; //opcode can be undefined since the value may just be a static number
    CIRText.innerText = (CIR.operand == undefined) ? "" : `${CIR.opcode} ${CIR.operand}`;
    AccText.innerText = (Accumulator == undefined) ? "" : String(Accumulator);


    const RAMTable = document.getElementById("RAM")!;
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
        RAMTable.append(row)
    }
}



const IncrementStep = () => {
    //Just use steps at top as instructions, and follow what they say
    const step = STEPS[STEP_COUNTER];

    //Fetch
    if (step == "Copy PC into MAR") {
        MAR = PC;
    }
    else if (step == "Fetch from RAM into MDR") {
        const instruction = RAM[MAR!];
        MDR.opcode = instruction.opcode;
        MDR.operand = instruction.operand;
    }
    else if (step == "Copy MDR into CIR") {
        CIR.opcode = MDR.opcode;
        CIR.operand = MDR.operand;
    }
    else if (step == "Increment PC") {
        PC += 1;
    }

    //Decode
    if (OperationVorR[CIR.opcode] == "R") {
        if (step == "Copy CIR Operand into MAR/MDR") {
            MAR = CIR.operand;
        }
        else if (step == "Fetch value from RAM into MDR") {
            const value = RAM[MAR!].operand!; 
            MDR.opcode = "";
            MDR.operand = value;
        }
    }
    else if (OperationVorR[CIR.opcode] == "V"){
        //Instead of moving operand to MAR to fetch value at that address, we simply move the operand straight to the MDR
        if (step == "Copy CIR Operand into MAR/MDR") {
            MDR.opcode = "";
            MDR.operand = CIR.operand!;
            STEP_COUNTER += 1; //skip Fetch value from RAM into MDR, since it we already have the value in the MDR
        }
    }

    //Execute
    if (step == "Execute CIR Opcode") {
        const operation = CIR.opcode;
        const value = MDR.operand!;

        if (operation == "LOADA" || operation == "LOADV") {
            Accumulator = value;
        }
        else if (operation == "ADD") {
            const value1 = Accumulator!;
            const value2 = value;
            const result = value1 + value2;
            Accumulator = result;
        }
        else if (operation == "STORE") {
            const address = value;
            RAM[address].opcode = "";
            RAM[address].operand = Accumulator
        }
    }

    //Preparing for next cycle
    else if (step == "Next cycle") {
        const previousPCValue = PC;
        const previousAccumulatorValue = Accumulator;
        ResetComponents();
        PC = previousPCValue;
        Accumulator = previousAccumulatorValue;
        
        STEP_COUNTER = -1; //it will go back to 0 on next iteration
    }

    SyncComponents();
    STEP_COUNTER += 1;
}



const Main = () => {
    ResetRAM(16);
    RAM[4] = Instruction("", 10);
    RAM[5] = Instruction("", 25);
    RAM[0] = Instruction("LOADA", 4);
    RAM[1] = Instruction("ADD", 5);
    RAM[2] = Instruction("STORE", 6);

    ResetComponents();
    SyncComponents();

    STEP_COUNTER = 0;
    document.onkeydown = ($e) => {
        if ($e.key == " ") {
            IncrementStep();
        }
    }
}
Main();