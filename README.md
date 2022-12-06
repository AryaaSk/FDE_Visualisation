# FDE Visualisation
### An interactive assembly code editor, which shows how the individual operations are run on a CPU using Von Neumann Architecture and the Fetch-Decode-Execute cycle

## URL: https://aryaask.github.io/FDE_Visualisation/dist/

This allows you write some assembly code in a sandbox assembly set, and see how the code is ran step by step at the CPU level

## Previews
<p float="left">
  <img src="/Previews/1.png?raw=true" width="200" />
  <img src="/Previews/2.png?raw=true" width="200" />
  <img src="/Previews/3.png?raw=true" width="200" />
</p>

## <u>How it works</u>
Once you have written the assembly code, it is parsed into an array of instruction objects, each of which has an **opcode** and an **operand**

Then for each instruction program will carry out these steps:
```javascript
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
```
*These are the steps which occur when clicking the 'Next step button', the only exception, a variable called 'STEP_COUNTER' keeps track of which step is currently being executed*

The individual registers are simply stored as variables, as well as the RAM which is stored as an array of instructions, which get synced to the HTML elements after each step:
```typescript
let PC = 0;
let MAR: number | undefined = undefined;
let MDR = Instruction("", undefined);
let CIR = Instruction("", undefined);
let Accumulator: number | undefined = undefined;

let RAM: Instruction[] = [];
const RAM_STORAGE = 16; //16 bits
```

### Fetch
The fetch section is always the same for any instruction.\
For example this is the first step "Copy PC into MAR":
```typescript
if (step == "Copy PC into MAR") {
    MAR = PC; //transfer data from PC into MAR
    ProgressUpdate(`Copy PC into MAR (${MAR})`);
}
```

### Decode
The decode section is generally constant between instructions, except from the distinction between value based instructions and address based instructions.

Address based instructions supply the **address in RAM** of the value to be used, for example:
```
LOADA 15
```
Will load the value found at address 15 in RAM into the Accumulator.\


However, value based instructions supply the **absolute value** in the instruction itself, for example:
```
LOADV 15
```
Will load the value 15 straight into the Accumulator.
*You can see if each instruction is value or address based through its description in the instruction set table*

In the decode section the actual value to use for the instruction is either fetched from the MDR address in RAM if the instruction is address based, or passed straight from the MAR -> MDR if the instruction is value based.


### Execute
Once the CPU get to the execute commands (last part of Fetch-Decode-Execute), a callback function is called from the corresponding instruction which was being called, rather than from the main 'IncrementStep()' function.

At this point, the value to use for the instruction will be in the MDR, so that is passed as an argument to the callback function. Here is the callback function for the LOADV instruction (LOADA is same since value is already in MDR):
```typescript
callback = (value: number) => {
    Accumulator = value; //loads value into accumulator
    ProgressUpdate(`Loaded ${value} from MAR into Accumulator`); //explains what happened to user
};
```

*You can see all the steps in the 'IncrementStep()' function in [main.ts](/Src/main.ts)*

