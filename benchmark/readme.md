# Compiler benchmark

Run `node benchmark/index.js` with Node.js 26 or later after installing development dependencies. The runner uses the locally installed TypeScript compiler and prints its version.

Each fixture has separate parse, compact encode, and canonical encode measurements. Parsing must match the corresponding value type in `values.ts`, and both encoding modes must produce a string literal that parses successfully. Compact encoding also checks the exact round trip. Canonical encoding normalizes scalar spellings, so its parsed value need not preserve the original scalar source text.

Encoding measurements include their parse round-trip checks.

The small fixture is a basic service configuration, and the medium fixture includes collections and numeric and temporal scalars. The boundary fixture preserves the original benchmark's 512 UTF-16 code units and 16 collection levels. The realistic fixture is approximately 3 KB and includes literal and escaped block strings, literal Unicode string values and ASCII keys, durations, an offset instant, alternate-radix integers, and nested service settings. The deep fixture exercises the specification's full 100 collection levels.

The baseline checks the same package declarations and fixture types without using `Parse` or `Encode`. Extra instantiations subtract that baseline. Each case runs in a fresh compiler process with strict checking, NodeNext resolution, and declaration checking enabled.

Wall time includes compiler startup, libraries, and checking. Memory is the compiler's reported memory usage, not peak process memory. These measurements describe compile-time cost; runtime parser latency measures different work and is not directly comparable. Wall time and memory vary between runs, while instantiation counts are useful for comparing changes with the same TypeScript version.

Generated consumers live in disposable directories in the system temporary directory and are removed when the runner exits.
