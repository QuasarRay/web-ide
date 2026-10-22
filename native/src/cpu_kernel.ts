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

interface TickState extends NativeCPUState {
  ALU: number;
  flag: number;
}

const BITS = {
  c: 0x8000,
  am: 0x9000,
  op: 0x0fc0,
  d1: 0x8020,
  d2: 0x8010,
  d3: 0x8008,
  j1: 0x8001,
  j2: 0x8002,
  j3: 0x8004,
};

function bit(instruction: number, mask: number): boolean {
  return (instruction & mask) === mask;
}

function tick(
  input: NativeCPUInput,
  initial: TickState,
): [TickState, boolean, number] {
  let { A, D, PC } = initial;
  const instruction = input.instruction & 0xffff;
  const useM = bit(instruction, BITS.am);
  const op = (instruction & BITS.op) >> 6;
  const a = useM ? input.inM : A;
  const [ALU, flag] = alu(op, D, a);

  if (bit(instruction, BITS.d2)) {
    D = ALU;
  }

  return [{ A, D, PC: PC + 1, ALU, flag }, bit(instruction, BITS.d3), ALU];
}

function tock(input: NativeCPUInput, tickState: TickState): NativeCPUOutput {
  let { A, D, PC, ALU, flag } = tickState;
  const instruction = input.instruction & 0xffff;

  const j1 = bit(instruction, BITS.j1) && flag === Flags.Positive;
  const j2 = bit(instruction, BITS.j2) && flag === Flags.Zero;
  const j3 = bit(instruction, BITS.j3) && flag === Flags.Negative;
  const jump = j1 || j2 || j3;

  PC = input.reset ? 0 : jump ? A : PC;

  if (!bit(instruction, BITS.c)) {
    A = instruction & 0x7fff;
  } else if (bit(instruction, BITS.d1)) {
    A = ALU;
  }

  const useM = bit(instruction, BITS.am);
  const a = useM ? input.inM : A;
  const second = alu((instruction & BITS.op) >> 6, D, a);
  ALU = second[0];
  flag = second[1];

  return {
    state: { A, D, PC },
    outM: ALU,
    writeM: bit(instruction, BITS.d3),
    addressM: A,
  };
}

/**
 * Perry-friendly copy of the repository's pure CPU tick/tock semantics.
 * The hot arithmetic path still calls the existing simulator ALU directly.
 */
export function stepCPU(
  input: NativeCPUInput,
  current: NativeCPUState,
): NativeCPUOutput {
  const initial: TickState = {
    A: current.A,
    D: current.D,
    PC: current.PC,
    ALU: current.D,
    flag: Flags.Zero,
  };
  const [tickState] = tick(input, initial);
  return tock(input, tickState);
}
