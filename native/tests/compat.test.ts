import { describe, expect, it } from "vitest";

import { cpu } from "../../simulator/src/cpu/cpu.ts";
import { Flags } from "../../simulator/src/cpu/alu.ts";
import { assembleProgram } from "../src/assembler.ts";
import { stepCPU } from "../src/cpu_kernel.ts";

describe("Perry native assembler", () => {
  it("assembles canonical Hack instructions", () => {
    const program = [
      "@2",
      "D=A",
      "@3",
      "D=D+A",
      "@0",
      "M=D",
    ].join("\n");

    expect(assembleProgram(program)).toEqual([
      0x0002,
      0xec10,
      0x0003,
      0xe090,
      0x0000,
      0xe308,
    ]);
  });

  it("resolves labels, predefined symbols, and variables", () => {
    const program = [
      "(LOOP)",
      "@LOOP",
      "0;JMP",
      "@SCREEN",
      "D=A",
      "@value",
      "M=D",
      "@value",
      "D=M",
    ].join("\n");

    const words = assembleProgram(program);
    expect(words[0]).toBe(0);
    expect(words[2]).toBe(0x4000);
    expect(words[4]).toBe(16);
    expect(words[6]).toBe(16);
  });
});

describe("Perry native CPU adapter", () => {
  const instructions = [
    0x0000,
    0x0001,
    0x7fff,
    0xec10,
    0xe090,
    0xe308,
    0xea87,
    0xe301,
    0xe302,
    0xe304,
  ];

  const states = [
    { A: 0, D: 0, PC: 0 },
    { A: 7, D: 3, PC: 11 },
    { A: 0x1234, D: 0xffff, PC: 0x0100 },
  ];

  for (const instruction of instructions) {
    for (const current of states) {
      for (const inM of [0, 1, 0x1234, 0xffff]) {
        it(
          "matches cpu() for instruction=" +
            instruction.toString(16) +
            " A=" +
            current.A +
            " D=" +
            current.D +
            " inM=" +
            inM,
          () => {
            const input = { inM, instruction, reset: false };
            const [referenceOutput, referenceState] = cpu(input, {
              ...current,
              ALU: current.D,
              flag: Flags.Zero,
            });
            const native = stepCPU(input, current);

            expect(native.state).toEqual({
              A: referenceState.A,
              D: referenceState.D,
              PC: referenceState.PC,
            });
            expect(native.outM).toBe(referenceOutput.outM);
            expect(native.writeM).toBe(referenceOutput.writeM);
            expect(native.addressM).toBe(referenceOutput.addressM);
          },
        );
      }
    }
  }
});
