import {
  container,
  type PageLayout,
  panel,
  slot,
  validateLayout,
} from "./schema.js";

export const CHIP_LAYOUT: PageLayout = {
  id: "chip",
  root: container(
    "chip.root",
    [
      panel("chip.hdl", [slot("chip.hdl.body")], {
        tokens: ["chip-hdl"],
        editor: true,
        header: "chip.hdl.header",
      }),
      panel("chip.pins", [slot("chip.pins.body")], {
        tokens: ["chip-parts"],
        header: "chip.pins.header",
      }),
      slot("chip.test"),
    ],
    ["page", "chip-page", "grid"],
  ),
};

export const CPU_LAYOUT: PageLayout = {
  id: "cpu",
  root: container(
    "cpu.root",
    [
      slot("cpu.rom"),
      slot("cpu.ram"),
      panel("cpu.io", [slot("cpu.io.body")], {
        tokens: ["io"],
        header: "cpu.io.header",
      }),
      slot("cpu.test", { optional: true }),
    ],
    ["page", "cpu-page", "grid"],
  ),
};

export const ASM_LAYOUT: PageLayout = {
  id: "asm",
  root: container(
    "asm.root",
    [
      panel("asm.source", [slot("asm.source.editor")], {
        tokens: ["source"],
        editor: true,
        header: "asm.source.header",
      }),
      panel("asm.result", [slot("asm.result.editor")], {
        tokens: ["result"],
        editor: true,
        header: "asm.result.header",
      }),
      panel("asm.symbols", [slot("asm.symbols.body", { optional: true })], {
        tokens: ["symbols"],
        editor: true,
        header: "asm.symbols.header",
      }),
      panel("asm.compare", [slot("asm.compare.editor")], {
        tokens: ["compare"],
        header: "asm.compare.header",
      }),
    ],
    ["asm-page", "grid"],
  ),
};

export const VM_LAYOUT: PageLayout = {
  id: "vm",
  root: container(
    "vm.root",
    [
      panel("vm.program", [slot("vm.program.editor")], {
        tokens: ["program"],
        editor: true,
        header: "vm.program.header",
      }),
      panel("vm.structures", [slot("vm.structures.body")], {
        tokens: ["vm-structures"],
        header: "vm.structures.header",
      }),
      panel("vm.display", [slot("vm.display.body")], {
        tokens: ["display"],
        area: "display",
      }),
      slot("vm.ram"),
      slot("vm.stack"),
      slot("vm.test", { optional: true }),
    ],
    ["page", "vm-page", "grid"],
  ),
};

export const COMPILER_LAYOUT: PageLayout = {
  id: "compiler",
  root: container(
    "compiler.root",
    [
      slot("compiler.dialog", { optional: true }),
      panel("compiler.code", [slot("compiler.code.body")], {
        tokens: ["code"],
        header: "compiler.code.header",
      }),
    ],
    ["page", "compiler-page", "grid"],
  ),
};

export const BITMAP_LAYOUT: PageLayout = {
  id: "bitmap",
  root: container(
    "bitmap.root",
    [
      panel("bitmap.canvas", [slot("bitmap.canvas.body")], {
        tokens: ["bitmap-canvas"],
        header: "bitmap.canvas.header",
      }),
      panel("bitmap.code", [slot("bitmap.code.body")], {
        tokens: ["bitmap-code"],
        header: "bitmap.code.header",
      }),
      panel("bitmap.controls", [slot("bitmap.controls.body")], {
        tokens: ["bitmap-controls"],
      }),
    ],
    ["page", "bitmap-page", "grid"],
  ),
};

export const UTIL_LAYOUT: PageLayout = {
  id: "util",
  root: slot("util.body"),
};

export const ABOUT_LAYOUT: PageLayout = {
  id: "about",
  root: container("about.root", [
    container("about.content", [slot("about.body")], ["content-container"]),
  ]),
};

export const TOOL_LAYOUTS = {
  chip: CHIP_LAYOUT,
  cpu: CPU_LAYOUT,
  asm: ASM_LAYOUT,
  vm: VM_LAYOUT,
  compiler: COMPILER_LAYOUT,
  bitmap: BITMAP_LAYOUT,
  util: UTIL_LAYOUT,
  about: ABOUT_LAYOUT,
} as const;

for (const layout of Object.values(TOOL_LAYOUTS)) {
  validateLayout(layout);
}
