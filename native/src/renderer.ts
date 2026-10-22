import {
  Divider,
  ScrollView,
  scrollviewSetChild,
  setCornerRadius,
  setPadding,
  Text,
  textSetFontSize,
  type Widget,
  VStack,
  widgetSetBackgroundColor,
} from "perry/ui";

import { renderLayout } from "../../presentation/build/schema.js";
import type {
  ContainerNode,
  GroupNode,
  LayoutRenderer,
  PageLayout,
  PanelNode,
  SlotNode,
  StyleToken,
} from "../../presentation/src/schema.ts";

function stack(children: readonly Widget[], spacing = 8): Widget {
  const filtered: Widget[] = [];
  for (const child of children) {
    if (child !== undefined && child !== null) filtered.push(child);
  }
  return VStack(spacing, filtered);
}

function stylePanel(widget: Widget): Widget {
  setPadding(widget, 10);
  setCornerRadius(widget, 10);
  widgetSetBackgroundColor(widget, 0.12, 0.12, 0.14, 0.92);
  return widget;
}

const renderer: LayoutRenderer<Widget, Widget> = {
  group(_node: GroupNode, children: readonly Widget[]): Widget {
    return stack(children, 0);
  },

  container(
    _node: ContainerNode,
    children: readonly Widget[],
    tokens: readonly StyleToken[],
  ): Widget {
    let spacing = 8;
    for (const token of tokens) {
      if (token === "grid") spacing = 10;
    }
    return stack(children, spacing);
  },

  panel(
    _node: PanelNode,
    header: Widget | undefined,
    body: readonly Widget[],
    footer: Widget | undefined,
    _tokens: readonly StyleToken[],
  ): Widget {
    const children: Widget[] = [];
    if (header !== undefined) {
      children.push(header);
      children.push(Divider());
    }
    for (const child of body) children.push(child);
    if (footer !== undefined) {
      children.push(Divider());
      children.push(footer);
    }
    return stylePanel(stack(children, 6));
  },

  slot(node: SlotNode, value: Widget | undefined): Widget {
    if (value !== undefined) return value;
    if (node.optional) return VStack([]);
    const warning = Text("Unavailable native slot: " + node.slot);
    textSetFontSize(warning, 12);
    return warning;
  },
};

export function renderNativeTree(
  schema: PageLayout,
  slots: Readonly<Record<string, Widget | undefined>>,
  dynamicTokens: Readonly<Record<string, readonly StyleToken[] | undefined>> = {},
): Widget {
  return renderLayout(schema.root, renderer, {
    slots,
    dynamicTokens,
  });
}

export function renderNativeLayout(
  schema: PageLayout,
  slots: Readonly<Record<string, Widget | undefined>>,
  dynamicTokens: Readonly<Record<string, readonly StyleToken[] | undefined>> = {},
): Widget {
  const scroll = ScrollView();
  scrollviewSetChild(scroll, renderNativeTree(schema, slots, dynamicTokens));
  return scroll;
}
