# FDE Visualisation
### An interactive assembly code editor, which shows how the individual operations are run on a CPU using Von Neumann Architecture and the Fetch-Decode-Execute cycle

## URL: https://aryaask.github.io/FDE_Visualisation/dist

This allows you write some assembly code in a sandbox assembly set, and see how the code is ran step by step at the CPU level

## Previews
![Preview 1](/Previews/1.png?raw=true)
<p float="center">
  <img src="/Previews/2.png?raw=true" width="50%" />
  <img src="/Previews/3.png?raw=true" width="50%" />
</p>

## <u>How it works</u>

### Initialisation
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

When the assembly code is written and you 'compile', it is parsed into an array of instruction objects, each of which has an **opcode** and an **operand** These instructions are then loaded into RAM, and the process begins.

For each instruction program will carry out these steps:
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
Will load the value found at address 15 in RAM into the Accumulator.

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

The program counter can also be used to manipulate the current instruction. Usually it is increment by 1 to run in sequence, however in a COMPARE instruction the PC will be incremented by 2 if the **value supplied > Accumulator value**, to skip the immeadiate instruction below, similar to how an if else statement will only execute either the 'if' code or the 'else' code.

## Inaccuracies
I purposefully ignored key components such as the ALU and CU, as well as the Clock, since I wanted to keep it simple and able to be understood by a lot of people.

The ALU is used for logic and arithmatic operations, however I just carried those out in the background and returned the result to the accumulator; the lack of an ALU doesn't disrupte the flow too much.

Similarly, the CU is generally seen to control the flow, one situation where this can be confusing is Value vs Address based instructions, as the flow is different.\
Usually a CU would coordinate this, however since there isn't one in this visualisation the user may get confused as to why the value of the MAR is copied directly to the MDR sometimes, and other times the value of the MAR is used as a RAM address, the value at which is then copied into the MAR. I tried to make this clear through the explanation after each step.

## Design
Another area I struggled with was design, since even at the current moment the visualisation's design is not very interesting. I took inspiration from other images and diagrams of the CPU, however I will continue to try and improve the design into the future.

## Assembly Code
The assembly editor uses a custom instruction set, which you can see from the table next to the editor. Below are some sample programs to understand:

### Program to add 2 numbers and output result
```
LOADV 10
STORE 0
LOADV 25
STORE 1

LOADA 0
ADD 1
STORE 2
OUTPUT 2

HALT 0
```

### Program to check larger of 2 numbers
```
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
```