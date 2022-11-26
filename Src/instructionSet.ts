//INSTRUCTION SET
//Some operations will take a RAM address as the parameter, e.g. LOADA, others will just take the value, e.g. STORE
//Callback takes in value to use (either from MDR for references or MAR for value operations)
const OPERATIONS: { [operation: string] : { description: string, explanation: string, callback: (value: number) => void; addressOrValue: "A" | "V" } } = {
    "LOADV": {
        description: "LOADV [Value]",
        explanation: "Loads value into the Accumulator",
        callback: (value: number) => {
            Accumulator = value;
            ProgressUpdate(`Loaded ${value} from MAR into Accumulator`);
        },
        addressOrValue: "V"
    },
    "LOADA": {
        description: "LOADA [Address]",
        explanation: "Loads value at the address in RAM into the Accumulator",
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
            MDR.opcode = "";
            MDR.operand = Accumulator;
            ProgressUpdate(`Passed value from Accumulator to MDR (${MDR.operand!})`);

            RAM[address].opcode = "";
            RAM[address].operand = MDR.operand!;
            ProgressUpdate(`Stored ${Accumulator} from MDR at address ${address} in RAM`);
        },
        addressOrValue: "V"
    },
    "HALT": {
        description: "HALT 0",
        explanation: "Stops the program",
        callback: (value: number) => {
            PROGRAM_HALTED = true;
            //Progress update handled in the IncrementStep() function
        },
        addressOrValue: "V"
    },
    "GOTO": {
        description: "GOTO [Value]",
        explanation: "Changes changes value of PC, which allows you to jump to a specific instruction in RAM",
        callback: (value: number) => {
            PC = value;
            ProgressUpdate(`Set PC to ${value}`);
        },
        addressOrValue: "V"
    }
}