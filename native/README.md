# nand2tetris Perry-native Android target

This directory is a strict native-AOT Android port built with [Perry](https://github.com/PerryTS/perry).

## Design constraints

The native target intentionally does **not** use:

- WebView / Chromium
- Node.js at runtime
- V8 or Perry's `--enable-js-runtime` fallback
- React DOM / Monaco
- runtime JavaScript evaluation

The current native baseline directly compiles the existing repository's pure TypeScript execution kernels:

- `simulator/src/util/twos.ts`
- `simulator/src/cpu/alu.ts`

The Android UI uses `perry/ui` native widgets. A small AOT-safe adapter preserves the existing CPU tick/tock semantics, and a native Hack assembly parser reuses the repository's canonical ALU/encoding tables while avoiding the browser-oriented Ohm parser.

## Current native tools

- 16-bit NAND evaluator
- Hack ALU evaluator
- CPU single-step emulator
- Hack assembler with labels, predefined symbols, and variables
- native execution benchmark over the real NAND/ALU kernels

The existing browser application remains untouched.

## Why the rest is staged

The web IDE's HDL/VM/Jack parsing currently uses `ohm-js`; clock/state code uses RxJS; the UI uses React DOM, Monaco, browser storage, and other browser APIs. Enabling Perry's V8 compatibility fallback would make packaging easier but would violate the goal of an aggressively optimized no-JIT native APK.

The native port therefore has a hard rule: browser dependencies are replaced incrementally and each replacement must pass compatibility tests before becoming part of the APK.

## Local build

Requirements: Node 22+, Android SDK/NDK, and Perry.

```sh
cd native
npm install
npm run check
npm run build:android
```

The CI workflow runs the existing repository regression suite first, then native differential tests, Perry compatibility checking, and the Android build. On GitHub-hosted Linux runners it uses the preinstalled Android SDK directly and installs the pinned NDK with `sdkmanager`.

## Optimization policy

The Android build uses Perry's LLVM backend with `--fast-math` enabled. The current simulator hot paths are integer/bitwise operations, so fast-math does not alter their intended 16-bit Hack semantics. Differential CPU tests run before the native build.

Perry's JavaScript-runtime fallback is deliberately not enabled.
