export type RouteId =
  | "chip"
  | "cpu"
  | "asm"
  | "vm"
  | "compiler"
  | "bitmap"
  | "util"
  | "about";

export type ToolId = "chip" | "cpu" | "asm" | "vm" | "compiler" | "bitmap";

export interface RouteSchema {
  id: RouteId;
  href: string;
  tool?: ToolId;
  title: string;
}

export const LAST_ROUTE_KEY = "lastRoute";

export const ROUTES: Readonly<Record<RouteId, RouteSchema>> = {
  chip: {
    id: "chip",
    href: "/chip",
    tool: "chip",
    title: "Hardware Simulator",
  },
  cpu: {
    id: "cpu",
    href: "/cpu",
    tool: "cpu",
    title: "CPU Emulator",
  },
  asm: {
    id: "asm",
    href: "/asm",
    tool: "asm",
    title: "Assembler",
  },
  vm: {
    id: "vm",
    href: "/vm",
    tool: "vm",
    title: "VM Emulator",
  },
  compiler: {
    id: "compiler",
    href: "/compiler",
    tool: "compiler",
    title: "Jack Compiler",
  },
  bitmap: {
    id: "bitmap",
    href: "/bitmap",
    tool: "bitmap",
    title: "Bitmap Editor",
  },
  util: {
    id: "util",
    href: "/util",
    title: "Converter Tool",
  },
  about: {
    id: "about",
    href: "/about",
    title: "About",
  },
};

export const TOOLS: Readonly<Record<ToolId, string>> = {
  chip: ROUTES.chip.title,
  cpu: ROUTES.cpu.title,
  asm: ROUTES.asm.title,
  vm: ROUTES.vm.title,
  compiler: ROUTES.compiler.title,
  bitmap: ROUTES.bitmap.title,
};

export type ShellActionKind = "route" | "external" | "command";

export interface ShellActionSchema {
  id: string;
  kind: ShellActionKind;
  icon: string;
  tooltip: string;
  route?: RouteId;
  href?: string;
  command?: "guide" | "settings";
}

export const HEADER_ACTIONS: readonly ShellActionSchema[] = [
  {
    id: "chip",
    kind: "route",
    route: "chip",
    icon: "memory",
    tooltip: ROUTES.chip.title,
  },
  {
    id: "cpu",
    kind: "route",
    route: "cpu",
    icon: "developer_board",
    tooltip: ROUTES.cpu.title,
  },
  {
    id: "asm",
    kind: "route",
    route: "asm",
    icon: "list_alt",
    tooltip: ROUTES.asm.title,
  },
  {
    id: "vm",
    kind: "route",
    route: "vm",
    icon: "computer",
    tooltip: ROUTES.vm.title,
  },
  {
    id: "compiler",
    kind: "route",
    route: "compiler",
    icon: "code",
    tooltip: ROUTES.compiler.title,
  },
  {
    id: "bitmap",
    kind: "route",
    route: "bitmap",
    icon: "grid_on",
    tooltip: ROUTES.bitmap.title,
  },
  {
    id: "util",
    kind: "route",
    route: "util",
    icon: "function",
    tooltip: ROUTES.util.title,
  },
  {
    id: "guide",
    kind: "command",
    command: "guide",
    icon: "menu_book",
    tooltip: "Guide",
  },
  {
    id: "bug-report",
    kind: "external",
    href: "https://github.com/nand2tetris/web-ide/issues/new/choose",
    icon: "bug_report",
    tooltip: "Bug Report",
  },
  {
    id: "settings",
    kind: "command",
    command: "settings",
    icon: "settings",
    tooltip: "Settings",
  },
  {
    id: "about",
    kind: "route",
    route: "about",
    icon: "info",
    tooltip: ROUTES.about.title,
  },
];

export const GUIDE_LINKS: Readonly<Partial<Record<RouteId, string>>> = {
  chip: "user_guide/chip.pdf",
  cpu: "user_guide/cpu.pdf",
  asm: "user_guide/asm.pdf",
  vm: "user_guide/vm.pdf",
  compiler: "user_guide/compiler.pdf",
  bitmap: "user_guide/bitmap_editor.pdf",
};
