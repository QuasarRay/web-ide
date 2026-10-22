import {
  type ContainerNode,
  type LayoutRenderer,
  type PageLayout,
  type PanelNode,
  renderLayout,
  type SlotNode,
  type StyleToken,
} from "../../../presentation/build/schema.js";
import { Fragment, type ReactNode } from "react";
import { Panel } from "../shell/panel";

const WEB_CLASSES: Readonly<Record<string, string>> = {
  page: "Page",
  "chip-page": "ChipPage",
  "chip-hdl": "_hdl_panel",
  "chip-parts": "_parts_panel",
  "cpu-page": "CpuPage",
  "asm-page": "AsmPage",
  "vm-page": "VmPage",
  "compiler-page": "CompilerPage",
  "bitmap-page": "BitmapPage",
  "bitmap-canvas": "canvas-panel",
  "bitmap-code": "code-panel",
  "bitmap-controls": "controls-panel",
  grid: "grid",
  io: "IO",
  source: "source",
  result: "result",
  symbols: "sym",
  compare: "compare",
  program: "program",
  "vm-structures": "vm",
  display: "display",
  code: "code",
  "screen-large": "large-screen",
  "screen-normal": "normal",
  "screen-hidden": "no-screen",
  "hide-symbols": "hide-sym",
  "stack-memory": "Stack",
};

function className(tokens: readonly StyleToken[]): string {
  return tokens
    .map((token) => WEB_CLASSES[token] ?? token)
    .filter((token) => token.length > 0)
    .join(" ");
}

const renderer: LayoutRenderer<ReactNode, ReactNode> = {
  container(
    node: ContainerNode,
    children: readonly ReactNode[],
    tokens: readonly StyleToken[],
  ) {
    return (
      <div className={className(tokens)}>
        {children.map((child, index) => (
          <Fragment key={node.children[index]?.id ?? index}>{child}</Fragment>
        ))}
      </div>
    );
  },

  panel(
    node: PanelNode,
    header: ReactNode | undefined,
    body: readonly ReactNode[],
    footer: ReactNode | undefined,
    tokens: readonly StyleToken[],
  ) {
    return (
      <Panel
        className={className(tokens)}
        isEditorPanel={node.editor}
        style={node.area ? { gridArea: node.area } : undefined}
        header={header}
        footer={footer}
      >
        {body.map((child, index) => (
          <Fragment key={node.body[index]?.id ?? index}>{child}</Fragment>
        ))}
      </Panel>
    );
  },

  slot(node: SlotNode, value: ReactNode | undefined) {
    if (value === undefined && !node.optional) {
      throw new Error(`Missing required presentation slot: ${node.slot}`);
    }
    return value ?? null;
  },
};

export function SchemaLayout({
  schema,
  slots,
  dynamicTokens,
}: {
  schema: PageLayout;
  slots: Readonly<Record<string, ReactNode | undefined>>;
  dynamicTokens?: Readonly<Record<string, readonly StyleToken[] | undefined>>;
}) {
  return renderLayout(schema.root, renderer, { slots, dynamicTokens });
}
