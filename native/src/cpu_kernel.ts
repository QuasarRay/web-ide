import { alu, Flags } from "../../simulator/src/cpu/alu.ts";

export interface NativeCPUState {
  A: number;
  D: number;
  PC: number;
}

export interface NativeCPUInput {
  inM: number;
  instruction: number;
  reset: boolean;
}

export interface NativeCPUOutput {
  state: NativeCPUState;
  outM: number;
  writeM: boolean;
  addressM: number;
}

function bit(instruction: number, mask: number): boolean {
  return (instruction & mask) === mask;
}

export function stepCPU(
  input: NativeCPUInput,
  current: NativeCPUState,
): NativeCPUOutput {
  let A = current.A & 0xffff;
  let D = current.D & 0xffff;
  let PC = current.PC & 0x7fff;
  const instruction = input.instruction & 0xffff;

  if ((instruction & 0x8000) === 0) {
    A = instruction & 0x7fff;
    PC = input.reset ? 0 : (PC + 1) & 0x7fff;
    return { state: { A, D, PC }, outM: 0, writeM: false, addressM: A };
  }

  const useM = bit(instruction, 0x1000);
  const op = (instruction & 0x0fc0) >> 6;
  const oldA = A;
  const y = useM ? input.inM : oldA;
  const [outM, flags] = alu(op, D, y);

  const writeA = bit(instruction, 0x20);
  const writeD = bit(instruction, 0x10);
  const writeM = bit(instruction, 0x08);

  const jumpPositive = bit(instruction, 0x01) && flags === Flags.Positive;
  const jumpZero = bit(instruction, 0x02) && flags === Flags.Zero;
  const jumpNegative = bit(instruction, 0x04) && flags === Flags.Negative;
  const jump = jumpPositive || jumpZero || jumpNegative;

  if (writeD) D = outM;
  if (writeA) A = outM;

  PC = input.reset ? 0 : jump ? oldA & 0x7fff : (PC + 1) & 0x7fff;

  return {
    state: { A, D, PC },
    outM,
    writeM,
    addressM: oldA & 0x7fff,
  };
}
