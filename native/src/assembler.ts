import {
  ASSIGN,
  type ASSIGN_ASM,
  COMMANDS,
  type COMMANDS_ASM,
  JUMP,
  type JUMP_ASM,
} from "../../simulator/src/cpu/alu.ts";

const PREDEFINED: Record<string, number> = {
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  SCREEN: 0x4000,
  KBD: 0x6000,
};

for (let i = 0; i < 16; i++) {
  PREDEFINED[`R${i}`] = i;
}

function clean(source: string): string[] {
  return source
    .split("\n")
    .map((line) => {
      const comment = line.indexOf("//");
      return (comment >= 0 ? line.slice(0, comment) : line).trim();
    })
    .filter((line) => line.length > 0);
}

function isDecimal(value: string): boolean {
  if (value.length === 0) return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 48 || code > 57) return false;
  }
  return true;
}

function parseC(line: string): number {
  let destination = "";
  let rest = line;

  const equals = rest.indexOf("=");
  if (equals >= 0) {
    destination = rest.slice(0, equals);
    rest = rest.slice(equals + 1);
  }

  let jump = "";
  const semicolon = rest.indexOf(";");
  if (semicolon >= 0) {
    jump = rest.slice(semicolon + 1);
    rest = rest.slice(0, semicolon);
  }

  // Match the desktop simulator's accepted aliases.
  if (destination === "DM") destination = "MD";
  if (destination === "ADM") destination = "AMD";

  const operation = rest;
  const assignCode = ASSIGN.asm[destination as ASSIGN_ASM];
  const jumpCode = JUMP.asm[jump as JUMP_ASM];
  const normalizedOperation = operation.replace("M", "A") as COMMANDS_ASM;
  const commandCode = COMMANDS.asm[normalizedOperation];

  if (
    assignCode === undefined ||
    jumpCode === undefined ||
    commandCode === undefined
  ) {
    throw new Error(`Invalid Hack C-instruction: ${line}`);
  }

  const C = 0xe000;
  const A = operation.includes("M") ? 0x1000 : 0;
  return (C | A | (commandCode << 6) | (assignCode << 3) | jumpCode) & 0xffff;
}

export function assembleProgram(source: string): number[] {
  const lines = clean(source);
  const symbols: Record<string, number> = { ...PREDEFINED };

  let romAddress = 0;
  for (const line of lines) {
    if (line.startsWith("(") && line.endsWith(")")) {
      const label = line.slice(1, -1).trim();
      if (label.length === 0) throw new Error("Empty label");
      if (symbols[label] !== undefined) {
        throw new Error(`Duplicate symbol: ${label}`);
      }
      symbols[label] = romAddress;
    } else {
      romAddress++;
    }
  }

  const result: number[] = [];
  let nextVariable = 16;

  for (const line of lines) {
    if (line.startsWith("(") && line.endsWith(")")) continue;

    if (line.startsWith("@")) {
      const value = line.slice(1);
      let address: number;
      if (isDecimal(value)) {
        address = Number(value);
      } else {
        if (symbols[value] === undefined) {
          symbols[value] = nextVariable++;
        }
        address = symbols[value];
      }
      if (address < 0 || address > 0x7fff) {
        throw new Error(`A-instruction out of range: ${line}`);
      }
      result.push(address & 0x7fff);
      continue;
    }

    result.push(parseC(line));
  }

  return result;
}

export function formatHack(words: number[]): string {
  return words
    .map((word) => {
      let line = "";
      for (let bit = 15; bit >= 0; bit--) {
        line += ((word >> bit) & 1) === 1 ? "1" : "0";
      }
      return line;
    })
    .join("\n");
}
