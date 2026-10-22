import {
  LAST_ROUTE_KEY,
  ROUTES,
  TOOLS,
  type RouteId,
} from "../../presentation/build/navigation.js";
import { lazy } from "react";

const Chip = lazy(() => import("./pages/chip"));
const CPU = lazy(() => import("./pages/cpu"));
const ASM = lazy(() => import("./pages/asm"));
const BITMAP = lazy(() => import("./pages/bitmap"));
const VM = lazy(() => import("./pages/vm"));
const Compiler = lazy(() => import("./pages/compiler"));
const Util = lazy(() => import("./pages/util"));
const About = lazy(() => import("./pages/about"));

export { LAST_ROUTE_KEY, TOOLS };

export interface URL {
  id: RouteId;
  href: string;
  tool?: string;
  title: string;
  target: JSX.Element;
}

const targetByRoute: Readonly<Record<RouteId, JSX.Element>> = {
  chip: <Chip />,
  cpu: <CPU />,
  asm: <ASM />,
  vm: <VM />,
  compiler: <Compiler />,
  bitmap: <BITMAP />,
  util: <Util />,
  about: <About />,
};

const URLs = Object.fromEntries(
  Object.values(ROUTES).map((route) => [
    route.id,
    {
      ...route,
      target: targetByRoute[route.id],
    },
  ]),
) as Record<RouteId, URL>;

export default URLs;
