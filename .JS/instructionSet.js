"use strict";
//INSTRUCTION SET
//Some operations will take a RAM address as the parameter, e.g. LOADA, others will just take the value, e.g. STORE
//Callback takes in value to use (either from MDR for references or MAR for value operations)
const OPERATIONS = {
    "LOADV": {
        description: "LOADV [Value]",
        explanation: "Loads the value into the Accumulator",
        callback: (value) => {
            Accumulator = value;
            ProgressUpdate(`Loaded ${value} from MAR into Accumulator`);
        },
        addressOrValue: "V"
    },
    "LOADA": {
        description: "LOADA [Address]",
        explanation: "Loads the value at the address in RAM into the Accumulator",
        callback: (value) => {
            Accumulator = value;
            ProgressUpdate(`Loaded ${value} from MDR into Accumulator`);
        },
        addressOrValue: "A"
    },
    "ADD": {
        description: "ADD [Address]",
        explanation: "Adds value from accumulator to value at specified RAM address, and stores result in accumulator",
        callback: (value) => {
            const value1 = Accumulator;
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
        callback: (value) => {
            const address = value;
            RAM[address].opcode = "";
            RAM[address].operand = Accumulator;
            ProgressUpdate(`Stored ${Accumulator} at address ${address} in RAM`);
        },
        addressOrValue: "V"
    },
    "HALT": {
        description: "HALT 0",
        explanation: "Stops the program",
        callback: (value) => {
            PROGRAM_HALTED = true;
            //Progress update handled in the IncrementStep() function
        },
        addressOrValue: "V"
    }
};
