# Renderer-agnostic presentation model

This directory owns **what the nand2tetris IDE UI is**, not **how a runtime draws it**.

It deliberately has no imports from React, the DOM, browser APIs, Perry, Android, Monaco, CSS, or the simulator runtime.

## Boundary

The presentation model owns:

- routes and tool metadata;
- shell/header actions;
- page layout structure;
- semantic regions/panels;
- renderer-neutral style tokens;
- named semantic slots;
- generic layout traversal and renderer contracts.

A renderer owns:

- React elements or Perry/native widgets;
- DOM/native event wiring;
- CSS/native style translation;
- browser/Android navigation;
- browser/Android file pickers;
- Monaco/native editors;
- browser/Android storage;
- platform lifecycle.

A controller/view-model owns:

- simulator/store state;
- actions;
- validation;
- data transformation;
- asynchronous effects.

The intended dependency direction is:

```
simulator + stores
       ↓
view models/controllers
       ↓
presentation schema
       ↓
┌──────────────┬──────────────┬──────────────┐
│ React/browser│ Perry/Android│ future target│
└──────────────┴──────────────┴──────────────┘
```

Renderers receive the same layout tree and provide implementations for named slots such as `cpu.rom`, `asm.source.editor`, or `vm.display.body`.

This lets platform-specific widgets diverge without duplicating page structure.
