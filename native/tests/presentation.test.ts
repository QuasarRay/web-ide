import { describe, expect, it } from "vitest";

import {
  ALL_LAYOUTS,
  APP_LAYOUT,
  APP_ROUTER_LAYOUT,
  ASM_LAYOUT,
  CPU_LAYOUT,
} from "../../presentation/src/layouts.ts";
import { validateLayout } from "../../presentation/src/schema.ts";

describe("Perry presentation integration", () => {
  it("validates every shared layout", () => {
    for (const layout of Object.values(ALL_LAYOUTS)) {
      expect(() => validateLayout(layout)).not.toThrow();
    }
  });

  it("uses the shared application shell slots", () => {
    const app = validateLayout(APP_LAYOUT);
    const router = validateLayout(APP_ROUTER_LAYOUT);

    expect(app.slots).toContain("app.router");
    expect(router.slots).toContain("app.header");
    expect(router.slots).toContain("app.content");
    expect(router.slots).toContain("app.footer");
  });

  it("keeps native CPU and assembler on canonical page schemas", () => {
    expect(validateLayout(CPU_LAYOUT).slots).toContain("cpu.io.body");
    expect(validateLayout(ASM_LAYOUT).slots).toContain("asm.source.editor");
    expect(validateLayout(ASM_LAYOUT).slots).toContain("asm.result.editor");
  });
});
