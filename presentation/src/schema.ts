export type StyleToken = string;
export type SlotId = string;
export type NodeId = string;

export interface LayoutBase {
  id: NodeId;
  tokens?: readonly StyleToken[];
}

export interface ContainerNode extends LayoutBase {
  kind: "container";
  children: readonly LayoutNode[];
}

export interface PanelNode extends LayoutBase {
  kind: "panel";
  editor?: boolean;
  area?: string;
  header?: SlotNode;
  body: readonly LayoutNode[];
  footer?: SlotNode;
}

export interface SlotNode extends LayoutBase {
  kind: "slot";
  slot: SlotId;
  optional?: boolean;
}

export type LayoutNode = ContainerNode | PanelNode | SlotNode;

export interface PageLayout {
  id: string;
  root: ContainerNode;
}

export interface RenderContext<Slot> {
  slots: Readonly<Record<SlotId, Slot | undefined>>;
  dynamicTokens?: Readonly<Record<NodeId, readonly StyleToken[] | undefined>>;
}

export interface LayoutRenderer<Output, Slot> {
  container(
    node: ContainerNode,
    children: readonly Output[],
    tokens: readonly StyleToken[],
  ): Output;
  panel(
    node: PanelNode,
    header: Output | undefined,
    body: readonly Output[],
    footer: Output | undefined,
    tokens: readonly StyleToken[],
  ): Output;
  slot(node: SlotNode, value: Slot | undefined): Output;
}

export const slot = (
  id: SlotId,
  options: Omit<SlotNode, "kind" | "id" | "slot"> & { nodeId?: NodeId } = {},
): SlotNode => ({
  kind: "slot",
  id: options.nodeId ?? id,
  slot: id,
  optional: options.optional,
  tokens: options.tokens,
});

export const container = (
  id: NodeId,
  children: readonly LayoutNode[],
  tokens: readonly StyleToken[] = [],
): ContainerNode => ({
  kind: "container",
  id,
  children,
  tokens,
});

export const panel = (
  id: NodeId,
  body: readonly LayoutNode[],
  options: {
    tokens?: readonly StyleToken[];
    editor?: boolean;
    area?: string;
    header?: SlotId;
    footer?: SlotId;
  } = {},
): PanelNode => ({
  kind: "panel",
  id,
  body,
  tokens: options.tokens,
  editor: options.editor,
  area: options.area,
  header: options.header ? slot(options.header) : undefined,
  footer: options.footer ? slot(options.footer) : undefined,
});

function mergeTokens(
  node: LayoutBase,
  dynamicTokens: RenderContext<unknown>["dynamicTokens"],
): readonly StyleToken[] {
  return [...(node.tokens ?? []), ...(dynamicTokens?.[node.id] ?? [])];
}

export function renderLayout<Output, Slot>(
  node: LayoutNode,
  renderer: LayoutRenderer<Output, Slot>,
  context: RenderContext<Slot>,
): Output {
  switch (node.kind) {
    case "slot":
      return renderer.slot(node, context.slots[node.slot]);
    case "container": {
      const children = node.children.map((child) =>
        renderLayout(child, renderer, context),
      );
      return renderer.container(
        node,
        children,
        mergeTokens(node, context.dynamicTokens),
      );
    }
    case "panel": {
      const header = node.header
        ? renderLayout(node.header, renderer, context)
        : undefined;
      const body = node.body.map((child) =>
        renderLayout(child, renderer, context),
      );
      const footer = node.footer
        ? renderLayout(node.footer, renderer, context)
        : undefined;
      return renderer.panel(
        node,
        header,
        body,
        footer,
        mergeTokens(node, context.dynamicTokens),
      );
    }
  }
}

export interface LayoutValidation {
  nodeIds: readonly string[];
  slots: readonly string[];
}

export function validateLayout(layout: PageLayout): LayoutValidation {
  const nodeIds = new Set<string>();
  const slots = new Set<string>();

  const visit = (node: LayoutNode) => {
    if (nodeIds.has(node.id)) {
      throw new Error(`Duplicate layout node id: ${node.id}`);
    }
    nodeIds.add(node.id);

    if (node.kind === "slot") {
      slots.add(node.slot);
      return;
    }

    if (node.kind === "panel") {
      if (node.header) visit(node.header);
      for (const child of node.body) visit(child);
      if (node.footer) visit(node.footer);
      return;
    }

    for (const child of node.children) visit(child);
  };

  visit(layout.root);
  return { nodeIds: [...nodeIds], slots: [...slots] };
}
