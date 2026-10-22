import {
  Button,
  HStack,
  setText,
  Text,
  TextArea,
  TextField,
  textSetFontSize,
  VStack,
  type Widget,
} from "perry/ui";

import {
  ABOUT_LAYOUT,
  ASM_LAYOUT,
  BITMAP_LAYOUT,
  CHIP_LAYOUT,
  COMPILER_LAYOUT,
  CPU_LAYOUT,
  UTIL_LAYOUT,
  VM_LAYOUT,
} from "../../presentation/build/layouts.js";
import { alu } from "../../simulator/src/cpu/alu.ts";
import { bin, dec, hex, nand16 } from "../../simulator/src/util/twos.ts";
import { assembleProgram, formatHack } from "./assembler.ts";
import { stepCPU } from "./cpu_kernel.ts";
import { renderNativeLayout } from "./renderer.ts";

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

function title(value: string): Widget {
  const widget = Text(value);
  textSetFontSize(widget, 18);
  return widget;
}

let nandA = "0";
let nandB = "0";
let aluOp = "0x02";
let aluX = "0";
let aluY = "0";
let hdlSource = "";

function hardwareEvaluator(): Widget {
  return VStack(8, [
    Text("NAND16"),
    TextField("A (dec / 0xhex / 0bbin)", (value) => {
      nandA = value;
    }),
    TextField("B (dec / 0xhex / 0bbin)", (value) => {
      nandB = value;
    }),
    Button("Evaluate NAND16", () => {
      const out = nand16(parseWord(nandA), parseWord(nandB));
      setText(
        "nativeNandResult",
        "NAND = " + dec(out) + "  " + hex(out) + "  " + bin(out),
      );
    }),
    Text("NAND = 65535  0xFFFF  1111111111111111", "nativeNandResult"),
    Text("Hack ALU"),
    TextField("ALU op (6-bit code)", (value) => {
      aluOp = value;
    }),
    TextField("x", (value) => {
      aluX = value;
    }),
    TextField("y", (value) => {
      aluY = value;
    }),
    Button("Evaluate ALU", () => {
      const result = alu(
        parseWord(aluOp) & 0x3f,
        parseWord(aluX),
        parseWord(aluY),
      );
      setText(
        "nativeAluResult",
        "out=" +
          dec(result[0]) +
          " (" +
          hex(result[0]) +
          ") flags=" +
          result[1],
      );
    }),
    Text("out=0 (0x0000) flags=0", "nativeAluResult"),
  ]);
}

export function chipPage(): Widget {
  return renderNativeLayout(CHIP_LAYOUT, {
    "chip.hdl.header": title("HDL"),
    "chip.hdl.body": VStack(6, [
      TextArea("HDL source", (value) => {
        hdlSource = value;
      }),
      Text(
        "Native HDL editing is active. HDL parsing/execution remains staged until the Ohm parser is replaced by an AOT-safe parser.",
      ),
      Text("Characters entered: 0", "nativeHdlStatus"),
      Button("Inspect source", () => {
        setText("nativeHdlStatus", "Characters entered: " + hdlSource.length);
      }),
    ]),
    "chip.pins.header": title("Native hardware evaluator"),
    "chip.pins.body": hardwareEvaluator(),
    "chip.test": Text(
      "TST execution is intentionally disabled in the native target until the HDL/TST parser path is AOT-safe.",
    ),
  });
}

let cpuA = "0";
let cpuD = "0";
let cpuPC = "0";
let cpuInM = "0";
let cpuInstruction = "0";

function cpuControls(): Widget {
  return VStack(7, [
    TextField("A register", (value) => {
      cpuA = value;
    }),
    TextField("D register", (value) => {
      cpuD = value;
    }),
    TextField("PC", (value) => {
      cpuPC = value;
    }),
    TextField("inM / RAM[A]", (value) => {
      cpuInM = value;
    }),
    TextField("instruction", (value) => {
      cpuInstruction = value;
    }),
    Button("Single CPU step", () => {
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
        "nativeCpuResult",
        "A=" +
          s.A +
          " D=" +
          s.D +
          " PC=" +
          s.PC +
          " outM=" +
          result.outM +
          " addressM=" +
          result.addressM +
          " writeM=" +
          result.writeM,
      );
    }),
    Text("A=0 D=0 PC=0 outM=0 addressM=0 writeM=false", "nativeCpuResult"),
  ]);
}

export function cpuPage(): Widget {
  return renderNativeLayout(CPU_LAYOUT, {
    "cpu.rom": VStack(4, [
      title("ROM / instruction"),
      Text("Enter one Hack instruction below in the CPU controls."),
    ]),
    "cpu.ram": VStack(4, [
      title("RAM"),
      Text("inM represents RAM[A] for the current native single-step."),
    ]),
    "cpu.io.header": title("CPU I/O"),
    "cpu.io.body": cpuControls(),
  });
}

