# soml-typescript-types

> A SOML parser, encoder, and canonicalizer written entirely in TypeScript types

Your TypeScript compiler parses the document, validates its values, and infers the result. It can even encode and canonicalize SOML, including integer radix conversion, nanosecond duration arithmetic, and UTC date rollover. **Zero runtime code. Just `import type`.**

## Install

```sh
npm install soml-typescript-types
```

Requires TypeScript 7 or later with `strictNullChecks` enabled.

## API

### `Parse<Source, Options>`

Parse a SOML string literal into its value type. Supports objects, arrays, comments, block strings, numeric and temporal scalars, and up to 100 nested collections. Invalid input returns `SomlError`.

```ts
import type {Parse} from 'soml-typescript-types';

type Configuration = Parse<`name: 'api-gateway'
port: 8080
healthy: true`, {integers: 'bigint'}>;
//=> {name: 'api-gateway'; port: 8080n; healthy: true}
```

### `Encode<Value, Options>`

Encode literal scalars, finite tuples, and object types with required members as a SOML string literal. Keys are sorted. Use `canonical: true` to normalize scalars, indent with tabs, and add a final LF; canonical documents must be objects or arrays. Unsupported values return `SomlError`.

Private or protected constructors that shadow built-in function members are unsupported because their construct signatures are hidden from conditional type checks.

```ts
import type {Encode} from 'soml-typescript-types';

type Source = Encode<{port: 8080n; healthy: true}>;
//=> '{healthy: true, port: 8080}'
```

Temporal values use their branded types:

```ts
import type {Encode, SomlDate} from 'soml-typescript-types';

type Source = Encode<{day: SomlDate<'1582-10-10'>}>;
//=> '{day: 1582-10-10}'
```

### `Canonicalize<Source, Options>`

Parse and normalize a SOML document into its canonical string literal. Accepts the same options as `Parse`. Invalid or unencodable input returns `SomlError`.

```ts
import type {Canonicalize} from 'soml-typescript-types';

type Source = Canonicalize<"z: 0xFF\na: 90m">;
//=> 'a: 1h30m\nz: 255\n'
```

### Options and values

- `integers: 'bigint'` infers exact bigint literals across the full signed int64 range. The default, `'source'`, preserves spelling as `SomlInteger<Source>`.
- `maxDepth` lowers the nesting limit from 100. Each object or array counts as one level, including the root.
- `SomlDate<Source>` (also exported as `Date<Source>`) preserves exact proleptic Gregorian `YYYY-MM-DD` spelling in years 0001 to 9999, without a time or timezone. It is distinct from strings and instants. Import `SomlDate` when the module also uses the global `Date` type, because the alias shadows it.
- `SomlInstant<Source>` and `SomlDuration<Source>` preserve temporal spelling. Canonical encoding normalizes instants to UTC and durations to hours, minutes, and seconds.
- Floats infer as number literals where possible. `number` literals encode as floats; use `bigint` or `SomlInteger` for integers.
- `SomlError` includes a `reason`; source positions are not tracked. Unions containing an invalid alternative return only diagnostics. A widened source `string` returns a general value model.

## Limitations

> [!NOTE]
> Unicode escape decoding (`\u{…}`), Unicode scalar validation, and non-ASCII key encoding are unsupported. Literal Unicode string values and quoted input keys are preserved. C0 controls other than tab and LF, and U+007F, cannot be encoded.

This works on types, not runtime input or UTF-8 bytes. Encoding requires concrete values: widened primitives, open arrays, optional members, and index signatures cannot identify one encoding. Rounded floats can widen to `number`, preventing encoding or canonicalization. There is no fixed character cap, but TypeScript's compiler resource limits still apply.

Option values must be concrete literals. Widened or ambiguous option types are unsupported to keep this compile-time API simple.

Structurally subsumed unions wrapped in `NoInfer` are unsupported because TypeScript can collapse their alternatives during inference.

See the [SOML specification](https://github.com/soml-lang/soml/blob/main/spec.md) and [type declarations](index.d.ts) for details.

## FAQ

### Why? This is dumb.

Why not?

Some people climb mountains. Some people build ships in bottles. Some people teach the TypeScript compiler to do nanosecond duration arithmetic and UTC date rollover using nothing but conditional types and spite. We all cope differently.

Also consider:

- **It has no runtime bugs.** It has no runtime.
- **Your config errors become type errors.** Your CI will reject a typo in a config file before the config file even exists at runtime.
- **The bundle size is 0 bytes.** Tree shaking cannot remove what was never there.
- **It keeps your CPU warm in the winter.** See `npm run bench` for exact heating output.
- **Someone had to prove it was possible.** Now nobody else has to. You are welcome.

If you still think it is dumb, you are probably right. It is also tested against the SOML conformance corpus.

## Development

`npm test` checks the types and conformance runner. `npm run bench` measures compiler cost. `npm run test:conformance` checks the sibling `../soml-javascript/test/conformance` corpus, including explicit diagnostics for unsupported Unicode features. The scripts require Node.js 26 or later.

`npm run test:stress` runs generated parser, encoder, and scalar checks against the sibling runtime parser and serializer and independent Date and bigint calculations. Pass different runtime parser and serializer module paths after `--` if needed.
