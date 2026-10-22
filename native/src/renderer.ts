import {
  Divider,
  ScrollView,
  Text,
  VStack,
  scrollviewSetChild,
  setCornerRadius,
  setPadding,
  textSetFontSize,
  widgetSetBackgroundColor,
} from "perry/ui";

import { renderLayout } from "../../presentation/build/schema.js";

function stack(children: any[], spacing = 8): any {
  const filtered: any[] = [];
  for (const child of children) {
    if (child !== undefined && child !== null) filtered.push(child);
  }
  return VStack(spacing, filtered);
}

function stylePanel(widget: any): any {
  setPadding(widget, 10);
  setCornerRadius(widget, 10);
  widgetSetBackgroundColor(widget, 0.12, 0.12, 0.14, 0.92);
  return widget;
}

const renderer = {
  group(_node: any, children: any[]): any {
    return stack(children, 0);
  },

  container(_node: any, children: any[], tokens: string[]): any {
    let spacing = 8;
    for (const token of tokens) {
      if (token === "grid") spacing = 10;
    }
    return stack(children, spacing);
  },

  panel(
    _node: any,
    header: any | undefined,
    body: any[],
    footer: any | undefined,
    _tokens: string[],
  ): any {
    const children: any[] = [];
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

  slot(node: any, value: any | undefined): any {
    if (value !== undefined) return value;
    if (node.optional) return VStack([]);
    const warning = Text("Unavailable native slot: " + node.slot);
    textSetFontSize(warning, 12);
    return warning;
  },
};

export function renderNativeTree(
  schema: any,
  slots: Record<string, any | undefined>,
  dynamicTokens: Record<string, string[] | undefined> = {},
): any {
  return renderLayout(schema.root, renderer, {
    slots,
    dynamicTokens,
  });
}

export function renderNativeLayout(
  schema: any,
  slots: Record<string, any | undefined>,
  dynamicTokens: Record<string, string[] | undefined> = {},
): any {
  const scroll = ScrollView();
  scrollviewSetChild(scroll, renderNativeTree(schema, slots, dynamicTokens));
  return scroll;
}
