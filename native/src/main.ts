import {
  App,
  Button,
  HStack,
  NavStack,
  setText,
  state,
  Text,
  TextArea,
  TextField,
  VStack,
} from "perry/ui";

import { alu } from "../../simulator/src/cpu/alu.ts";
import { bin, dec, hex, nand16 } from "../../simulator/src/util/twos.ts";
import { assembleProgram, formatHack } from "./assembler.ts";
import { stepCPU } from "./cpu_kernel.ts";

const route = state("home");

function parseWord(source: string): number {
  const value = source.trim();
  if (value.length === 0) return 0;

  let parsed = 0;
  if (value.startsWith("0x") || value.startsWith("0X")) {
    parsed = parseInt(value.slice(2), 16);
  } else if (value.startsWith("0b") || value.startsWith("0B")) {
    parsed = parseInt(value.slice(2), 2);
  } else {
    parsed = parseInt(value, 10);
  }

  if (!Number.isFinite(parsed)) return 0;
  return parsed & 0xffff;
}

function homePage() {
  return VStack(12, [
    Text("nand2tetris — Perry Native"),
    Text("Strict AOT Android build: no WebView, Node.js, V8, or JIT."),
    Button("Hardware / ALU", () => route.set("hardware")),
    Button("CPU single-step", () => route.set("cpu")),
    Button("Assembler", () => route.set("assembler")),
    Button("Native benchmark", () => route.set("benchmark")),
    Text(
      "This native branch intentionally excludes browser-only React/Monaco/RxJS/Ohm paths until each dependency is replaced with an AOT-safe native equivalent.",
    ),
  ]);
}

let nandA = "0";
let nandB = "0";
let aluOp = "0x02";
let aluX = "0";
let aluY = "0";

function hardwarePage() {
  return VStack(10, [
    HStack([Button("‹ Back", () => route.set("home")), Text("Hardware / ALU")]),
    Text("NAND16"),
    TextField("A (dec / 0xhex / 0bbin)", (value) => {
      nandA = value;
    }),
    TextField("B (dec / 0xhex / 0bbin)", (value) => {
      nandB = value;
    }),
    Button("Evaluate NAND16", () => {
      const out = nand16(parseWord(nandA), parseWord(nandB));
      setText("nandResult", `NAND = ${dec(out)}  ${hex(out)}  ${bin(out)}`);
    }),
    Text("NAND = 65535  0xFFFF  1111111111111111", "nandResult"),
    Text("Hack ALU"),
    TextField("ALU op (6-bit code, e.g. 0x02 = x+y)", (value) => {
      aluOp = value;
    }),
    TextField("x", (value) => {
      aluX = value;
    }),
    TextField("y", (value) => {
      aluY = value;
    }),
    Button("Evaluate ALU", () => {
      const [out, flags] = alu(
        parseWord(aluOp) & 0x3f,
        parseWord(aluX),
        parseWord(aluY),
      );
      setText("aluResult", `out=${dec(out)} (${hex(out)}) flags=${flags}`);
    }),
    Text("out=0 (0x0000) flags=0", "aluResult"),
  ]);
}

let cpuA = "0";
let cpuD = "0";
let cpuPC = "0";
let cpuInM = "0";
let cpuInstruction = "0";

function cpuPage() {
  return VStack(9, [
    HStack([Button("‹ Back", () => route.set("home")), Text("CPU step")]),
    Text("Enter the current registers and one 16-bit instruction."),
    TextField("A", (value) => {
      cpuA = value;
    }),
    TextField("D", (value) => {
      cpuD = value;
    }),
    TextField("PC", (value) => {
      cpuPC = value;
    }),
    TextField("inM", (value) => {
      cpuInM = value;
    }),
    TextField("instruction", (value) => {
      cpuInstruction = value;
    }),
    Button("Step", () => {
      const result = stepCPU(
        {
          inM: parseWord(cpuInM),
          instruction: parseWord(cpuInstruction),
          reset: false,
        },
        {
          A: parseWord(cpuA),
          D: parseWord(cpuD),
          PC: parseWord(cpuPC),
        },
      );
      const s = result.state;
      setText(
        "cpuResult",
        `A=${s.A} D=${s.D} PC=${s.PC} outM=${result.outM} addressM=${result.addressM} writeM=${result.writeM}`,
      );
    }),
    Text("A=0 D=0 PC=0 outM=0 addressM=0 writeM=false", "cpuResult"),
  ]);
}

let assemblySource = "";

function assemblerPage() {
  return VStack(10, [
    HStack([Button("‹ Back", () => route.set("home")), Text("Assembler")]),
    Text("Paste Hack assembly. Labels and variables are supported."),
    TextArea("Hack assembly source", (value) => {
      assemblySource = value;
    }),
    Button("Assemble", () => {
      try {
        const words = assembleProgram(assemblySource);
        setText(
          "assemblerResult",
          `${words.length} words\n${formatHack(words)}`,
        );
      } catch (error) {
        setText("assemblerResult", `Error: ${String(error)}`);
      }
    }),
    Text("No program assembled yet.", "assemblerResult"),
  ]);
}

function runKernelBenchmark(): string {
  let checksum = 0;
  const start = Date.now();

  // Integer-heavy representative Hack workload. Perry lowers the imported
  // nand2tetris kernels through LLVM; --fast-math is enabled globally for
  // the build but does not change these integer/bitwise semantics.
  for (let i = 0; i < 5_000_000; i++) {
    const a = i & 0xffff;
    const b = (i * 31) & 0xffff;
    checksum ^= nand16(a, b);
    checksum ^= alu(0x02, a, b)[0];
    checksum &= 0xffff;
  }

  const elapsed = Date.now() - start;
  return `5,000,000 NAND+ALU iterations: ${elapsed} ms; checksum=${checksum}`;
}

function benchmarkPage() {
  return VStack(10, [
    HStack([Button("‹ Back", () => route.set("home")), Text("Benchmark")]),
    Text(
      "Runs the actual simulator nand16() and alu() implementations compiled ahead-of-time by Perry.",
    ),
    Button("Run benchmark", () => {
      setText("benchResult", runKernelBenchmark());
    }),
    Text("Not run yet.", "benchResult"),
  ]);
}

App({
  title: "nand2tetris Native",
  width: 420,
  height: 840,
  body: NavStack(route, [
    { name: "home", body: homePage() },
    { name: "hardware", body: hardwarePage() },
    { name: "cpu", body: cpuPage() },
    { name: "assembler", body: assemblerPage() },
    { name: "benchmark", body: benchmarkPage() },
  ]),
});
