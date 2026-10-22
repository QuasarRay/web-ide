# nand2tetris Perry-native Android target

This directory builds a **native Android APK** from TypeScript with Perry.

The target is a second renderer for the repository's shared `presentation/`
schema. It does not replace the browser application and does not maintain a
parallel page-layout architecture.

## Runtime architecture

```
simulator kernels + native AOT-safe adapters
                  ↓
          presentation schema
                  ↓
          Perry LayoutRenderer
                  ↓
     Perry native Android widgets
                  ↓
             Android Views
```

The APK does not use:

- WebView or Chromium as the application shell;
- Node.js at runtime;
- V8 / Perry `--enable-js-runtime`;
- React DOM;
- Monaco;
- JavaScript JIT evaluation.

Perry compiles the TypeScript ahead of time and links its native runtime and
Android UI implementation into the application.

## Shared schema coverage

The Perry renderer consumes the same:

- application shell layout;
- Chip layout;
- CPU layout;
- Assembler layout;
- VM layout;
- Jack Compiler layout;
- Bitmap layout;
- Converter layout;
- About layout;
- route metadata

used by the browser renderer.

## Functional native subset

Already functional in the strict-AOT APK:

- 16-bit NAND evaluator using the repository's simulator kernel;
- Hack ALU evaluator using the repository's simulator kernel;
- CPU single-step execution with differential tests against `cpu()`;
- Hack assembler with labels, variables, and predefined symbols;
- two's-complement decimal/hex/binary converter.

Native editor surfaces are present for HDL, VM, and Jack source. Their
browser implementation currently depends on paths such as Ohm, RxJS, and
Monaco that are not yet suitable for the strict AOT target. Those regions are
kept as native placeholders until equivalent AOT-safe parsers/controllers are
ported. No WebView fallback is used.

## Build

Prerequisites are Node 22+, Perry 0.5.1520, Android SDK, and NDK.

```sh
npm ci
./node_modules/.bin/tsc --build presentation
cd native
perry check src/main.ts
perry compile src/main.ts --target android --fast-math -o dist/Nand2TetrisNative
```

The GitHub Actions workflow builds the Android ARM64 runtime/UI archives,
compiles the native target, verifies an APK exists, and publishes it as an
artifact.
