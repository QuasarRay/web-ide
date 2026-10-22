import {
  App,
  Button,
  HStack,
  NavStack,
  Text,
  VStack,
  state,
  textSetFontSize,
} from "perry/ui";

import {
  APP_LAYOUT,
  APP_ROUTER_LAYOUT,
} from "../../presentation/build/layouts.js";
import { ROUTES } from "../../presentation/build/navigation.js";
import {
  aboutPage,
  assemblerPage,
  bitmapPage,
  chipPage,
  compilerPage,
  cpuPage,
  utilPage,
  vmPage,
} from "./pages.ts";
import { renderNativeTree } from "./renderer.ts";

const route = state("chip");

function navButton(label: string, target: string): any {
  return Button(label, () => route.set(target));
}

function header(): any {
  const heading = Text("nand2tetris — Perry Native AOT");
  textSetFontSize(heading, 20);

  return VStack(5, [
    heading,
    HStack(4, [
      navButton(ROUTES.chip.title, "chip"),
      navButton(ROUTES.cpu.title, "cpu"),
      navButton(ROUTES.asm.title, "asm"),
    ]),
    HStack(4, [
      navButton(ROUTES.vm.title, "vm"),
      navButton(ROUTES.compiler.title, "compiler"),
      navButton(ROUTES.bitmap.title, "bitmap"),
    ]),
    HStack(4, [
      navButton(ROUTES.util.title, "util"),
      navButton(ROUTES.about.title, "about"),
    ]),
  ]);
}

const navigation = NavStack(route, [
  { name: "chip", body: chipPage() },
  { name: "cpu", body: cpuPage() },
  { name: "asm", body: assemblerPage() },
  { name: "vm", body: vmPage() },
  { name: "compiler", body: compilerPage() },
  { name: "bitmap", body: bitmapPage() },
  { name: "util", body: utilPage() },
  { name: "about", body: aboutPage() },
]);

const routerShell = renderNativeTree(APP_ROUTER_LAYOUT, {
  "app.header": header(),
  "app.content": navigation,
  "app.footer": Text("Native Android Views • Perry AOT • shared presentation schema"),
});

const appShell = renderNativeTree(APP_LAYOUT, {
  "app.router": routerShell,
});

App({
  title: "nand2tetris Native",
  width: 0,
  height: 0,
  body: appShell,
});
