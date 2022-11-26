//https://www.futurelearn.com/info/courses/how-computers-work/0/steps/49284
interface Instruction {
    opcode: string;
    operand?: number;
}
const Instruction = (opcode: string, operand?: number) => {
    return { opcode: opcode, operand: operand };
}



let PC = 0;
let MAR: number | undefined = undefined;
let MDR = Instruction("", undefined);;
let CIR = Instruction("", undefined);;
let Accumulator: number | undefined = undefined;

const RAM: Instruction[] = [];
const RAM_STORAGE = 16; //16 bits

const STEPS = [
    //Fetch
    "Copy PC into MAR",
    "Fetch from RAM into MDR",
    "Copy MDR into CIR",
    "Increment PC",

    //Decode
    "Copy CIR Operand into MAR",
    "Fetch value from RAM into MDR",

    //Execute
    "Execute CIR Opcode",

    //Preparing for next step
    "Next cycle"
];
let STEP_COUNTER = 0;
let CURRENT_CYCLE: string[] = [];
let CYCLE_COUNTER = 0;



//INSTRUCTION SET
//Some operations will take a RAM address as the parameter, e.g. LOADA, others will just take the value, e.g. STORE
//Callback takes in value to use (either from MDR for references or MAR for value operations)
const OPERATIONS: { [operation: string] : { description: string, explanation: string, callback: (value: number) => void; addressOrValue: "A" | "V" } } = {
    "LOADV": {
        description: "LOADV [Value]",
        explanation: "Loads the value into the Accumulator",
        callback: (value: number) => {
            Accumulator = value;
            ProgressUpdate(`Loaded ${value} from MAR into Accumulator`);
        },
        addressOrValue: "V"
    },
    "LOADA": {
        description: "LOADA [Address]",
        explanation: "Loads the value at the address in RAM into the Accumulator",
        callback: (value: number) => {
            Accumulator = value;
            ProgressUpdate(`Loaded ${value} from MDR into Accumulator`);
        },
        addressOrValue: "A"
    },
    "ADD": {
        description: "ADD [Address]",
        explanation: "Adds value from accumulator to value at specified RAM address, and stores result in accumulator",
        callback: (value: number) => {
            const value1 = Accumulator!;
            const value2 = value;
            const result = value1 + value2;
            Accumulator = result;
            ProgressUpdate(`Added together ${value1} and ${value2}, and stored result (${result}) in Accumulator`);
        },
        addressOrValue: "A"
    },
    "STORE": {
        description: "Store [Address]",
        explanation: "Stores value in Accumulator at specified RAM address",
        callback: (value: number) => {
            const address = value;
            RAM[address].opcode = "";
            RAM[address].operand = Accumulator
            ProgressUpdate(`Stored ${Accumulator} at address ${address} in RAM`);
        },
        addressOrValue: "V"
    }
}



const InitialiseInstructionSet = () => {
    const instructionSetTable = document.getElementById("instructionSet")!;
    
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
}



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


    const cycleProgressText = document.getElementById("cycleProgressText")!;
    cycleProgressText.innerText = `Cycle ${CYCLE_COUNTER + 1}`; //CYCLE_COUNTER starts at 0, but 1 is more understandable

    const progressTable = document.getElementById("progress")!;
    progressTable.innerHTML = "";
    for (const update of CURRENT_CYCLE) {
        const row = document.createElement('tr');
        row.innerHTML = `<td> ${update} </td>`;

        if (update == "Prepare for next cycle") {
            row.className = "final";
        }
        progressTable.append(row);
    }

    if (CURRENT_CYCLE.length == 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td><i> No progress yet... </i></td>`;
        progressTable.append(row);
    }
}



const IncrementStep = () => {
    //Just use steps at top as instructions, and follow what they say
    const step = STEPS[STEP_COUNTER];

    //Fetch
    if (step == "Copy PC into MAR") {
        MAR = PC;
        ProgressUpdate(`Copy PC into MAR (${MAR})`);
    }
    else if (step == "Fetch from RAM into MDR") {
        const instruction = RAM[MAR!];
        MDR.opcode = instruction.opcode;
        MDR.operand = instruction.operand;
        ProgressUpdate(`Fetch from RAM into MDR (${MDR.opcode} ${MDR.operand})`);
    }
    else if (step == "Copy MDR into CIR") {
        CIR.opcode = MDR.opcode;
        CIR.operand = MDR.operand;
        ProgressUpdate(`Copy MDR into CIR (${CIR.opcode} ${CIR.operand})`);
    }
    else if (step == "Increment PC") {
        PC += 1;
        ProgressUpdate(`Increment PC (${PC - 1} → ${PC})`);
    }

    //Decode
    else if (step == "Copy CIR Operand into MAR") {
        MAR = CIR.operand;
        ProgressUpdate(`Copy CIR Operand into MAR (${MAR})`);
    }
    else if (step == "Fetch value from RAM into MDR") {
        if (OPERATIONS[CIR.opcode].addressOrValue == "A") {
            const value = RAM[MAR!].operand!; 
            MDR.opcode = "";
            MDR.operand = value;
            ProgressUpdate(`Fetch value from RAM into MDR (${MDR.operand!})`);
        }
        else {
            //MAR address was intended to be a value, so we can directly use value from MAR rather than passing through RAM into MDR
            const value = MAR!;
            MDR.opcode = "";
            MDR.operand = value;
            ProgressUpdate(`Copy value from MAR into MDR (${MDR.operand!})`);
        }
    }

    //Execute
    else if (step == "Execute CIR Opcode") {
        const operation = CIR.opcode;
        const value = MDR.operand!;
        OPERATIONS[operation].callback(value);

        ProgressUpdate("Prepare for next cycle"); //put in penultimate step as the next step the cycle will be reset so the user won't even see this update
    }

    //Preparing for next cycle
    else if (step == "Next cycle") {
        const previousPCValue = PC;
        const previousAccumulatorValue = Accumulator;
        ResetComponents();
        PC = previousPCValue;
        Accumulator = previousAccumulatorValue;
        
        STEP_COUNTER = -1; //it will go back to 0 on next iteration
        CURRENT_CYCLE = [];
        CYCLE_COUNTER += 1;
    }

    SyncComponents();
    STEP_COUNTER += 1;
}
const ProgressUpdate = (update: string) => {
    CURRENT_CYCLE.push(update);
}



const Main = () => {
    InitialiseInstructionSet();

    ResetRAM(RAM_STORAGE);
    RAM[0] = Instruction("LOADV", 10);
    RAM[1] = Instruction("STORE", 0);
    RAM[2] = Instruction("LOADV", 25);
    RAM[3] = Instruction("STORE", 1);
    RAM[4] = Instruction("LOADA", 0);
    RAM[5] = Instruction("ADD", 1);
    RAM[6] = Instruction("STORE", 2);

    ResetComponents();
    SyncComponents();

    STEP_COUNTER = 0;
    document.onkeydown = ($e) => {
        if ($e.key == "a") {
            IncrementStep();
        }
    }
}
Main();