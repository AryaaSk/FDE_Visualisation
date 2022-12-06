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
let MDR = Instruction("", undefined);
let CIR = Instruction("", undefined);
let Accumulator: number | undefined = undefined;

let RAM: Instruction[] = [];
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
let PROGRAM_HALTED = false;



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

const CompileAssemblyCode = () => {
    const editor = <HTMLTextAreaElement>document.getElementById("editor")!;
    const text = editor.value;
    const lines = text.split("\n");

    const instructions: Instruction[] = [];
    for (const line of lines) {
        if (line.trim() == "" || line.startsWith("//")) {
            continue; //just a break line or comment
        }

        const split = line.split(" ");
        const opcode = split[0];
        const operand = Number(split[1]);

        if (OPERATIONS[opcode] == undefined) {
            alert(`Invalid operation "${opcode}"`);
            return;
        }

        instructions.push(Instruction(opcode, operand));
    }
    
    if (instructions.length > RAM_STORAGE) {
        alert(`Not enough memory, RAM only has ${RAM_STORAGE} bits`);
        return;
    }
    else if (instructions.length < RAM_STORAGE) {
        //need to fill up remaining RAM slots with 0s
        const remainingSlots = RAM_STORAGE - instructions.length;
        for (let _ = 0; _ != remainingSlots; _ += 1) {
            instructions.push(Instruction("", 0));
        }
    }

    RAM = JSON.parse(JSON.stringify(instructions));

    STEP_COUNTER = 0; //reset all components since the program is effectively being reset
    CURRENT_CYCLE = [];
    CYCLE_COUNTER = 0;
    PROGRAM_HALTED = false;
    ResetComponents();
    SyncComponents();
}



const IncrementStep = () => {
    if (PROGRAM_HALTED == true) {
        return;
    }

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
        ProgressUpdate(`Fetch from RAM address ${MAR!} into MDR (${MDR.opcode} ${MDR.operand})`);
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
            ProgressUpdate(`Fetch value from RAM address ${MAR!} into MDR (${MDR.operand!})`);
        }
        else {
            //MAR address was intended to be a value, so we can directly use value from MAR rather than passing through RAM into MDR
            const value = MAR!;
            MDR.opcode = "";
            MDR.operand = value;
            ProgressUpdate(`Copy value directly from MAR into MDR (${MDR.operand!})`);
        }
    }

    //Execute
    else if (step == "Execute CIR Opcode") {
        const operation = CIR.opcode;
        const value = MDR.operand!;
        OPERATIONS[operation].callback(value);

        if (operation != "HALT") {
            ProgressUpdate("Prepare for next cycle"); //put in penultimate step as the next step the cycle will be reset so the user won't even see this update
        }
        else {
            ProgressUpdate("Stopped program");
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
        CURRENT_CYCLE = [];
        CYCLE_COUNTER += 1;
    }

    SyncComponents();
    STEP_COUNTER += 1;
}
const ProgressUpdate = (update: string) => {
    //Could have an animation later on
    CURRENT_CYCLE.push(update);
}



const Main = () => {
    InitialiseInstructionSet();
    PositionArrows();
    InitListeners();

    ResetRAM(RAM_STORAGE);
    STEP_COUNTER = 0;
    CURRENT_CYCLE = [];
    CYCLE_COUNTER = 0;
    PROGRAM_HALTED = false;
    ResetComponents();
    SyncComponents();

    //Sample assembly code to load 10 and 25, then add them together and store result at address 2
    const editor = <HTMLTextAreaElement>document.getElementById("editor")!;
    /*
    editor.value = 
`LOADV 10
STORE 0
LOADV 25
STORE 1

LOADA 0
ADD 1
STORE 2
HALT 0
`;
    */

    //Sample boolean logic in assembly
    editor.value = 
`//Sample program to check larger number

LOADV 10
STORE 0
LOADV 20
STORE 1

//CURRENTLY ADDRESS 3
//10 STORED AT RAM_0
//20 STORED IN ACCUMULATOR AND RAM_1

COMPARE 0
GOTO 7
GOTO 9

OUTPUT 1 //IF 0 IS SMALLER
GOTO 10

OUTPUT 0 //IF 1 IS SMALLER

HALT 0
`;

}
Main();