let assemblySource = "";

export function assemblerPage(): Widget {
  const sourceHeader = HStack(8, [
    title("Source"),
    Button("Assemble", () => {
      try {
        const words = assembleProgram(assemblySource);
        setText(
          "nativeAssemblerResult",
          words.length + " words\n" + formatHack(words),
        );
      } catch (error) {
        setText("nativeAssemblerResult", "Error: " + String(error));
      }
    }),
  ]);

  return renderNativeLayout(ASM_LAYOUT, {
    "asm.source.header": sourceHeader,
    "asm.source.editor": TextArea("Hack assembly source", (value) => {
      assemblySource = value;
    }),
    "asm.result.header": title("Binary code"),
    "asm.result.editor": Text(
      "No program assembled yet.",
      "nativeAssemblerResult",
    ),
    "asm.symbols.header": title("Symbol table"),
    "asm.symbols.body": Text(
      "The native assembler resolves predefined symbols, labels, and variables during assembly.",
    ),
    "asm.compare.header": title("Compare"),
    "asm.compare.editor": Text(
      "Native compare-file integration is staged; assembly itself is fully native and AOT compiled.",
    ),
  });
}

let vmSource = "";

export function vmPage(): Widget {
  return renderNativeLayout(VM_LAYOUT, {
    "vm.program.header": title("VM Code"),
    "vm.program.editor": VStack(5, [
      TextArea("VM source", (value) => {
        vmSource = value;
      }),
      Button("Inspect VM source", () => {
        setText("nativeVmStatus", "Characters entered: " + vmSource.length);
      }),
      Text("Characters entered: 0", "nativeVmStatus"),
    ]),
    "vm.structures.header": title("VM Structures"),
    "vm.structures.body": Text(
      "Native VM execution is staged until the browser-oriented Ohm/RxJS path is replaced with AOT-safe equivalents.",
    ),
    "vm.display.body": Text("Screen / keyboard native surface reserved."),
    "vm.ram": Text("RAM native view reserved."),
    "vm.stack": Text("Stack native view reserved."),
  });
}

let jackSource = "";

export function compilerPage(): Widget {
  return renderNativeLayout(COMPILER_LAYOUT, {
    "compiler.code.header": title("Jack Compiler"),
    "compiler.code.body": VStack(6, [
      TextArea("Jack source", (value) => {
        jackSource = value;
      }),
      Button("Inspect source", () => {
        setText("nativeJackStatus", "Characters entered: " + jackSource.length);
      }),
      Text("Characters entered: 0", "nativeJackStatus"),
      Text(
        "Jack compilation remains staged until the parser/compiler dependency path is Perry-AOT compatible.",
      ),
    ]),
  });
}

export function bitmapPage(): Widget {
  return renderNativeLayout(BITMAP_LAYOUT, {
    "bitmap.canvas.header": title("Bitmap Canvas"),
    "bitmap.canvas.body": Text(
      "Native canvas support is available in Perry. Interactive nand2tetris bitmap editing is staged for the next renderer increment.",
    ),
    "bitmap.code.header": title("Generated code"),
    "bitmap.code.body": Text(
      "Code generation will attach here without using a browser or WebView.",
    ),
    "bitmap.controls.body": Text(
      "Native bitmap controls reserved by the shared presentation schema.",
    ),
  });
}

let utilValue = "0";

export function utilPage(): Widget {
  return renderNativeLayout(UTIL_LAYOUT, {
    "util.body": VStack(8, [
      title("Converter Tool"),
      TextField("16-bit value", (value) => {
        utilValue = value;
      }),
      Button("Convert", () => {
        const value = parseWord(utilValue);
        setText(
          "nativeUtilResult",
          "dec=" + dec(value) + "  hex=" + hex(value) + "  bin=" + bin(value),
        );
      }),
      Text("dec=0  hex=0x0000  bin=0000000000000000", "nativeUtilResult"),
    ]),
  });
}

export function aboutPage(): Widget {
  return renderNativeLayout(ABOUT_LAYOUT, {
    "about.body": VStack(6, [
      title("nand2tetris Native"),
      Text("Perry AOT renderer"),
      Text(
        "TypeScript is compiled ahead of time to native Android machine code. No WebView, Chromium, Node.js, V8, or JavaScript JIT is used by this target.",
      ),
      Text(
        "The browser and native applications consume the same renderer-agnostic presentation schema.",
      ),
    ]),
  });
}
