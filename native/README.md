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

The APK does not use WebView/Chromium as its application shell, Node.js at
runtime, V8/Perry's `--enable-js-runtime`, React DOM, Monaco, or JavaScript
JIT execution.

## Optimization

The CI build pins Perry 0.5.1520 and enables:

- LLVM native AOT code generation;
- `--fast-math` / `PERRY_FAST_MATH=1`;
- `PERRY_LL_SIZE_OPT=0`, restoring LLVM `-O3` instead of Perry's newer
  size-optimized native default;
- ARM64 Android output with a generic CPU baseline for broad device
  compatibility.

## Shared schema coverage

The Perry renderer consumes the same application shell, Chip, CPU, Assembler,
VM, Jack Compiler, Bitmap, Converter, About, and route metadata used by the
browser renderer.

## Functional native subset

Already implemented without a JS-runtime fallback:

- 16-bit NAND evaluator using the repository simulator kernel;
- Hack ALU evaluator using the repository simulator kernel;
- CPU single-step execution with differential tests against `cpu()`;
- Hack assembler with labels, variables, and predefined symbols;
- two's-complement decimal/hex/binary converter;
- native text-entry surfaces for HDL, VM, and Jack source.

The HDL/VM/Jack execution paths still depend on browser-oriented parser/state
infrastructure in the existing app. Their shared layout is rendered natively,
but execution remains explicitly staged rather than silently using WebView/V8.

## Local build

Requirements: Node 22+, Perry 0.5.1520, Android SDK, and Android NDK.

```sh
npm ci
npx tsc --build presentation
npm install --global @perryts/perry@0.5.1520

export PERRY_FAST_MATH=1
export PERRY_LL_SIZE_OPT=0

cd native
perry check src/main.ts --strict
perry compile src/main.ts \
  --target android \
  --fast-math \
  --app-bundle-id org.nand2tetris.native \
  -o dist/nand2tetris-native.apk
```

GitHub Actions additionally verifies the APK archive, Android package metadata,
and APK signature before uploading it as `nand2tetris-perry-aot-arm64`.
