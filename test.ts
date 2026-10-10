import type {Canonicalize, Date as CalendarDate, Encode, Parse, SomlDate, SomlDuration, SomlError, SomlInstant, SomlInteger, SomlObject, SomlValue} from 'soml-typescript-types';

type Equal<First, Second> = (<Value>() => Value extends First ? 1 : 2) extends (<Value>() => Value extends Second ? 1 : 2) ? true : false;
type IsError<Value> = 0 extends (1 & Value) ? false : [Value] extends [never] ? false : [Value] extends [SomlError] ? true : false;
type Assert<Value extends true> = Value;

// Diagnostic assertions must reject any and never results.
type _AnyCannotProveDiagnostic = Assert<Equal<IsError<any>, false>>;
type _NeverCannotProveDiagnostic = Assert<Equal<IsError<never>, false>>;
type _ConcreteDiagnosticAccepted = Assert<Equal<IsError<SomlError<'Invalid scalar'>>, true>>;

type Parsed = Parse<'name: \'soml\'\nreplicas: 3\nflags: [true, null]'>;
type _Parsed = Assert<Equal<Parsed, {name: 'soml'; replicas: SomlInteger<'3'>; flags: [true, null]}>>;
type _Array = Assert<Equal<Parse<'[true, null, [false]]'>, [true, null, [false]]>>;
type _Object = Assert<Equal<Parse<'{a: {b: \'c\'}}'>, {a: {b: 'c'}}>>;
type _Duplicate = Assert<IsError<Parse<'a: 1\na: 2'>>>;
type _QuotedDuplicate = Assert<IsError<Parse<'{a: 1, "a": 2}'>>>;
type _HostileKey = Assert<Equal<Parse<'__proto__: 1\nconstructor: true\ntoString: null'>, {'__proto__': SomlInteger<'1'>; constructor: true; toString: null}>>;
type _Float = Assert<Equal<Parse<'value: 1.5'>, {value: 1.5}>>;
type _Invalid = Assert<IsError<Parse<'value: 01'>>>;

type _MissingArrayComma = Assert<IsError<Parse<'[true false]'>>>;
type _MissingObjectComma = Assert<IsError<Parse<'{a: true b: false}'>>>;
type _ArrayLineBreak = Assert<Equal<Parse<'[true\nfalse\n]'>, [true, false]>>;
type _ObjectLineBreak = Assert<Equal<Parse<'{a: true\nb: false}'>, {a: true; b: false}>>;
type _TrailingComma = Assert<Equal<Parse<'[true,\nfalse,]'>, [true, false]>>;
type _CommaOnOwnLine = Assert<IsError<Parse<'[true\n, false]'>>>;
type _TopLevelComma = Assert<IsError<Parse<'a: true,\nb: false'>>>;
type _KeySpace = Assert<IsError<Parse<'a : true'>>>;
type _EmptyBareKey = Assert<IsError<Parse<': true'>>>;
type _EmptyQuotedKey = Assert<Equal<Parse<'"": true'>, {'': true}>>;
type _TrailingWhitespace = Assert<Equal<Parse<'{a: true} \n\t'>, {a: true}>>;
type _TrailingContent = Assert<IsError<Parse<'[true] false'>>>;
type _UnclosedArray = Assert<IsError<Parse<'[true'>>>;
type _UnclosedObject = Assert<IsError<Parse<'{a: true'>>>;
type _EmptyDocument = Assert<IsError<Parse<''>>>;
type _ScalarDocument = Assert<IsError<Parse<'true'>>>;

type _LineComment = Assert<Equal<Parse<'# heading\na: true # note\nb: false # end'>, {a: true; b: false}>>;
type _BlockComment = Assert<Equal<Parse<'/* heading */ [true /* note */, false] /* end */'>, [true, false]>>;
type _CommentLineBreak = Assert<IsError<Parse<'[true /*\n*/ false]'>>>;
type _CommentAfterColon = Assert<Equal<Parse<'a: # note\ntrue'>, {a: true}>>;
type _CommentBeforeColon = Assert<IsError<Parse<'a/* note */: true'>>>;
type _UnclosedComment = Assert<IsError<Parse<'/* unclosed'>>>;
type _NestedComment = Assert<IsError<Parse<'[/* outer /* inner */ true]'>>>;
type _OnlyComment = Assert<IsError<Parse<'# note'>>>;

type _LiteralBackslash = Assert<Equal<Parse<"value: 'a\\n'">, {value: 'a\\n'}>>;
type _Escapes = Assert<Equal<Parse<'value: "a\\n\\t\\\\\\\""'>, {value: 'a\n\t\\"'}>>;
type _LiteralLineBreak = Assert<IsError<Parse<"value: 'a\nb'">>>;
type _QuotedLineBreak = Assert<IsError<Parse<'value: "a\nb"'>>>;
type _BadEscape = Assert<IsError<Parse<'value: "\\q"'>>>;
type _UnicodeEscape = Assert<Equal<Parse<'value: "\\u{61}"'>, SomlError<'Unicode escapes are unsupported'>>>;
type _BlockString = Assert<Equal<Parse<"value: '''\nhello\n'''">, {value: 'hello'}>>;
type _CarriageReturn = Assert<IsError<Parse<'# note\r\na: true'>>>;
type _RawControl = Assert<IsError<Parse<"value: '\u0000'">>>;
type _Bom = Assert<IsError<Parse<'\uFEFFa: true'>>>;

type _EncodedString = Assert<Equal<Encode<"it's">, '"it\'s"'>>;
type _EncodedArray = Assert<Equal<Encode<readonly [true, null]>, '[true, null]'>>;
type _EmptyEncodedObject = Assert<Equal<Encode<{}>, '{}'>>;
type _Encoded = Assert<Equal<Parse<Encode<{readonly name: 'soml'; readonly count: SomlInteger<'3'>}>>, {name: 'soml'; count: SomlInteger<'3'>}>>;
type _OpenArray = Assert<IsError<Encode<string[]>>>;
type _NestedEncodeError = Assert<IsError<Encode<{value: undefined}>>>;
type _NumberEncoding = Assert<Equal<Encode<3>, '3.0'>>;
type _Widened = Assert<Equal<Parse<string>, SomlObject | SomlValue[]>>;
type _ParseSourceUnion = Assert<Equal<Parse<'[true]' | '[false]'>, [true] | [false]>>;
type _ParseInvalidSourceUnion = Assert<Equal<Parse<'[true]' | '["\u0000"]'>, SomlError<'Raw control characters are not allowed'>>>;
type _ParseAnySource = Assert<Equal<Parse<any>, SomlError<'Parsing requires a known source type'>>>;
type _ParseNeverSource = Assert<Equal<Parse<never>, SomlError<'Parsing requires a known source type'>>>;
type _IntegerLookingObject = Assert<Equal<Encode<{type: 'integer'; source: '3'}>, "{source: '3', type: 'integer'}">>;
type _InstantLookingObject = Assert<Equal<Encode<{type: 'instant'; source: '2024-01-01T00:00:00Z'}>, "{source: '2024-01-01T00:00:00Z', type: 'instant'}">>;
type _DurationLookingObject = Assert<Equal<Encode<{type: 'duration'; source: '1s'}>, "{source: '1s', type: 'duration'}">>;
type _ErrorLookingObject = Assert<Equal<Parse<"{error: 'SOML parse error', reason: 'configuration', position: 0.0}" | '[true]'>, {error: 'SOML parse error'; reason: 'configuration'; position: 0} | [true]>>;
type _ScalarLookingObjectRoundTrip = Assert<Equal<Parse<Encode<Parse<"type: 'integer'\nsource: '3'">>>, {type: 'integer'; source: '3'}>>;
type _ParseMultipleErrors = Assert<Equal<Parse<'[true]' | '[' | '{'>, SomlError<'Expected a closing bracket'> | SomlError<'Expected a closing brace'>>>;
type _BigintRadices = Assert<Equal<Parse<'[0xFF, 0o755, 0b1010, 1_024]', {integers: 'bigint'}>, [255n, 493n, 10n, 1024n]>>;
type _BigintBoundaries = Assert<Equal<Parse<'[9223372036854775807, -9223372036854775808]', {integers: 'bigint'}>, [9223372036854775807n, -9223372036854775808n]>>;
type _BigintNested = Assert<Equal<Parse<'{items: [0xFF, {count: -1}], timeout: 1s}', {integers: 'bigint'}>, {items: [255n, {count: -1n}]; timeout: SomlDuration<'1s'>}>>;
type _BigintOtherScalars = Assert<Equal<Parse<'[1.5, true, null, 1s, 2024-01-01T00:00:00Z]', {integers: 'bigint'}>, [1.5, true, null, SomlDuration<'1s'>, SomlInstant<'2024-01-01T00:00:00Z'>]>>;
type _BigintSourceMode = Assert<Equal<Parse<'[0xFF]', {integers: 'source'}>, [SomlInteger<'0xFF'>]>>;
type _BigintUnion = Assert<Equal<Parse<'[1]' | '[2]', {integers: 'bigint'}>, [1n] | [2n]>>;
type _BigintInvalidUnion = Assert<Equal<Parse<'[1]' | '[9223372036854775808]', {integers: 'bigint'}>, SomlError<'Invalid scalar'>>>;
type _BigintCanonicalRoundTrip = Assert<Equal<Parse<Encode<Parse<'{maximum: 9223372036854775807, radix: 0xFF}', {integers: 'bigint'}>, {canonical: true}>, {integers: 'bigint'}>, {maximum: 9223372036854775807n; radix: 255n}>>;
type BigintConfiguration = Parse<'maximum: 9223372036854775807', {integers: 'bigint'}>;
const exactBigintConfiguration: BigintConfiguration = {maximum: 9223372036854775807n};
// @ts-expect-error The inferred bigint is exact, even beyond JavaScript's safe integer range.
const incorrectBigintConfiguration: BigintConfiguration = {maximum: 9223372036854775806n};
// @ts-expect-error Integer representation must be a known supported mode.
type _InvalidIntegerMode = Parse<'[]', {integers: 'number'}>;

type _CanonicalizeDocument = Assert<Equal<Canonicalize<"z: 0xFF\na: 90m">, 'a: 1h30m\nz: 255\n'>>;
type _CanonicalizeBigints = Assert<Equal<Canonicalize<"z: 0xFF\na: 90m", {integers: 'bigint'}>, 'a: 1h30m\nz: 255\n'>>;
type _CanonicalizeUnion = Assert<Equal<Canonicalize<'[1]' | '[2]'>, '[\n\t1\n]\n' | '[\n\t2\n]\n'>>;
type _CanonicalizeInvalidUnion = Assert<Equal<Canonicalize<'[1]' | '["\u0000"]'>, SomlError<'Raw control characters are not allowed'>>>;
type _CanonicalizeInvalidSource = Assert<Equal<Canonicalize<'['>, SomlError<'Expected a closing bracket'>>>;
type _CanonicalizeUnknownSource = Assert<IsError<Canonicalize<string>>>;
type _CanonicalizeUnknownPattern = Assert<IsError<Canonicalize<`prefix${string}`>>>;
type _CanonicalizeRoundedFloat = Assert<IsError<Canonicalize<'[0.10000000000000001]'>>>;
type _CanonicalizeUnencodableUnion = Assert<IsError<Canonicalize<'[true]' | '[0.10000000000000001]'>>>;
type _CanonicalizeDepth = Assert<Equal<Canonicalize<'[[]]', {maxDepth: 2}>, '[\n\t[]\n]\n'>>;
type _CanonicalizeSiblingDepth = Assert<Equal<Canonicalize<'[{a: true}, [false]]', {maxDepth: 2}>, '[\n\t{\n\t\ta: true\n\t}\n\t[\n\t\tfalse\n\t]\n]\n'>>;
type _CanonicalizeDepthExceeded = Assert<Equal<Canonicalize<'[[]]', {maxDepth: 1}>, SomlError<'Maximum nesting depth exceeded'>>>;

type ScalarValue<Source extends string> = Parse<`value: ${Source}`> extends {value: infer Value} ? Value : Parse<`value: ${Source}`>;
type ScalarIsError<Source extends string> = [ScalarValue<Source>] extends [never] ? false : ScalarValue<Source> extends SomlError ? true : false;

type _ScalarDecimalSeparators = Assert<Equal<ScalarValue<'1_234'>, SomlInteger<'1_234'>>>;
type _ScalarSingleDigitInteger = Assert<Equal<ScalarValue<'9'>, SomlInteger<'9'>>>;
type _ScalarNegativeDecimalSeparators = Assert<Equal<ScalarValue<'-1_234'>, SomlInteger<'-1_234'>>>;
type _ScalarInt64Maximum = Assert<Equal<ScalarValue<'9223372036854775807'>, SomlInteger<'9223372036854775807'>>>;
type _ScalarInt64Minimum = Assert<Equal<ScalarValue<'-9223372036854775808'>, SomlInteger<'-9223372036854775808'>>>;
type _ScalarInt64Overflow = Assert<ScalarIsError<'9223372036854775808'>>;
type _ScalarInt64Underflow = Assert<ScalarIsError<'-9223372036854775809'>>;
type _ScalarManyDigits = Assert<ScalarIsError<'99999999999999999999999999999999'>>;
type _ScalarHexMaximum = Assert<Equal<ScalarValue<'0x7FFFFFFFFFFFFFFF'>, SomlInteger<'0x7FFFFFFFFFFFFFFF'>>>;
type _ScalarHexMaximumLeadingZeros = Assert<Equal<ScalarValue<'0x0007FFFFFFFFFFFFFFF'>, SomlInteger<'0x0007FFFFFFFFFFFFFFF'>>>;
type _ScalarHexOverflow = Assert<ScalarIsError<'0x8000000000000000'>>;
type _ScalarOctalMaximum = Assert<Equal<ScalarValue<'0o777777777777777777777'>, SomlInteger<'0o777777777777777777777'>>>;
type _ScalarOctalOverflow = Assert<ScalarIsError<'0o1000000000000000000000'>>;
type _ScalarBinaryMaximum = Assert<Equal<ScalarValue<'0b111111111111111111111111111111111111111111111111111111111111111'>, SomlInteger<'0b111111111111111111111111111111111111111111111111111111111111111'>>>;
type _ScalarBinaryOverflow = Assert<ScalarIsError<'0b1000000000000000000000000000000000000000000000000000000000000000'>>;
type _ScalarNegativeRadix = Assert<ScalarIsError<'-0xFF'>>;
type _ScalarNegativeZeroInteger = Assert<ScalarIsError<'-0'>>;
type _ScalarLeadingZero = Assert<ScalarIsError<'01'>>;
type _ScalarLowercaseHex = Assert<ScalarIsError<'0xff'>>;
type _ScalarLeadingSeparator = Assert<ScalarIsError<'_1'>>;
type _ScalarTrailingSeparator = Assert<ScalarIsError<'1_'>>;
type _ScalarDoubledSeparator = Assert<ScalarIsError<'1__0'>>;
type _ScalarRadixSeparator = Assert<ScalarIsError<'0x_FF'>>;
type _ScalarRadixEmpty = Assert<ScalarIsError<'0x'>>;
type _ScalarFloat = Assert<Equal<ScalarValue<'1.25'>, 1.25>>;
type _ScalarFloatExponent = Assert<Equal<ScalarValue<'1.25e-2'>, 0.0125>>;
type _ScalarFloatSeparators = Assert<Equal<ScalarValue<'1_234.5_6'>, 1234.56>>;
type _ScalarFloatNegativeZero = Assert<Equal<ScalarValue<'-0.0'>, 0>>;
type _ScalarFloatPositiveExponent = Assert<ScalarIsError<'1e+2'>>;
type _ScalarFloatLeadingExponentZero = Assert<ScalarIsError<'1e02'>>;
type _ScalarFloatNegativeExponentZero = Assert<ScalarIsError<'1e-0'>>;
type _ScalarFloatUppercaseExponent = Assert<ScalarIsError<'1E2'>>;
type _ScalarFloatEmptyFraction = Assert<ScalarIsError<'1.'>>;
type _ScalarFloatEmptyInteger = Assert<ScalarIsError<'.5'>>;
type _ScalarFloatLeadingZero = Assert<ScalarIsError<'01.5'>>;
type _ScalarFloatRepeatedExponent = Assert<ScalarIsError<'1e2e3'>>;
type _ScalarFloatRepeatedFraction = Assert<ScalarIsError<'1.2.3'>>;
type _ScalarDuration = Assert<Equal<ScalarValue<'1h30m5.25s'>, SomlDuration<'1h30m5.25s'>>>;
type _ScalarDurationMilliseconds = Assert<Equal<ScalarValue<'1ms'>, SomlDuration<'1ms'>>>;
type _ScalarDurationEveryUnit = Assert<Equal<ScalarValue<'1h1m1s1ms1us1ns'>, SomlDuration<'1h1m1s1ms1us1ns'>>>;
type _ScalarDurationFraction = Assert<Equal<ScalarValue<'0.0000000001h'>, SomlDuration<'0.0000000001h'>>>;
type _ScalarDurationPartialNanosecond = Assert<ScalarIsError<'0.00000000000001h'>>;
type _ScalarDurationNegative = Assert<Equal<ScalarValue<'-5m'>, SomlDuration<'-5m'>>>;
type _ScalarDurationFake = Assert<ScalarIsError<'items'>>;
type _ScalarDurationRepeatedUnit = Assert<ScalarIsError<'1m1m'>>;
type _ScalarDurationOutOfOrder = Assert<ScalarIsError<'1ms1s'>>;
type _ScalarDurationLeadingFraction = Assert<ScalarIsError<'1.5h30m'>>;
type _ScalarDurationLeadingZero = Assert<ScalarIsError<'01s'>>;
type _ScalarDurationNegativeZero = Assert<ScalarIsError<'-0h0.00s'>>;
type _ScalarDurationPerPartSign = Assert<ScalarIsError<'1h-1m'>>;
type _ScalarDurationExponent = Assert<ScalarIsError<'1e2s'>>;
type _ScalarDurationEmptyFraction = Assert<ScalarIsError<'1.s'>>;
type _ScalarDurationUnitOnly = Assert<ScalarIsError<'s'>>;
type _ScalarInstant = Assert<Equal<ScalarValue<'2024-02-29T23:59:59.123456789Z'>, SomlInstant<'2024-02-29T23:59:59.123456789Z'>>>;
type _ScalarInstantOffset = Assert<Equal<ScalarValue<'2024-02-29T01:00:00+01:00'>, SomlInstant<'2024-02-29T01:00:00+01:00'>>>;
type _ScalarInstantCenturyLeap = Assert<Equal<ScalarValue<'2000-02-29T00:00:00Z'>, SomlInstant<'2000-02-29T00:00:00Z'>>>;
type _ScalarInstantNonLeap = Assert<ScalarIsError<'2023-02-29T00:00:00Z'>>;
type _ScalarInstantCenturyNonLeap = Assert<ScalarIsError<'1900-02-29T00:00:00Z'>>;
type _ScalarInstantApril31 = Assert<ScalarIsError<'2024-04-31T00:00:00Z'>>;
type _ScalarInstantInvalidMonth = Assert<ScalarIsError<'2024-13-01T00:00:00Z'>>;
type _ScalarInstantInvalidDay = Assert<ScalarIsError<'2024-01-00T00:00:00Z'>>;
type _ScalarInstantYearZero = Assert<ScalarIsError<'0000-01-01T00:00:00Z'>>;
type _ScalarInstantShortYear = Assert<ScalarIsError<'123-01-01T00:00:00Z'>>;
type _ScalarInstantHour = Assert<ScalarIsError<'2024-01-01T24:00:00Z'>>;
type _ScalarInstantLeapSecond = Assert<ScalarIsError<'2024-01-01T23:59:60Z'>>;
type _ScalarInstantUnknownOffset = Assert<ScalarIsError<'2024-01-01T00:00:00-00:00'>>;
type _ScalarInstantOffsetRange = Assert<ScalarIsError<'2024-01-01T00:00:00+24:00'>>;
type _ScalarInstantNoOffset = Assert<ScalarIsError<'2024-01-01T00:00:00'>>;
type _ScalarInstantLongFraction = Assert<ScalarIsError<'2024-01-01T00:00:00.1234567890Z'>>;
type _ScalarInstantUnderscoreFraction = Assert<ScalarIsError<'2024-01-01T00:00:00.1_2Z'>>;
type _ScalarInstantLowercase = Assert<ScalarIsError<'2024-01-01t00:00:00z'>>;
type _ScalarUnknownScalar = Assert<ScalarIsError<'undefined'>>;

type EmptyObject = Assert<Equal<Encode<{}>, '{}'>>;
type EmptyArray = Assert<Equal<Encode<readonly []>, '[]'>>;
type ObjectMembers = Assert<Equal<Parse<Encode<{name: 'soml'; count: SomlInteger<'3'>}>>, {name: 'soml'; count: SomlInteger<'3'>}>>;
type Tuple = Assert<Equal<Encode<readonly ['soml', true, null, SomlInteger<'3'>]>, "['soml', true, null, 3]">>;
type LiteralQuotation = Assert<Equal<Encode<'soml'>, "'soml'">>;
type EscapedQuotation = Assert<Equal<Encode<"it's soml">, '"it\'s soml"'>>;
type Newline = Assert<Equal<Encode<'line\nnext'>, '"line\\nnext"'>>;
type EscapedCharacters = Assert<Equal<Encode<'quote\' " \\'>, '"quote\' \\" \\\\"'>>;
type Float = Assert<Equal<Encode<1.5>, '1.5'>>;
type WholeFloat = Assert<Equal<Encode<3>, '3.0'>>;
type ZeroFloat = Assert<Equal<Encode<0>, '0.0'>>;
type Exponent = Assert<Equal<Encode<1e21>, '1e21'>>;
type EmptyKey = Assert<Equal<Encode<{'': true}>, "{'': true}">>;
type QuotedKey = Assert<Equal<Encode<{'with spaces': true}>, "{'with spaces': true}">>;
type NestedArray = Assert<Equal<Encode<readonly [{nested: readonly [true]}]>, '[{nested: [true]}]'>>;
type DepthAllowed = Assert<Equal<Encode<readonly [readonly []], {maxDepth: 2}>, '[[]]'>>;
type DepthExceeded = Assert<Equal<Encode<readonly [readonly []], {maxDepth: 1}>, SomlError<'Maximum nesting depth exceeded'>>>;
type NestedError = Assert<IsError<Encode<{nested: readonly [undefined]}>>>;
type OpenArray = Assert<IsError<Encode<readonly true[]>>>;
type OptionalTuple = Assert<IsError<Encode<readonly [true?]>>>;
type OptionalObject = Assert<IsError<Encode<{value?: true}>>>;
type IndexSignature = Assert<IsError<Encode<Record<string, true>>>>;
type NumericKey = Assert<Equal<Encode<{1: true}>, '{1: true}'>>;
type UnknownString = Assert<IsError<Encode<string>>>;
type UnknownStringPattern = Assert<IsError<Encode<`prefix${string}`>>>;
type UnknownNumberPattern = Assert<IsError<Encode<`${number}`>>>;
type UnknownBigintPattern = Assert<IsError<Encode<`${bigint}`>>>;
type UnknownIntegerSourcePattern = Assert<IsError<Encode<SomlInteger<`${bigint}`>>>>;
type UnknownKeyPattern = Assert<IsError<Encode<{[Key in `prefix${string}`]: true}>>>;
type UnknownNumber = Assert<IsError<Encode<number>>>;
type UnknownInteger = Assert<IsError<Encode<SomlInteger>>>;
type UnknownValue = Assert<IsError<Encode<unknown>>>;
type UnknownObject = Assert<IsError<Encode<object>>>;
type UnknownCanonicalObject = Assert<IsError<Encode<object, {canonical: true}>>>;
type AnyValue = Assert<Equal<Encode<any>, SomlError<'Encoding requires a known value type'>>>;
type NeverValue = Assert<Equal<Encode<never>, SomlError<'Encoding requires a known value type'>>>;
type FunctionValue = Assert<IsError<Encode<() => true>>>;
type InvalidInteger = Assert<IsError<Encode<SomlInteger<'01'>>>>;
type MisclassifiedInteger = Assert<IsError<Encode<SomlInteger<'true'>>>>;
type MisclassifiedDuration = Assert<IsError<Encode<SomlDuration<'1'>>>>;
type MisclassifiedInstant = Assert<IsError<Encode<SomlInstant<'1s'>>>>;
type IntegerToken = Assert<Equal<Encode<SomlInteger<'0xFF'>>, '0xFF'>>;
type InstantToken = Assert<Equal<Encode<SomlInstant<'2024-01-01T00:00:00Z'>>, '2024-01-01T00:00:00Z'>>;
type DurationToken = Assert<Equal<Encode<SomlDuration<'1h30m'>>, '1h30m'>>;
type CarriageReturn = Assert<IsError<Encode<'carriage\rreturn'>>>;
type RawControl = Assert<Equal<Encode<'control\u0000'>, SomlError<'Raw control characters are not allowed'>>>;
type Tab = Assert<Equal<Encode<'a\tb'>, '"a\\tb"'>>;
type AllKeysPresent = Assert<Equal<Parse<Encode<{a: true; b: false; c: null; d: 'd'}>>, {a: true; b: false; c: null; d: 'd'}>>;
type MixedInvalidUnion = Assert<IsError<Encode<readonly [true | undefined]>>>;
type LiteralUnion = Assert<Equal<Encode<readonly ['a' | 'b']>, "['a']" | "['b']">>;
type Boolean = Assert<Equal<Encode<boolean>, 'true' | 'false'>>;
type Two = 'aa';
type Four = `${Two}${Two}`;
type Eight = `${Four}${Four}`;
type Sixteen = `${Eight}${Eight}`;
type ThirtyTwo = `${Sixteen}${Sixteen}`;
type SixtyFour = `${ThirtyTwo}${ThirtyTwo}`;
type OneHundredTwentyEight = `${SixtyFour}${SixtyFour}`;
type TwoHundredFiftySix = `${OneHundredTwentyEight}${OneHundredTwentyEight}`;
type FiveHundredTwelve = `${TwoHundredFiftySix}${TwoHundredFiftySix}`;
type LongerOutput = Assert<Equal<Encode<FiveHundredTwelve>, `'${FiveHundredTwelve}'`>>;

type NestedSource<Count extends number, Source extends string = 'true', Depth extends unknown[] = []> = Depth['length'] extends Count ? Source : NestedSource<Count, `[${Source}]`, [...Depth, 0]>;
type NestedValue<Count extends number, Value = true, Depth extends unknown[] = []> = Depth['length'] extends Count ? Value : NestedValue<Count, [Value], [...Depth, 0]>;
type _MaximumDepth = Assert<Equal<Parse<NestedSource<100>>, NestedValue<100>>>;
type _AboveMaximumDepth = Assert<IsError<Parse<NestedSource<101>>>>;
type _CustomDepth = Assert<Equal<Parse<'[[]]', {maxDepth: 2}>, [[]]>>;
type _CustomDepthExceeded = Assert<IsError<Parse<'[[]]', {maxDepth: 1}>>>;
type _RootDepth = Assert<Equal<Parse<'a: true', {maxDepth: 1}>, {a: true}>>;
type _NestedObjectDepth = Assert<IsError<Parse<'a: {}', {maxDepth: 1}>>>;
type _EncodeMaximumDepth = Assert<Equal<Encode<NestedValue<100>>, NestedSource<100>>>;
type _EncodeAboveMaximumDepth = Assert<IsError<Encode<NestedValue<101>>>>;
type _BigintMaximumDepth = Assert<Equal<Parse<NestedSource<100, '9223372036854775807'>, {integers: 'bigint'}>, NestedValue<100, 9223372036854775807n>>>;
type _BigintAboveMaximumDepth = Assert<IsError<Parse<NestedSource<101, '1'>, {integers: 'bigint'}>>>;
type _CanonicalizeMaximumDepth = Assert<Equal<Canonicalize<NestedSource<100, '1'>, {integers: 'bigint'}>, Encode<NestedValue<100, 1n>, {canonical: true}>>>;

// A self-referential shape must stop at the nesting limit without a compiler recursion error.
type RecursiveObject = {next: RecursiveObject};
type _RecursiveObjectDepth = Assert<Equal<Encode<RecursiveObject>, SomlError<'Maximum nesting depth exceeded'>>>;

// Complex scalar leaves remain exact at the maximum collection depth.
type MaximumDepthScalarSource = "[-9_223_372_036_854_775_808, 2562047h46m76s854ms775.807us, 0400-03-01T00:00:00.000000001+00:01, 1e-7, \"line\\nend\"]";
type MaximumDepthScalarValues = [SomlInteger<'-9_223_372_036_854_775_808'>, SomlDuration<'2562047h46m76s854ms775.807us'>, SomlInstant<'0400-03-01T00:00:00.000000001+00:01'>, 1e-7, 'line\nend'];
type _MaximumDepthScalarLeavesParsed = Assert<Equal<Parse<NestedSource<99, MaximumDepthScalarSource>>, NestedValue<99, MaximumDepthScalarValues>>>;
type _MaximumDepthScalarLeavesEncoded = Assert<Equal<Encode<NestedValue<99, MaximumDepthScalarValues>>, NestedSource<99, MaximumDepthScalarSource>>>;

type Payload508 = `${TwoHundredFiftySix}${OneHundredTwentyEight}${SixtyFour}${ThirtyTwo}${Sixteen}${Eight}${Four}`;
type _SourceBoundary = Assert<Equal<Parse<`['${Payload508}']`>, [Payload508]>>;
type _SourceAboveOldBoundary = Assert<Equal<Parse<`['${Payload508}a']`>, [`${Payload508}a`]>>;
type _EncodeBoundary = Assert<Equal<Encode<`${Payload508}aa`>, `'${Payload508}aa'`>>;
type _SourceLongComment = Assert<Equal<Parse<`#${FiveHundredTwelve}\n[]`>, []>>;
// @ts-expect-error The specification limits nesting to 100 levels.
type _InvalidDepthOption = Parse<'[]', {maxDepth: 101}>;

type TupleEight = readonly [true, true, true, true, true, true, true, true];
type TupleSixteen = readonly [...TupleEight, ...TupleEight];
type TupleThirtyTwo = readonly [...TupleSixteen, ...TupleSixteen];
type TupleSixtyFour = readonly [...TupleThirtyTwo, ...TupleThirtyTwo];
type TupleOneHundredTwentyEight = readonly [...TupleSixtyFour, ...TupleSixtyFour];
type TupleTwoHundredFiftySix = readonly [...TupleOneHundredTwentyEight, ...TupleOneHundredTwentyEight];
type TupleFiveHundredTwelve = readonly [...TupleTwoHundredFiftySix, ...TupleTwoHundredFiftySix];
type TupleOneThousandTwentyFour = readonly [...TupleFiveHundredTwelve, ...TupleFiveHundredTwelve];
// Diagnostics replace valid alternatives even after the encoder's recursion counter resets.
type _EncodingDiagnosticsAfterBatch = Assert<Equal<Encode<readonly [...TupleSixtyFour, {value: true | undefined | readonly boolean[]}]>, SomlError<'Unsupported value'> | SomlError<'Encoding requires a finite tuple'>>>;

// Explicit options remain in effect after the recursion counter resets.
type _EncodingDepthLimitAfterBatch = Assert<Equal<Encode<readonly [...TupleSixtyFour, readonly []], {maxDepth: 1}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _BigintModeAfterParserBatch = Assert<Equal<Parse<Encode<readonly [...TupleSixtyFour, SomlInteger<'0xF'>, SomlInteger<'20'>]>, {integers: 'bigint'}>, [...TupleSixtyFour, 15n, 20n]>>;

type _LargeTupleOutput = Encode<TupleOneThousandTwentyFour>;
type _LargeTuple = Assert<Equal<Parse<_LargeTupleOutput>['length'], 1024>>;
type _BomString = Assert<Equal<Encode<'\uFEFF'>, "'\uFEFF'">>;
type _BomKey = Assert<Equal<Encode<{'\uFEFF': true}>, SomlError<'Encoding requires ASCII object keys'>>>;
type FlatObject = {[Key in `${'a' | 'b' | 'c' | 'd'}${'a' | 'b' | 'c' | 'd'}${'a' | 'b' | 'c' | 'd'}`]: true};
type _FlatObject = Assert<Equal<Parse<Encode<FlatObject>>, FlatObject>>;

type _LongKey = Assert<Equal<Encode<{[Key in `${FiveHundredTwelve}${FiveHundredTwelve}`]: true}>, `{${FiveHundredTwelve}${FiveHundredTwelve}: true}`>>;

// Literal Unicode text, unsupported escape decoding and key sorting, and decoded duplicate keys.
type _UnicodeSupplementary = Assert<Equal<Parse<'["\\u{1f600}", "\\u{10000}", "\\u{10ffff}"]'>, SomlError<'Unicode escapes are unsupported'>>>;
type _UnicodeControls = Assert<Equal<Parse<'["\\u{0}\\u{8}\\u{7f}"]'>, SomlError<'Unicode escapes are unsupported'>>>;
type _UnicodeNoncharacter = Assert<Equal<Parse<'["\\u{ffff}"]'>, SomlError<'Unicode escapes are unsupported'>>>;
type _UnicodeLeadingZero = Assert<IsError<Parse<'["\\u{061}"]'>>>;
type _UnicodeUppercase = Assert<IsError<Parse<'["\\u{1F600}"]'>>>;
type _UnicodeEmpty = Assert<IsError<Parse<'["\\u{}"]'>>>;
type _UnicodeSurrogateEscape = Assert<IsError<Parse<'["\\u{d800}"]'>>>;
type _UnicodeOutOfRange = Assert<IsError<Parse<'["\\u{110000}"]'>>>;
type _UnicodeCarriageReturnEscape = Assert<IsError<Parse<'["\\u{d}"]'>>>;
type _UnicodeLoneHigh = Assert<Equal<Parse<"['\uD800']">, ['\uD800']>>;
type _UnicodeLoneLowComment = Assert<Equal<Parse<'# \uDC00\n[]'>, []>>;
type _UnicodeDuplicate = Assert<IsError<Parse<'{a: true, "\\u{61}": false}'>>>;
type _UnicodeOrder = Assert<Equal<Encode<{'😀': true; '\uE000': false; 'é': null; a: 'a'}>, SomlError<'Encoding requires ASCII object keys'>>>;
type _SupplementaryOrder = Assert<Equal<Encode<{'\u{20000}': null; '😀': true; '\u{10000}': false}>, SomlError<'Encoding requires ASCII object keys'>>>;
type _SupplementaryAdjacentOrder = Assert<Equal<Encode<{'😁': false; '😀': true}>, SomlError<'Encoding requires ASCII object keys'>>>;
type _UnicodeBoundaryOrder = Assert<Equal<Encode<{'\u{10FFFF}': null; '\u{10000}': false; '\uFFFF': true}>, SomlError<'Encoding requires ASCII object keys'>>>;
type _UnicodePrefixOrder = Assert<Equal<Encode<{'key😀': false; 'key\uE000': true; key: null}>, SomlError<'Encoding requires ASCII object keys'>>>;
type _ControlEncoding = Assert<Equal<Encode<'a\u0000\u0008\u007F'>, SomlError<'Raw control characters are not allowed'>>>;
type _LoneSurrogateEncoding = Assert<Equal<Encode<'\uD800'>, "'\uD800'">>;
type _BigIntMaximum = Assert<Equal<Encode<9223372036854775807n>, '9223372036854775807'>>;
type _BigIntMinimum = Assert<Equal<Encode<-9223372036854775808n>, '-9223372036854775808'>>;
type _BigIntOverflow = Assert<IsError<Encode<9223372036854775808n>>>;
type _BigIntUnknown = Assert<IsError<Encode<bigint>>>;
type _NumericKeyOrder = Assert<Equal<Encode<{10: false; 2: true; 1: null}>, '{1: null, 10: false, 2: true}'>>;

// Blocks strip the closing indentation and trim only the outer blank lines.
type _BlockIndentation = Assert<Equal<Parse<"value: '''\n\n\tfirst\n \t\n\tsecond\n\n\t'''">, {value: 'first\n\nsecond'}>>;
type _BlockEscapes = Assert<Equal<Parse<'value: """\n\t😀\\nnext\n\t"""'>, {value: '😀\nnext'}>>;
type _UnicodeLineSeparatorsRemainBlockContent = Assert<Equal<Parse<"value: '''\n\t\u0085\u2028\u2029\n\t'''">, {value: '\u0085\u2028\u2029'}>>;
type _BlockLongerDelimiter = Assert<Equal<Parse<"value: ''''\na ''' quote\n''''">, {value: "a ''' quote"}>>;
type _BlockIndentationMismatch = Assert<IsError<Parse<"value: '''\n  content\n\t'''">>>;
type _BlockOpeningLine = Assert<IsError<Parse<"value: ''' text\n'''">>>;
type _BlockKey = Assert<IsError<Parse<"'''\nkey\n''': true">>>;

// Decimal arithmetic checks values, rather than limiting duration fraction digits.
type _DurationExactHours = Assert<Equal<ScalarValue<'0.0000000000025h'>, SomlDuration<'0.0000000000025h'>>>;
type _DurationMaximum = Assert<Equal<ScalarValue<'2562047h47m16.854775807s'>, SomlDuration<'2562047h47m16.854775807s'>>>;
type _DurationMinimum = Assert<Equal<ScalarValue<'-9223372036854775808ns'>, SomlDuration<'-9223372036854775808ns'>>>;
type _DurationOverflow = Assert<ScalarIsError<'9223372036854775808ns'>>;
type _DurationPartialNanosecond = Assert<ScalarIsError<'0.1ns'>>;
type _DurationNestedInvalid = Assert<IsError<Parse<'{a: [1s, 0.1ns]}'>>>;
type _FloatOverflow = Assert<ScalarIsError<'1.7976931348623159e308'>>;
type _FloatUnderflow = Assert<ScalarIsError<'2e-324'>>;
type _FloatHugeExponent = Assert<ScalarIsError<'1e999999999999999999'>>;
type _FloatMaximum = Assert<Equal<ScalarValue<'1.7976931348623157e308'>, 1.7976931348623157e308>>;
type _FloatMinimum = Assert<Equal<ScalarValue<'5e-324'>, 5e-324>>;
type _FloatScientificInteger = Assert<Equal<ScalarValue<'1e2'>, 100>>;
type _FloatRoundedSpelling = Assert<Equal<ScalarValue<'0.10000000000000001'>, number>>;
type _LongString = Assert<Equal<Parse<`['${FiveHundredTwelve}${FiveHundredTwelve}${FiveHundredTwelve}${FiveHundredTwelve}']`>, [`${FiveHundredTwelve}${FiveHundredTwelve}${FiveHundredTwelve}${FiveHundredTwelve}`]>>;
type _InstantUtcUnderflow = Assert<ScalarIsError<'0001-01-01T00:00:00+00:01'>>;
type _InstantUtcOverflow = Assert<ScalarIsError<'9999-12-31T23:59:59.999999999-00:01'>>;
type _InstantUtcLowerBoundary = Assert<Equal<ScalarValue<'0001-01-01T00:01:00+00:01'>, SomlInstant<'0001-01-01T00:01:00+00:01'>>>;
type _Infinity = Assert<Equal<Encode<Parse<'[infinity, -infinity]'>>, '[infinity, -infinity]'>>;
type _CanonicalEmptyObject = Assert<Equal<Encode<{}, {canonical: true}>, '{}\n'>>;
type _CanonicalEmptyArray = Assert<Equal<Encode<[], {canonical: true}>, '[]\n'>>;
type _CanonicalObject = Assert<Equal<Encode<{z: [true, {b: null; a: 'a'}]; a: {}}, {canonical: true}>, "a: {}\nz: [\n\ttrue\n\t{\n\t\ta: 'a'\n\t\tb: null\n\t}\n]\n">>;
type _CanonicalScalars = Assert<Equal<Encode<{integer: SomlInteger<'0xFF'>; duration: SomlDuration<'90m'>; instant: SomlInstant<'2024-03-01T00:30:00.1200+01:00'>}, {canonical: true}>, 'duration: 1h30m\ninstant: 2024-02-29T23:30:00.12Z\ninteger: 255\n'>>;
type _CanonicalInstantPreviousYear = Assert<Equal<Encode<{time: SomlInstant<'2024-01-01T00:00:00+00:01'>}, {canonical: true}>, 'time: 2023-12-31T23:59:00Z\n'>>;
type _CanonicalInstantNextYear = Assert<Equal<Encode<{time: SomlInstant<'2024-12-31T23:59:00-00:01'>}, {canonical: true}>, 'time: 2025-01-01T00:00:00Z\n'>>;
type _CanonicalInstantZeroFraction = Assert<Equal<Encode<{time: SomlInstant<'2024-01-01T00:00:00.000Z'>}, {canonical: true}>, 'time: 2024-01-01T00:00:00Z\n'>>;
type _CanonicalArray = Assert<Equal<Encode<[SomlInteger<'0b111'>, SomlDuration<'250us'>, 1e999], {canonical: true}>, '[\n\t7\n\t0.00025s\n\tinfinity\n]\n'>>;
type _CanonicalScalarDocument = Assert<IsError<Encode<true, {canonical: true}>>>;
type _CanonicalMaximumDepth = Encode<NestedValue<100>, {canonical: true}>;
type _CanonicalDeepRoundTrip = Assert<Equal<Parse<_CanonicalMaximumDepth>, NestedValue<100>>>;
type _CanonicalAboveMaximumDepth = Assert<IsError<Encode<NestedValue<101>, {canonical: true}>>>;
type _CanonicalNestedError = Assert<IsError<Encode<{value: [undefined]}, {canonical: true}>>>;

// Exact decimal ties are checked independently of TypeScript numeric literal inference.
type IsFloatValue<Value> = [Value] extends [never] ? false : Value extends number ? true : false;
type _FloatExactOverflowTie = Assert<ScalarIsError<"179769313486231580793728971405303415079934132710037826936173778980444968292764750946649017977587207096330286416692887910946555547851940402630657488671505820681908902000708383676273854845817711531764475730270069855571366959622842914819860834936475292719074168444365510704342711559699508093042880177904174497792e0">>;
type _FloatBelowOverflowTie = Assert<IsFloatValue<ScalarValue<"179769313486231580793728971405303415079934132710037826936173778980444968292764750946649017977587207096330286416692887910946555547851940402630657488671505820681908902000708383676273854845817711531764475730270069855571366959622842914819860834936475292719074168444365510704342711559699508093042880177904174497791e0">>>;
type _FloatExactUnderflowTie = Assert<ScalarIsError<"24703282292062327208828439643411068618252990130716238221279284125033775363510437593264991818081799618989828234772285886546332835517796989819938739800539093906315035659515570226392290858392449105184435931802849936536152500319370457678249219365623669863658480757001585769269903706311928279558551332927834338409351978015531246597263579574622766465272827220056374006485499977096599470454020828166226237857393450736339007967761930577506740176324673600968951340535537458516661134223766678604162159680461914467291840300530057530849048765391711386591646239524912623653881879636239373280423891018672348497668235089863388587925628302755995657524455507255189313690836254779186948667994968324049705821028513185451396213837722826145437693412532098591327667236328125e-1075">>;
type _FloatAboveUnderflowTie = Assert<IsFloatValue<ScalarValue<"24703282292062327208828439643411068618252990130716238221279284125033775363510437593264991818081799618989828234772285886546332835517796989819938739800539093906315035659515570226392290858392449105184435931802849936536152500319370457678249219365623669863658480757001585769269903706311928279558551332927834338409351978015531246597263579574622766465272827220056374006485499977096599470454020828166226237857393450736339007967761930577506740176324673600968951340535537458516661134223766678604162159680461914467291840300530057530849048765391711386591646239524912623653881879636239373280423891018672348497668235089863388587925628302755995657524455507255189313690836254779186948667994968324049705821028513185451396213837722826145437693412532098591327667236328126e-1075">>>;

// The small ASCII ordering table covers printable keys, tab, LF, and prefixes.
type _AsciiKeyOrder = Assert<Equal<Encode<{'~': true; z: true; a: true; Z: true; A: true; '0': true; ' ': true; '\n': true; '\t': true; '': true}>, "{'': true, \"\\t\": true, \"\\n\": true, ' ': true, 0: true, A: true, Z: true, a: true, z: true, '~': true}">>;
type _AsciiKeyPrefix = Assert<Equal<Encode<{ab: false; a: true}>, '{a: true, ab: false}'>>;
type _LiteralUnicode = Assert<Equal<Parse<"value: '你好 😀 café'">, {value: '你好 😀 café'}>>;
type _LiteralUnicodeKey = Assert<Equal<Parse<"'😀': true">, {'😀': true}>>;
type _UnicodeKeyTextIdentity = Assert<Equal<Parse<"'é': true\n'e\u0301': false">, {'é': true; 'e\u0301': false}>>;
type _LiteralUnicodeEncoding = Assert<Equal<Parse<Encode<{value: "café's 😀\n你好"}>>, {value: "café's 😀\n你好"}>>;
type _LiteralUnicodeCanonical = Assert<Equal<Canonicalize<"value: '你好 😀 café'">, "value: '你好 😀 café'\n">>;
type _UnsupportedUnicodeCanonical = Assert<Equal<Canonicalize<"'😀': true">, SomlError<'Encoding requires ASCII object keys'>>>;
type _UnicodeEscapeUnion = Assert<Equal<Parse<'[true]' | '["\\u{61}"]'>, SomlError<'Unicode escapes are unsupported'>>>;
type _LiteralEscapeSpelling = Assert<Equal<Parse<"['\\u{61}']">, ['\\u{61}']>>;
type _CommentEscapeSpelling = Assert<Equal<Parse<'# \\u{61}\n[]'>, []>>;

// Escaped backslashes in keys stay literal and participate in decoded-key identity.
type _EscapedBackslashKeyIsLiteral = Assert<Equal<Parse<'{"\\\\u{61}": true, a: false}'>, {'\\u{61}': true; a: false}>>;
type _LiteralAndEscapedBackslashKeyDuplicate = Assert<Equal<Parse<"{\"\\\\u{61}\": true, '\\u{61}': false}">, SomlError<'Duplicate object key'>>>;

// A numeric brand does not make a widened number a concrete value.
type _BrandedUnknownNumber = Assert<IsError<Encode<number & {readonly brand: 'measurement'}>>>;

// Primitive brands also hide literal spellings from TypeScript's template interpolation.
type _EncodeBrandedNumberNested = Assert<IsError<Encode<{measurement: number & {readonly brand: 'measurement'}}>>>;
type _EncodeBrandedNumberTuple = Assert<IsError<Encode<readonly [number & {readonly brand: 'measurement'}]>>>;
type _EncodeBrandedNumberCanonical = Assert<IsError<Encode<{measurement: number & {readonly brand: 'measurement'}}, {canonical: true}>>>;
type _EncodeBrandedNumberUnion = Assert<IsError<Encode<3 | (number & {readonly brand: 'measurement'})>>>;
type _EncodeBrandedLiteralNumber = Assert<IsError<Encode<3 & {readonly brand: 'measurement'}>>>;
type _EncodeBrandedSymbolNumber = Assert<IsError<Encode<number & {readonly [key: symbol]: true}>>>;
type _EncodeFiniteNumberUnion = Assert<Equal<Encode<3 | 4>, '3.0' | '4.0'>>;
type _EncodeBrandedUnknownString = Assert<IsError<Encode<string & {readonly brand: 'identifier'}>>>;
type _EncodeBrandedUnknownBigint = Assert<IsError<Encode<bigint & {readonly brand: 'identifier'}>>>;

// Empty scalar source selections must return a diagnostic.
type _EncodeEmptyIntegerSourceRejected = Assert<Equal<Encode<SomlInteger<never>>, SomlError<'Encoding requires a scalar source literal'>>>;

// Boolean brands retain their finite true/false value domain.
type _EncodeBrandedTrue = Assert<Equal<Encode<true & {readonly brand: 'flag'}>, 'true'>>;
type _EncodeBrandedFalse = Assert<Equal<Encode<false & {readonly brand: 'flag'}>, 'false'>>;
type _EncodeBrandedBoolean = Assert<Equal<Encode<boolean & {readonly brand: 'flag'}>, 'true' | 'false'>>;
type _NoInferBrandedBooleanEncoded = Assert<Equal<Encode<NoInfer<boolean & {readonly brand: 'flag'}>>, 'true' | 'false'>>;
type _EncodeBrandedBooleanRoundTrip = Assert<Equal<Parse<Encode<[true & {readonly brand: 'flag'}]>>, [true]>>;

type _EncodeBrandedBooleanObject = Assert<Equal<Encode<{enabled: true & {readonly brand: 'flag'}}>, '{enabled: true}'>>;
type _EncodeBrandedBooleanCanonical = Assert<Equal<Encode<readonly [false & {readonly brand: 'flag'}], {canonical: true}>, '[\n\tfalse\n]\n'>>;
type _EncodeBrandedBooleanCanonicalUnion = Assert<Equal<Encode<{enabled: boolean & {readonly brand: 'flag'}}, {canonical: true}>, 'enabled: true\n' | 'enabled: false\n'>>;
type _EncodeBrandedBooleanInvalidUnion = Assert<IsError<Encode<readonly [(true & {readonly brand: 'flag'}) | undefined]>>>;

// A source pattern can include malformed documents, so it cannot be validated as a literal.
type _ParseUnknownQuotedValue = Assert<IsError<Parse<`a: '${string}'`>>>;
type _ParseUnknownPrefixedValue = Assert<IsError<Parse<`a: 'prefix${string}'`>>>;
type _ParseUnknownQuotedKey = Assert<IsError<Parse<`'${string}': true`>>>;
type _ParseUnknownNumericString = Assert<IsError<Parse<`['${number}']`>>>;
type _ParseUnknownLineComment = Assert<IsError<Parse<`# ${string}\n[]`>>>;
type _ParseUnknownBlockComment = Assert<IsError<Parse<`/* ${string} */ []`>>>;
type _ParseUnknownBlockString = Assert<IsError<Parse<`value: '''\n${string}\n'''`>>>;

type _ParseUnknownEscapedValue = Assert<Equal<Parse<`["${string}"]`>, SomlError<'Parsing requires a string literal'>>>;
type _ParseUnknownEscapedPrefix = Assert<IsError<Parse<`value: "prefix${string}"`>>>;
type _ParseUnknownEscapedKey = Assert<IsError<Parse<`"${string}": true`>>>;
type _ParseUnknownBigintString = Assert<IsError<Parse<`['${bigint}']`>>>;
type _ParseUnknownNumericValue = Assert<IsError<Parse<`[${number}]`>>>;
type _ParseUnknownBigintValue = Assert<IsError<Parse<`[${bigint}]`, {integers: 'bigint'}>>>;
type _ParseUnknownPatternBigints = Assert<IsError<Parse<`value: '${string}'`, {integers: 'bigint'; maxDepth: 1}>>>;
type _ParseUnknownLowercasePattern = Assert<IsError<Parse<`['${Lowercase<string>}']`>>>;
type _ParseUnknownUppercasePattern = Assert<IsError<Parse<`['${Uppercase<string>}']`>>>;
type _ParseUnknownCapitalizedPattern = Assert<IsError<Parse<`['${Capitalize<string>}']`>>>;
type _ParseUnknownUncapitalizedPattern = Assert<IsError<Parse<`['${Uncapitalize<string>}']`>>>;

// Intersecting case constraints still permits unresolved document contents.
type CaseConstrainedDocument = `['${Lowercase<string> & Uppercase<string>}']`;
const validCaseConstrainedDocument: CaseConstrainedDocument = "['123']";
const invalidCaseConstrainedDocument: CaseConstrainedDocument = "[''] [] ['']";
type _ParseCaseConstrainedPatternRejected = Assert<Equal<Parse<CaseConstrainedDocument>, SomlError<'Parsing requires a string literal'>>>;
type _CanonicalizeCaseConstrainedPatternRejected = Assert<Equal<Canonicalize<CaseConstrainedDocument>, SomlError<'Canonicalization requires a string literal'>>>;

type _ParsePatternUnion = Assert<Equal<Parse<'[true]' | `['${string}']`>, SomlError<'Parsing requires a string literal'>>>;
type _ParsePatternUnionBigints = Assert<Equal<Parse<'[1]' | `['${bigint}']`, {integers: 'bigint'}>, SomlError<'Parsing requires a string literal'>>>;
type _ParsePatternAndInvalidUnion = Assert<Equal<Parse<'[' | `['${string}']`>, SomlError<'Expected a closing bracket'> | SomlError<'Parsing requires a string literal'>>>;
type _ParseConcreteInterpolation = Assert<Equal<Parse<`[${'true' | 'false'}]`>, [true] | [false]>>;
type _ParseConcreteNumericInterpolation = Assert<Equal<Parse<`[${1 | 2}]`, {integers: 'bigint'}>, [1n] | [2n]>>;
type _ParseLiteralPatternSpelling = Assert<Equal<Parse<"['${number}']">, ['${number}']>>;
type _ParseConcreteCaseTransform = Assert<Equal<Parse<Lowercase<'[TRUE]'>>, [true]>>;
type _ParseWidenedSourceWithDepth = Assert<Equal<Parse<string, {maxDepth: 1}>, SomlObject | SomlValue[]>>;
type _ParseWidenedBigintSource = Assert<{value: [1n, {nested: -1n}]} extends Parse<string, {integers: 'bigint'; maxDepth: 1}> ? true : false>;

// Each option alternative must apply to a complete document rather than individual tokens.
type UnionEncodingOptions = {canonical: false} | {canonical: true};
type _EncodeOptionUnionObject = Assert<Equal<Encode<{a: true}, UnionEncodingOptions>, '{a: true}' | 'a: true\n'>>;
type _EncodeOptionUnionArray = Assert<Equal<Encode<[true], UnionEncodingOptions>, '[true]' | '[\n\ttrue\n]\n'>>;
type _EncodeOptionUnionNested = Assert<Equal<Encode<{a: [true]; b: false}, UnionEncodingOptions>, '{a: [true], b: false}' | 'a: [\n\ttrue\n]\nb: false\n'>>;

type _EncodeDefaultOptionUnion = Assert<Equal<Encode<{a: true; b: false}, {} | {canonical: true}>, '{a: true, b: false}' | 'a: true\nb: false\n'>>;
type _EncodeOptionUnionEmptyArray = Assert<Equal<Encode<[], UnionEncodingOptions>, '[]' | '[]\n'>>;
type _EncodeOptionUnionEmptyObject = Assert<Equal<Encode<{}, UnionEncodingOptions>, '{}' | '{}\n'>>;
type _EncodeOptionUnionNestedScalars = Assert<Equal<Encode<{values: [SomlInteger<'0xA'>, SomlDuration<'90m'>, SomlInstant<'2024-01-01T01:00:00+01:00'>]}, UnionEncodingOptions>, '{values: [0xA, 90m, 2024-01-01T01:00:00+01:00]}' | 'values: [\n\t10\n\t1h30m\n\t2024-01-01T00:00:00Z\n]\n'>>;
type _EncodeOptionUnionNestedObject = Assert<Equal<Encode<[{a: true; b: [false]}], UnionEncodingOptions>, '[{a: true, b: [false]}]' | '[\n\t{\n\t\ta: true\n\t\tb: [\n\t\t\tfalse\n\t\t]\n\t}\n]\n'>>;
type _EncodeOptionUnionRoundTrip = Assert<Equal<Parse<Encode<{a: [true, {b: 'value'}]; c: 1.5}, UnionEncodingOptions>>, {a: [true, {b: 'value'}]; c: 1.5}>>;
type _EncodeValueAndOptionUnions = Assert<Equal<Encode<{enabled: true} | {enabled: false}, UnionEncodingOptions>, '{enabled: true}' | '{enabled: false}' | 'enabled: true\n' | 'enabled: false\n'>>;
type _EncodeOptionUnionDepthAllowed = Assert<Equal<Encode<[[]], {maxDepth: 2} | {maxDepth: 3}>, '[[]]'>>;
type _EncodeOptionUnionDepthError = Assert<Equal<Encode<[[]], {maxDepth: 1} | {maxDepth: 2}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _EncodeOptionUnionCanonicalDepthError = Assert<Equal<Encode<{values: []}, {canonical: true; maxDepth: 1} | {canonical: false; maxDepth: 2}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _EncodeOptionUnionScalarError = Assert<Equal<Encode<true, UnionEncodingOptions>, SomlError<'A canonical document must be an object or array'>>>;
type _EncodeOptionUnionUnsupported = Assert<Equal<Encode<[undefined], UnionEncodingOptions>, SomlError<'Unsupported value'>>>;

// A parser option alternative also applies to every integer in the same document.
type UnionIntegerOptions = {integers: 'source'} | {integers: 'bigint'};
type _ParseOptionUnionArray = Assert<Equal<Parse<'[1, 2]', UnionIntegerOptions>, [SomlInteger<'1'>, SomlInteger<'2'>] | [1n, 2n]>>;
type _ParseOptionUnionObject = Assert<Equal<Parse<'a: 1\nb: 2', UnionIntegerOptions>, {a: SomlInteger<'1'>; b: SomlInteger<'2'>} | {a: 1n; b: 2n}>>;

type _ParseOptionUnionNestedArray = Assert<Equal<Parse<'[[1], [2]]', UnionIntegerOptions>, [[SomlInteger<'1'>], [SomlInteger<'2'>]] | [[1n], [2n]]>>;
type _ParseOptionUnionNestedObject = Assert<Equal<Parse<'a: [1, {b: 2}]\nc: 3', UnionIntegerOptions>, {a: [SomlInteger<'1'>, {b: SomlInteger<'2'>}]; c: SomlInteger<'3'>} | {a: [1n, {b: 2n}]; c: 3n}>>;
type _ParseOptionUnionDefaultMode = Assert<Equal<Parse<'[1, 2]', {} | {integers: 'bigint'}>, [SomlInteger<'1'>, SomlInteger<'2'>] | [1n, 2n]>>;
type _ParseOptionUnionSameMode = Assert<Equal<Parse<'[1, 2]', {} | {integers: 'source'}>, [SomlInteger<'1'>, SomlInteger<'2'>]>>;
type _ParseSourceAndOptionUnions = Assert<Equal<Parse<'[1, 2]' | '[3, 4]', UnionIntegerOptions>, [SomlInteger<'1'>, SomlInteger<'2'>] | [1n, 2n] | [SomlInteger<'3'>, SomlInteger<'4'>] | [3n, 4n]>>;
type _ParseOptionUnionOtherScalars = Assert<Equal<Parse<'[1, true, 1.5, 1s, 2024-01-01T00:00:00Z, 2]', UnionIntegerOptions>, [SomlInteger<'1'>, true, 1.5, SomlDuration<'1s'>, SomlInstant<'2024-01-01T00:00:00Z'>, SomlInteger<'2'>] | [1n, true, 1.5, SomlDuration<'1s'>, SomlInstant<'2024-01-01T00:00:00Z'>, 2n]>>;
type _ParseOptionUnionDepthAllowed = Assert<Equal<Parse<'[[]]', {maxDepth: 2} | {maxDepth: 3}>, [[]]>>;
type _ParseOptionUnionDepthError = Assert<Equal<Parse<'[[]]', {maxDepth: 1} | {maxDepth: 2}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _ParseOptionUnionIntegerAndDepthError = Assert<Equal<Parse<'[[1]]', {integers: 'source'; maxDepth: 1} | {integers: 'bigint'; maxDepth: 2}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _ParseSourceAndOptionUnionErrors = Assert<Equal<Parse<'[1]' | '[' | '[9223372036854775808]', UnionIntegerOptions>, SomlError<'Expected a closing bracket'> | SomlError<'Invalid scalar'>>>;
type _ParsePatternAndOptionUnionError = Assert<Equal<Parse<'[1]' | `['${string}']`, UnionIntegerOptions>, SomlError<'Parsing requires a string literal'>>>;
type _ParseEncodedValueAndOptionUnions = Assert<Equal<Parse<Encode<[1n, 2n] | [3n, 4n]>, UnionIntegerOptions>, [SomlInteger<'1'>, SomlInteger<'2'>] | [1n, 2n] | [SomlInteger<'3'>, SomlInteger<'4'>] | [3n, 4n]>>;
type _CanonicalizeIntegerOptionUnion = Assert<Equal<Canonicalize<'[0xF, 2]', UnionIntegerOptions>, '[\n\t15\n\t2\n]\n'>>;

// Scalar and diagnostic brands must not be admitted through the plain object model.
type _ErrorIsNotValue = Assert<SomlError<'Invalid scalar'> extends SomlValue ? false : true>;
type _IntegerIsNotObject = Assert<SomlInteger<'1'> extends SomlObject ? false : true>;
type _DurationIsNotObject = Assert<SomlDuration<'1s'> extends SomlObject ? false : true>;
type _InstantIsNotObject = Assert<SomlInstant<'2024-01-01T00:00:00Z'> extends SomlObject ? false : true>;
type _ErrorIsNotUnknownDocument = Assert<SomlError<'Invalid scalar'> extends Parse<string> ? false : true>;
type _IntegerBrandIsNotBigintDocument = Assert<{value: SomlInteger<'1'>} extends Parse<string, {integers: 'bigint'}> ? false : true>;

type _ErrorArrayIsNotValue = Assert<readonly [SomlError<'Invalid scalar'>] extends SomlValue ? false : true>;
type _NestedErrorIsNotObject = Assert<{nested: {error: SomlError<'Invalid scalar'>}} extends SomlObject ? false : true>;
type _ErrorArrayIsNotUnknownDocument = Assert<[SomlError<'Invalid scalar'>] extends Parse<string> ? false : true>;
type _NestedErrorArrayIsNotUnknownDocument = Assert<{nested: [SomlError<'Invalid scalar'>]} extends Parse<string> ? false : true>;
type _ErrorIsNotUnknownBigintDocument = Assert<SomlError<'Invalid scalar'> extends Parse<string, {integers: 'bigint'}> ? false : true>;
type _ErrorArrayIsNotUnknownBigintDocument = Assert<[SomlError<'Invalid scalar'>] extends Parse<string, {integers: 'bigint'}> ? false : true>;
type _NestedErrorIsNotUnknownBigintDocument = Assert<{nested: {error: SomlError<'Invalid scalar'>}} extends Parse<string, {integers: 'bigint'}> ? false : true>;
type _IntegerBrandArrayIsNotBigintDocument = Assert<[SomlInteger<'1'>] extends Parse<string, {integers: 'bigint'}> ? false : true>;
type _NestedIntegerBrandIsNotBigintDocument = Assert<{nested: [SomlInteger<'1'>]} extends Parse<string, {integers: 'bigint'}> ? false : true>;
type _IntegerBrandRemainsValue = Assert<SomlInteger<'1'> extends SomlValue ? true : false>;
type _IntegerBrandRemainsSourceDocument = Assert<{nested: [SomlInteger<'1'>]} extends Parse<string> ? true : false>;
type _TemporalBrandsRemainValues = Assert<SomlDuration<'1s'> | SomlInstant<'2024-01-01T00:00:00Z'> extends SomlValue ? true : false>;
type _TemporalBrandsRemainBigintDocument = Assert<{values: [SomlDuration<'1s'>, SomlInstant<'2024-01-01T00:00:00Z'>]} extends Parse<string, {integers: 'bigint'}> ? true : false>;
type _NativeBigintsRemainValues = Assert<{values: [1n, -1n]} extends SomlValue ? true : false>;
type _NativeBigintsRemainBigintDocument = Assert<{values: [1n, -1n]} extends Parse<string, {integers: 'bigint'}> ? true : false>;
type _ScalarLookingConfigRemainsObject = Assert<{type: 'integer'; source: '1'} extends SomlObject ? true : false>;
type _DiagnosticLookingConfigRemainsObject = Assert<{error: 'SOML parse error'; reason: 'configuration'; position: 0} extends SomlObject ? true : false>;
type _ScalarLookingConfigRemainsBigintDocument = Assert<{type: 'integer'; source: '1'} extends Parse<string, {integers: 'bigint'}> ? true : false>;
type _ObjectValueIndex = Assert<Equal<SomlObject['configuration'], SomlValue>>;
type _ObjectIndexSignatureRemainsSupported = Assert<Record<string, SomlValue> extends SomlObject ? true : false>;
type _ParsedObjectSatisfiesValueModel = Assert<Parse<'value: 1\nnested: [1s, {enabled: true}]'> extends SomlObject ? true : false>;
type _ParsedArraySatisfiesValueModel = Assert<Parse<'[1, 1s, {enabled: true}]'> extends SomlValue[] ? true : false>;
type _ParsedBigintObjectSatisfiesUnknownModel = Assert<Parse<'value: 1\nnested: [1s, {enabled: true}]', {integers: 'bigint'}> extends Parse<string, {integers: 'bigint'}> ? true : false>;

// Encoder unions, unsupported nested values, and canonical scalar boundaries.
type _DeepTupleUnion = Assert<Equal<Encode<[{value: 1 | 2}, true | false]>, '[{value: 1.0}, true]' | '[{value: 1.0}, false]' | '[{value: 2.0}, true]' | '[{value: 2.0}, false]'>>;
type _EmptyObjectUnion = Assert<Equal<Encode<{} | null>, '{}' | 'null'>>;
type _AtomMultipleInvalid = Assert<IsError<Encode<SomlInteger<'1' | 'true'>>>>;
type _CanonicalDurationUnion = Assert<Equal<Encode<[SomlDuration<'90m' | '1500ms'>], {canonical: true}>, '[\n\t1h30m\n]\n' | '[\n\t1.5s\n]\n'>>;
type _CanonicalInstantUnion = Assert<Equal<Encode<[SomlInstant<'2000-01-01T00:00:00Z' | '2001-01-01T00:00:00Z'>], {canonical: true}>, '[\n\t2000-01-01T00:00:00Z\n]\n' | '[\n\t2001-01-01T00:00:00Z\n]\n'>>;
type _ControlKey = Assert<IsError<Encode<{'a\r': true}>>>;
type _FunctionUnion = Assert<IsError<Encode<true | (() => true)>>>;
type _OptionalNever = Assert<IsError<Encode<{value?: never}>>>;
type _NeverProperty = Assert<IsError<Encode<{value: never}>>>;
type _NeverTuple = Assert<IsError<Encode<[never]>>>;
type _NestedAny = Assert<IsError<Encode<{value: any}>>>;
type _NestedUnknown = Assert<IsError<Encode<[unknown]>>>;
type _EmptyLiteral = Assert<Equal<Encode<''>, "''">>;
type _LiteralSlashQuote = Assert<Equal<Encode<'\\"'>, "'\\\"'">>;
type _CanonicalShortestFloat = Assert<Equal<Canonicalize<'[1e-6,1e-7,1e20,1e21,0.0,-0.0]'>, '[\n\t0.000001\n\t1e-7\n\t100000000000000000000.0\n\t1e21\n\t0.0\n\t0.0\n]\n'>>;
type _CanonicalHoursZero = Assert<Equal<Canonicalize<'[0h0m0s0ms0us0ns]'>, '[\n\t0s\n]\n'>>;
type _CanonicalDurationMinimum = Assert<Equal<Canonicalize<'[-9223372036854775808ns]'>, '[\n\t-2562047h47m16.854775808s\n]\n'>>;
type _CanonicalDateLeap = Assert<Equal<Canonicalize<'[2000-03-01T00:00:00+23:59]'>, '[\n\t2000-02-29T00:01:00Z\n]\n'>>;
type _CanonicalDateNonLeap = Assert<Equal<Canonicalize<'[1900-03-01T00:00:00+23:59]'>, '[\n\t1900-02-28T00:01:00Z\n]\n'>>;
type _CanonicalDateYearCarry = Assert<Equal<Canonicalize<'[0099-12-31T23:59:00-23:59]'>, '[\n\t0100-01-01T23:58:00Z\n]\n'>>;
type _CanonicalDateYearBorrow = Assert<Equal<Canonicalize<'[0100-01-01T00:00:00+23:59]'>, '[\n\t0099-12-31T00:01:00Z\n]\n'>>;
type _CanonicalMultiFloatUnion = Assert<Equal<Encode<[1e20 | 1e21, -1e-7 | 1e-6]>, '[100000000000000000000.0, -1e-7]' | '[100000000000000000000.0, 0.000001]' | '[1e21, -1e-7]' | '[1e21, 0.000001]'>>;

// Independent assignability and round-trip checks for the branded value model.
type _ScalarOptions = Assert<SomlInteger<'1'> | SomlDuration<'1s'> | SomlInstant<'2000-01-01T00:00:00Z'> extends SomlValue ? true : false>;
type _ValidModel = Assert<{integers: [SomlInteger<'1'>, 2n]; scalar: true; nested: {time: SomlInstant<'2000-01-01T00:00:00Z'>}} extends Parse<string> ? true : false>;
type _DiagnosticUnionExcluded = Assert<Equal<Extract<SomlError | {error: 'text'}, SomlValue>, {error: 'text'}>>;
type _OptionalDiagnosticExcluded = Assert<{diagnostic?: SomlError} extends SomlObject ? false : true>;
type _WidenedBigintLeaf = Assert<Parse<string, {integers: 'bigint'}> extends infer Model ? Model extends {readonly [key: string]: infer Value} ? SomlInteger<'1'> extends Value ? false : true : true : false>;
type _NestedKnownRoundtrip = Assert<Equal<Parse<Encode<{number: SomlInteger<'123'>; duration: SomlDuration<'1s'>; instant: SomlInstant<'2000-01-01T00:00:00Z'>}>>, {duration: SomlDuration<'1s'>; instant: SomlInstant<'2000-01-01T00:00:00Z'>; number: SomlInteger<'123'>}>>;

class ConfigurationConstructor {
	static readonly value = true;
	readonly value = true;
}

type _ConstructorRejected = Assert<IsError<Encode<typeof ConfigurationConstructor>>>;
type _ConstructSignatureRejected = Assert<IsError<Encode<{new(): unknown; value: true}>>>;
type _AbstractConstructSignatureRejected = Assert<IsError<Encode<(abstract new() => {value: true}) & {value: true}>>>;

type _NestedConstructorObjectRejected = Assert<Equal<Encode<{factory: typeof ConfigurationConstructor}>, SomlError<'Unsupported value'>>>;
type _NestedConstructorTupleRejected = Assert<Equal<Encode<readonly [typeof ConfigurationConstructor]>, SomlError<'Unsupported value'>>>;
type _CanonicalConstructorRejected = Assert<Equal<Encode<{factory: typeof ConfigurationConstructor}, {canonical: true}>, SomlError<'Unsupported value'>>>;
type _ConstructorUnionRejected = Assert<Equal<Encode<typeof ConfigurationConstructor | {value: true}>, SomlError<'Unsupported value'>>>;
type _ConstructorTupleUnionRejected = Assert<Equal<Encode<readonly [{new(): unknown; value: true} | true]>, SomlError<'Unsupported value'>>>;
type _ConstructorArgumentsRejected = Assert<Equal<Encode<{new(value: string, count: number): unknown; value: true}>, SomlError<'Unsupported value'>>>;
type _AbstractConstructorArgumentsRejected = Assert<Equal<Encode<(abstract new(value: string) => {value: true}) & {value: true}>, SomlError<'Unsupported value'>>>;
type _DataClassInstanceEncoded = Assert<Equal<Encode<ConfigurationConstructor>, '{value: true}'>>;
type _DataClassInstanceRoundTrip = Assert<Equal<Parse<Encode<{configuration: ConfigurationConstructor}>>, {configuration: {value: true}}>>;
type _PlainConstructorLookingDataEncoded = Assert<Equal<Encode<{constructor: {value: true}; prototype: {value: false}}>, '{constructor: {value: true}, prototype: {value: false}}'>>;
type _PlainConstructorLookingTupleEncoded = Assert<Equal<Encode<readonly [{value: true}]>, '[{value: true}]'>>;

class ShadowedConfigurationConstructor {
	static readonly apply = true;
	static readonly value = true;
	readonly value = true;
}

// A data property can shadow Function's methods without removing the public construct signature.
type _ShadowedConstructorRejected = Assert<Equal<Encode<typeof ShadowedConfigurationConstructor>, SomlError<'Unsupported value'>>>;
type _WrappedShadowedConstructorRejected = Assert<Equal<Encode<NoInfer<typeof ShadowedConfigurationConstructor>>, SomlError<'Unsupported value'>>>;
type _NestedShadowedConstructorRejected = Assert<Equal<Encode<{factory: typeof ShadowedConfigurationConstructor}>, SomlError<'Unsupported value'>>>;
type _TupleShadowedConstructorRejected = Assert<Equal<Encode<readonly [typeof ShadowedConfigurationConstructor]>, SomlError<'Unsupported value'>>>;
type _CanonicalShadowedConstructorRejected = Assert<Equal<Encode<{factory: typeof ShadowedConfigurationConstructor}, {canonical: true}>, SomlError<'Unsupported value'>>>;
type _ShadowedConstructorAlternativeRejected = Assert<Equal<Encode<typeof ShadowedConfigurationConstructor | {value: true}>, SomlError<'Unsupported value'>>>;
type _PlainShadowedConstructorLookingData = Assert<Equal<Encode<{apply: true; prototype: {value: true}; value: true}>, '{apply: true, prototype: {value: true}, value: true}'>>;

interface ShadowedCallableConfiguration {
	(): true;
	readonly apply: true;
	readonly value: true;
}

const shadowedCallableConfiguration: ShadowedCallableConfiguration = Object.assign(() => true as const, {apply: true, value: true} as const);
type _ShadowedCallableRejected = Assert<Equal<Encode<typeof shadowedCallableConfiguration>, SomlError<'Unsupported value'>>>;
type _WrappedShadowedCallableRejected = Assert<Equal<Encode<NoInfer<ShadowedCallableConfiguration>>, SomlError<'Unsupported value'>>>;
type _NestedShadowedCallableRejected = Assert<Equal<Encode<{callback: ShadowedCallableConfiguration}, {canonical: true}>, SomlError<'Unsupported value'>>>;
type _ShadowedConstructorArgumentsRejected = Assert<Equal<Encode<(abstract new(value: string, count: number) => {value: true}) & {apply: true; value: true}>, SomlError<'Unsupported value'>>>;

// Finite source alternatives remain concrete, while unknown patterns are rejected.
type SourceCasingUnion = Assert<Equal<Parse<Lowercase<'[TRUE]' | '[FALSE]'>>, [true] | [false]>>;
type SourceFiniteBigintUnion = Assert<Equal<Parse<`[${1n | -9223372036854775808n}]`, {integers: 'bigint'}>, [1n] | [-9223372036854775808n]>>;
type SourceFiniteNumberUnion = Assert<Equal<Parse<`[${0.125 | 1e-7}]`>, [0.125] | [1e-7]>>;
type SourceFiniteQuotationUnion = Assert<Equal<Parse<`['${'' | 'safe'}']`>, [''] | ['safe']>>;
type SourceQuotationInvalidUnion = Assert<IsError<Parse<`['${'safe' | "unsafe'"}']`>>>;
type SourceControlInvalidUnion = Assert<Equal<Parse<`['${'safe' | '\u0000'}']`>, SomlError<'Raw control characters are not allowed'>>>;
type SourceNumericPatternSuffix = Assert<IsError<Parse<`[1, '${number}', true]`>>>;
type SourceBigintPatternKey = Assert<IsError<Parse<`'${bigint}': [true]`>>>;
type SourceCasingPatternKey = Assert<IsError<Parse<`'${Lowercase<string>}': []`>>>;
type SourceFiniteDecodedKeyUnion = Assert<Equal<Parse<`"${'a' | '\\t'}": true`>, {a: true} | {'\t': true}>>;
type SourceDecodedDuplicate = Assert<Equal<Parse<'{"a\\tb": true, \'a\tb\': false}'>, SomlError<'Duplicate object key'>>>;
type SourceLexicalLiteral = Assert<Equal<Parse<`['0x10', '1s', '2024-01-01T00:00:00Z', 'infinity']`>, ['0x10', '1s', '2024-01-01T00:00:00Z', 'infinity']>>;
type SourceKeyIsOpaque = Assert<Equal<Parse<'0x10: 1\n1s: 2\n-0: 3\ninfinity: 4'>, {'0x10': SomlInteger<'1'>; '1s': SomlInteger<'2'>; '-0': SomlInteger<'3'>; infinity: SomlInteger<'4'>}>>;
type SourceUnclosedUnion = Assert<Equal<Canonicalize<'[]' | '['>, SomlError<'Expected a closing bracket'>>>;

// Literal constraints and numeric keys preserve concrete encodings.
type _UppercaseIntersection = Assert<Equal<Encode<'PORT' & Uppercase<string>>, "'PORT'">>;
type _LowercaseIntersection = Assert<Equal<Encode<'port' & Lowercase<string>>, "'port'">>;
type _CapitalizedIntersection = Assert<Equal<Encode<'Port' & Capitalize<string>>, "'Port'">>;
type _FiniteTemplateIntersection = Assert<Equal<Encode<'port' & `p${string}`>, "'port'">>;
type _FiniteStringUnionIntersection = Assert<Equal<Encode<('port' | 'piano') & `p${string}`>, "'port'" | "'piano'">>;
type _ConstrainedKey = Assert<Equal<Encode<{[Key in 'PORT' & Uppercase<string>]: true}>, '{PORT: true}'>>;
type _NumericFloatKey = Assert<Equal<Encode<{1.5: true; '-0': false; '0': null}>, '{-0: false, 0: null, \'1.5\': true}'>>;
type _NumericExponentKey = Assert<Equal<Encode<{1e21: true; 1e-7: false}>, "{'1e+21': true, 1e-7: false}">>;
type _NumericNegativeFloatKey = Assert<Equal<Parse<Encode<{[-1.5]: true}>>, {'-1.5': true}>>;
type _ScalarUnionFailure = Assert<IsError<Encode<[SomlInstant<'2000-01-01T00:00:00Z' | 'bad'>]>>>;
type _DurationSourceUnion = Assert<Equal<Canonicalize<'[60s]' | '[1m]'>, '[\n\t1m\n]\n'>>;
type _TemporalSameValueUnion = Assert<Equal<Encode<[SomlInstant<'2000-01-01T00:00:00Z' | '2000-01-01T01:00:00+01:00'>], {canonical: true}>, '[\n\t2000-01-01T00:00:00Z\n]\n'>>;

declare class PrivateConfigurationConstructor {
	private constructor();
	static readonly value: true;
	readonly value: true;
}

declare class ProtectedConfigurationConstructor {
	protected constructor();
	static readonly value: true;
	readonly value: true;
}

type _PrivateConstructorRejected = Assert<IsError<Encode<typeof PrivateConfigurationConstructor>>>;
type _ProtectedConstructorRejected = Assert<IsError<Encode<typeof ProtectedConfigurationConstructor>>>;

type _NestedPrivateConstructorRejected = Assert<Equal<Encode<{configuration: typeof PrivateConfigurationConstructor}>, SomlError<'Unsupported value'>>>;
type _NestedProtectedConstructorRejected = Assert<Equal<Encode<readonly [typeof ProtectedConfigurationConstructor]>, SomlError<'Unsupported value'>>>;
type _CanonicalPrivateConstructorRejected = Assert<Equal<Encode<readonly [typeof PrivateConfigurationConstructor], {canonical: true}>, SomlError<'Unsupported value'>>>;
type _CanonicalProtectedConstructorRejected = Assert<Equal<Encode<{configuration: typeof ProtectedConfigurationConstructor}, {canonical: true}>, SomlError<'Unsupported value'>>>;
type _PrivateConstructorUnionRejected = Assert<Equal<Encode<typeof PrivateConfigurationConstructor | {value: true}>, SomlError<'Unsupported value'>>>;
type _ProtectedConstructorUnionRejected = Assert<Equal<Encode<readonly [typeof ProtectedConfigurationConstructor | false]>, SomlError<'Unsupported value'>>>;
type _PrivateConstructorInstanceEncoded = Assert<Equal<Encode<PrivateConfigurationConstructor>, '{value: true}'>>;
type _ProtectedConstructorInstanceEncoded = Assert<Equal<Encode<ProtectedConfigurationConstructor>, '{value: true}'>>;
type _PrivateConstructorInstanceRoundTrip = Assert<Equal<Parse<Encode<{configuration: PrivateConfigurationConstructor}, {canonical: true}>>, {configuration: {value: true}}>>;
type _ProtectedConstructorInstanceRoundTrip = Assert<Equal<Parse<Encode<readonly [ProtectedConfigurationConstructor], {canonical: true}>>, [{value: true}]>>;

// Required numeric indices still describe a finite tuple after key remapping.
type RequiredNumericTuple = readonly boolean[] & {readonly length: 2; readonly 0: true; readonly 1: false};
const requiredNumericTuple: RequiredNumericTuple = [true, false];
const requiredNumericTupleAsTuple: readonly [true, false] = requiredNumericTuple;
type NumericIndexTuple<Tuple extends readonly unknown[]> = {readonly [Key in keyof Tuple as Key extends `${infer Position extends number}` ? Position : Key]: Tuple[Key]};
const remappedNumericTuple: NumericIndexTuple<readonly [true, false]> = [true, false];
type _RequiredNumericTupleEncoded = Assert<Equal<Encode<RequiredNumericTuple>, '[true, false]'>>;
type _RemappedNumericTupleEncoded = Assert<Equal<Encode<typeof remappedNumericTuple>, '[true, false]'>>;
type _NumericTupleCanonicalEncoded = Assert<Equal<Encode<RequiredNumericTuple, {canonical: true}>, '[\n\ttrue\n\tfalse\n]\n'>>;
type _NumericTupleNestedEncoded = Assert<Equal<Encode<{items: typeof remappedNumericTuple}>, '{items: [true, false]}'>>;
type _NumericTupleRoundTrip = Assert<Equal<Parse<Encode<RequiredNumericTuple>>, [true, false]>>;
type _NumericTupleLengthAlternativesEncoded = Assert<Equal<Encode<NumericIndexTuple<readonly [true]> | NumericIndexTuple<readonly [false, null]>>, '[true]' | '[false, null]'>>;
type _MissingNumericTuplePositionRejected = Assert<Equal<Encode<readonly boolean[] & {length: 2; 0: true}>, SomlError<'Encoding requires a tuple without optional elements'>>>;
type _OptionalNumericTuplePositionRejected = Assert<Equal<Encode<readonly boolean[] & {length: 2; 0: true; 1?: false}>, SomlError<'Encoding requires a tuple without optional elements'>>>;
type _InvalidNumericTupleMemberRejected = Assert<Equal<Encode<readonly unknown[] & {length: 1; 0: undefined}>, SomlError<'Unsupported value'>>>;
type _InvalidNumericTupleUnionRejected = Assert<Equal<Encode<RequiredNumericTuple | (readonly unknown[] & {length: 1; 0: undefined})>, SomlError<'Unsupported value'>>>;

type _TupleArrayIntersectionEncoded = Assert<Equal<Encode<readonly [true, false] & readonly boolean[]>, '[true, false]'>>;
type _TupleLengthIntersectionEncoded = Assert<Equal<Encode<[true, false] & {length: 2}>, '[true, false]'>>;
type _MappedTupleMembersEncoded = Assert<Equal<Encode<{[Key in keyof [true, false]]: [true, false][Key]}>, '[true, false]'>>;

type _ReverseTupleArrayIntersectionEncoded = Assert<Equal<Encode<readonly boolean[] & readonly [true, false]>, '[true, false]'>>;
type _TupleIntersectionNarrowedEncoded = Assert<Equal<Encode<readonly [true] & readonly [boolean]>, '[true]'>>;
type _ReverseTupleIntersectionNarrowedEncoded = Assert<Equal<Encode<readonly [boolean] & readonly [true]>, '[true]'>>;
type _NestedTupleIntersectionEncoded = Assert<Equal<Encode<{values: readonly [true, false] & readonly boolean[]}>, '{values: [true, false]}'>>;
type _CanonicalTupleIntersectionEncoded = Assert<Equal<Encode<readonly [true, false] & readonly boolean[], {canonical: true}>, '[\n\ttrue\n\tfalse\n]\n'>>;
type _CanonicalNestedTupleIntersectionEncoded = Assert<Equal<Encode<readonly [readonly [true, false] & readonly boolean[]], {canonical: true}>, '[\n\t[\n\t\ttrue\n\t\tfalse\n\t]\n]\n'>>;
type _TupleIntersectionRoundTrip = Assert<Equal<Parse<Encode<readonly [true, false] & readonly boolean[]>>, [true, false]>>;
type _TupleIntersectionUnionEncoded = Assert<Equal<Encode<(readonly [true] | readonly [false]) & readonly boolean[]>, '[true]' | '[false]'>>;
type _TupleIntersectionMemberUnionEncoded = Assert<Equal<Encode<readonly [boolean, null] & readonly unknown[]>, '[true, null]' | '[false, null]'>>;
type _TupleIntersectionInvalidMemberRejected = Assert<Equal<Encode<readonly [true, undefined] & readonly unknown[]>, SomlError<'Unsupported value'>>>;
type _TupleIntersectionInvalidUnionRejected = Assert<Equal<Encode<(readonly [true] | readonly [undefined]) & readonly unknown[]>, SomlError<'Unsupported value'>>>;
type _EmptyTupleIntersectionEncoded = Assert<Equal<Encode<readonly [] & readonly boolean[]>, '[]'>>;
type _CanonicalEmptyTupleIntersectionEncoded = Assert<Equal<Encode<readonly [] & readonly boolean[], {canonical: true}>, '[]\n'>>;
type _MappedTupleCanonicalEncoded = Assert<Equal<Encode<{[Key in keyof [true, false]]: [true, false][Key]}, {canonical: true}>, '[\n\ttrue\n\tfalse\n]\n'>>;
type _OptionalTupleIntersectionRejected = Assert<IsError<Encode<readonly [true, false?] & readonly boolean[]>>>;
type _OptionalTupleLengthIntersectionRejected = Assert<IsError<Encode<readonly [true, false?] & {length: 2}>>>;
type _OpenTupleIntersectionRejected = Assert<IsError<Encode<readonly [true, ...false[]] & readonly boolean[]>>>;
type _DeclaredArrayLengthRejected = Assert<IsError<Encode<readonly boolean[] & {length: 2}>>>;
type _DeclaredArrayLengthCanonicalRejected = Assert<IsError<Encode<readonly boolean[] & {length: 2}, {canonical: true}>>>;
type _HomomorphicMappedTupleEncoded = Assert<Equal<Encode<Readonly<Required<[true?, false?]>>>, '[true, false]'>>;
type _BoundedTupleRestAlternativesEncoded = Assert<Equal<Encode<readonly [true, ...([] | [false]), null]>, '[true, null]' | '[true, false, null]'>>;

type _ZeroLengthArrayCanonicalEncoded = Assert<Equal<Encode<readonly boolean[] & {length: 0}, {canonical: true}>, '[]\n'>>;
type _PartialFiniteArrayLengthRejected = Assert<IsError<Encode<readonly boolean[] & {length: 1 | 2; '0': true}>>>;
type _PartialFiniteArrayLengthCanonicalRejected = Assert<IsError<Encode<readonly boolean[] & {length: 1 | 2; '0': true}, {canonical: true}>>>;

type _ZeroLengthArrayCompactEncoded = Assert<Equal<Encode<readonly boolean[] & {length: 0}>, '[]'>>;
type _DifferentLengthTupleIntersectionUnionEncoded = Assert<Equal<Encode<(readonly [true] | readonly [true, false]) & readonly boolean[]>, '[true]' | '[true, false]'>>;
type _DifferentLengthTupleIntersectionUnionCanonicalEncoded = Assert<Equal<Encode<(readonly [true] | readonly [true, false]) & readonly boolean[], {canonical: true}>, '[\n\ttrue\n]\n' | '[\n\ttrue\n\tfalse\n]\n'>>;
type _EmptyOrNonemptyTupleIntersectionUnionEncoded = Assert<Equal<Encode<(readonly [] | readonly [true]) & readonly boolean[], {canonical: true}>, '[]\n' | '[\n\ttrue\n]\n'>>;

type Identity<Value> = {[Key in keyof Value]: Value[Key]};
type ConcreteTuple<Value> = {[Key in keyof Value]-?: Value[Key]};
type _IdentityMappedTupleEncoded = Assert<Equal<Encode<Identity<readonly [true, false]>>, '[true, false]'>>;
type _RequiredMappedTupleEncoded = Assert<Equal<Encode<ConcreteTuple<readonly [true?, false?]>>, '[true, false]'>>;
type _IntersectedObjectMemberEncoded = Assert<Equal<Encode<{a: boolean} & {a: true}>, '{a: true}'>>;
type _ReadonlyPickedObjectEncoded = Assert<Equal<Encode<Readonly<{a: true}> & Pick<{b: false; c: null}, 'b'>>, '{a: true, b: false}'>>;
type _RemappedUppercaseKeysEncoded = Assert<Equal<Encode<{[Key in 'a' | 'b' as Uppercase<Key>]: true}>, '{A: true, B: true}'>>;
type _BoundedTrailingRestEncoded = Assert<Equal<Encode<[true, ...([] | [false])]>, '[true]' | '[true, false]'>>;
type _RequiredIntersectedPropertyEncoded = Assert<Equal<Encode<{a: true} & {b?: false} & Required<{b: false}>>, '{a: true, b: false}'>>;
type _CanonicalNestedIntersectedObjectEncoded = Assert<Equal<Encode<[{a: true} & {b: false}], {canonical: true}>, '[\n\t{\n\t\ta: true\n\t\tb: false\n\t}\n]\n'>>;
type _ObjectTupleAlternativesEncoded = Assert<Equal<Encode<{value: [true] | [false, null]}>, '{value: [true]}' | '{value: [false, null]}'>>;
type _IntersectedObjectRoundTrip = Assert<Equal<Parse<Encode<{a: true} & {b: false}>>, {a: true; b: false}>>;
type _MappedDiscriminatedObjectEncoded = Assert<Equal<Encode<Identity<{type: 'a'; data: true} | {type: 'b'; data: false}>>, "{data: true, type: 'a'}" | "{data: false, type: 'b'}">>;
type _TupleDiscriminatedObjectEncoded = Assert<Equal<Encode<[{type: 'a'; data: true} | {type: 'b'; data: false}]>, "[{data: true, type: 'a'}]" | "[{data: false, type: 'b'}]">>;
type _RequiredPartialObjectEncoded = Assert<Equal<Encode<Required<Partial<{a: true; b: false}>>>, '{a: true, b: false}'>>;
type _RequiredExplicitUndefinedRejected = Assert<IsError<Encode<Required<{a?: true | undefined}>>>>;
type _ReadonlyMappedObjectEncoded = Assert<Equal<Encode<{readonly [Key in 'one' | 'two']: null}>, '{one: null, two: null}'>>;
type _ExtractedObjectAlternativeEncoded = Assert<Equal<Encode<Extract<{a: true} | {a: false; b: null}, {a: false}>>, '{a: false, b: null}'>>;
type _IntersectedObjectCanonicalRoundTrip = Assert<Equal<Canonicalize<Encode<[{a: true} & {b: false}]>>, '[\n\t{\n\t\ta: true\n\t\tb: false\n\t}\n]\n'>>;
type _IdentityMappedTupleAlternativesEncoded = Assert<Equal<Encode<Identity<readonly [true] | readonly [false, null]>>, '[true]' | '[false, null]'>>;
type _BoundedMiddleRestEncoded = Assert<Equal<Encode<readonly [1.5, ...([] | [null]), false]>, '[1.5, false]' | '[1.5, null, false]'>>;
type _PickedRequiredIntersectionEncoded = Assert<Equal<Encode<Pick<{a: true; b?: false}, 'a'> & {b: false}>, '{a: true, b: false}'>>;

type _LowercaseConstrainedSourceParsed = Assert<Equal<Parse<'[true]' & Lowercase<string>>, [true]>>;
type _UppercaseConstrainedSourceParsed = Assert<Equal<Parse<"['PORT']" & Uppercase<string>>, ['PORT']>>;
type _CapitalizedConstrainedKeyParsed = Assert<Equal<Parse<"'Port': true" & Capitalize<string>>, {'Port': true}>>;
type _UncapitalizedConstrainedSourceParsed = Assert<Equal<Parse<"['port']" & Uncapitalize<string>>, ['port']>>;
type _StringTemplateConstrainedSourceParsed = Assert<Equal<Parse<'[true]' & `[${string}]`>, [true]>>;
type _BooleanTemplateConstrainedSourceParsed = Assert<Equal<Parse<'[true]' & `[${boolean}]`>, [true]>>;
type _NumberTemplateConstrainedSourceParsed = Assert<Equal<Parse<'[1]' & `[${number}]`>, [SomlInteger<'1'>]>>;
type _BigintTemplateMinimumParsed = Assert<Equal<Parse<'[-9223372036854775808]' & `[${bigint}]`, {integers: 'bigint'}>, [-9223372036854775808n]>>;
type _LowercaseConstrainedSourceAlternativesParsed = Assert<Equal<Parse<('[]' | '[true]') & Lowercase<string>>, [] | [true]>>;
type _BigintConstrainedSourceAlternativesParsed = Assert<Equal<Parse<('[1]' | '[2]') & `[${bigint}]`, {integers: 'bigint'}>, [1n] | [2n]>>;
type _ConstrainedCanonicalAlternativesConverge = Assert<Equal<Canonicalize<('value: 1' | 'value: 0x1') & `value: ${string}`>, 'value: 1\n'>>;
type _BooleanTemplateAlternativesParsed = Assert<Equal<Parse<`[${true | false}]` & Lowercase<string>>, [true] | [false]>>;
type _NestedBigintTemplatesParsed = Assert<Equal<Parse<`[${`${0n | 1n}`}]`, {integers: 'bigint'}>, [0n] | [1n]>>;
type _ExtractedNumericSourceParsed = Assert<Equal<Parse<Extract<'[1]' | '[true]', `[${number}]`>, {integers: 'bigint'}>, [1n]>>;
type _ExcludedNumericSourceParsed = Assert<Equal<Parse<Exclude<'[1]' | '[true]', `[${number}]`>>, [true]>>;
type _LowercasedFiniteStringsParsed = Assert<Equal<Parse<`['${Lowercase<'TRUE' | 'FALSE'>}']`>, ['true'] | ['false']>>;
type _CapitalizedFiniteStringsParsed = Assert<Equal<Parse<`['${Capitalize<'port' | 'value'>}']`>, ['Port'] | ['Value']>>;
type _UncapitalizedFiniteStringsParsed = Assert<Equal<Parse<`['${Uncapitalize<'PORT' | 'VALUE'>}']`>, ['pORT'] | ['vALUE']>>;
type _MultipleSourceConstraintsParsed = Assert<Equal<Parse<'[true]' & Lowercase<string> & `[${boolean}]`>, [true]>>;
type _MultipleNumericSourceConstraintsParsed = Assert<Equal<Parse<('[1]' | '[2]') & `[${number}]` & `[${bigint}]`, {integers: 'bigint'}>, [1n] | [2n]>>;
type _TemplateCrossProductParsed = Assert<Equal<Parse<`[${1 | 2}, '${'a' | 'b'}']`, {integers: 'bigint'}>, [1n, 'a'] | [1n, 'b'] | [2n, 'a'] | [2n, 'b']>>;
type _TemplateHostileKeyAlternativesParsed = Assert<Equal<Parse<`'${'__proto__' | 'constructor'}': [true]`>, {__proto__: [true]} | {constructor: [true]}>>;
type _InvalidCapitalizedSourceAlternativeRejected = Assert<IsError<Parse<'[true]' | ('[False]' & Capitalize<string>)>>>;
type _InvalidLowercaseSourceAlternativeRejected = Assert<IsError<Parse<'[true]' | ('[falsefalse]' & Lowercase<string>)>>>;
type _LiteralEscapeAlternativesParsed = Assert<Equal<Parse<`['${'\\t' | '\\n'}']`>, ['\\t'] | ['\\n']>>;
type _DecodedEscapeAlternativesParsed = Assert<Equal<Parse<`["${'\\t' | '\\n'}"]`>, ['\t'] | ['\n']>>;

type _NumericTupleIndexNarrowedEncoded = Assert<Equal<Encode<readonly [boolean, null] & {0: true}>, '[true, null]'>>;
type _StringTupleIndexNarrowedEncoded = Assert<Equal<Encode<readonly [boolean, null] & {'0': true}>, '[true, null]'>>;
type _MixedTupleIntersectionEncoded = Assert<Equal<Encode<readonly [true, {a: 'x'}, SomlInteger<'42'>] & readonly unknown[]>, "[true, {a: 'x'}, 42]">>;
type _MixedTupleIntersectionBigintRoundTrip = Assert<Equal<Parse<Encode<readonly [true, {a: 'x'}, SomlInteger<'42'>] & readonly unknown[]>, {integers: 'bigint'}>, [true, {a: 'x'}, 42n]>>;
type _NeverTupleIndexRejected = Assert<Equal<Encode<readonly [true, false] & {0: never}>, SomlError<'Encoding requires a known value type'>>>;
type _MultipleTupleConstraintsCanonicalEncoded = Assert<Equal<Encode<readonly [true, false] & readonly unknown[] & {length: 2}, {canonical: true}>, '[\n\ttrue\n\tfalse\n]\n'>>;

type Scalars = readonly [SomlInteger<'0xA'>, SomlDuration<'90m'>, SomlInstant<'2000-01-01T01:00:00+01:00'>, 'text'];
type ConstrainedScalars = Scalars & readonly SomlValue[];
type _ScalarTupleIntersectionEncoded = Assert<Equal<Encode<ConstrainedScalars>, "[0xA, 90m, 2000-01-01T01:00:00+01:00, 'text']">>;
type _ScalarTupleIntersectionCanonicalEncoded = Assert<Equal<Encode<ConstrainedScalars, {canonical: true}>, "[\n\t10\n\t1h30m\n\t2000-01-01T00:00:00Z\n\t'text'\n]\n">>;
type _ScalarTupleIntersectionBigintRoundTrip = Assert<Equal<Parse<Encode<ConstrainedScalars>, {integers: 'bigint'}>, [10n, SomlDuration<'90m'>, SomlInstant<'2000-01-01T01:00:00+01:00'>, 'text']>>;
type _NestedTupleIntersectionDepthExceeded = Assert<Equal<Encode<readonly [readonly [] & readonly unknown[]] & readonly unknown[], {maxDepth: 1}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _NestedTupleIntersectionDepthAccepted = Assert<Equal<Encode<readonly [readonly [] & readonly unknown[]] & readonly unknown[], {maxDepth: 2}>, '[[]]'>>;
type _NestedTupleIntersectionCanonicalDepthAccepted = Assert<Equal<Encode<readonly [readonly [] & readonly unknown[]] & readonly unknown[], {maxDepth: 2; canonical: true}>, '[\n\t[]\n]\n'>>;
type _TupleIntersectionFormattingAlternativesEncoded = Assert<Equal<Encode<readonly [true, false] & readonly boolean[], {canonical: true} | {canonical: false}>, '[true, false]' | '[\n\ttrue\n\tfalse\n]\n'>>;
type _NeverTupleIntersectionMemberRejected = Assert<Equal<Encode<readonly [true, never] & readonly unknown[]>, SomlError<'Encoding requires a known value type'>>>;
type _AnyTupleIntersectionMemberRejected = Assert<Equal<Encode<readonly [true, any] & readonly unknown[]>, SomlError<'Encoding requires a known value type'>>>;
type _UnknownTupleIntersectionMemberRejected = Assert<Equal<Encode<readonly [true, unknown] & readonly unknown[]>, SomlError<'Unsupported value'>>>;
type _InvalidScalarTupleIntersectionMemberRejected = Assert<Equal<Encode<readonly [true, SomlInteger<'bad'>] & readonly unknown[]>, SomlError<'Invalid scalar source'>>>;
type _InvalidScalarUnionTupleIntersectionMemberRejected = Assert<Equal<Encode<readonly [true, SomlInteger<'bad' | '1'>] & readonly unknown[]>, SomlError<'Invalid scalar source'>>>;
type _FunctionTupleIntersectionMemberRejected = Assert<Equal<Encode<readonly [true, (() => void)] & readonly unknown[]>, SomlError<'Unsupported value'>>>;
type _NestedInvalidTupleIntersectionRejected = Assert<Equal<Encode<readonly [true, {nested: readonly [undefined] & readonly unknown[]}] & readonly unknown[]>, SomlError<'Unsupported value'>>>;
type _BoundedMiddleRestIntersectionEncoded = Assert<Equal<Encode<readonly ['a', ...([true] | [false, null]), 1n] & readonly unknown[]>, "['a', true, 1]" | "['a', false, null, 1]">>;
type _TupleLengthAndFormattingAlternativesEncoded = Assert<Equal<Encode<(readonly [true] | readonly [false, null]) & readonly unknown[], {canonical: true} | {}>, '[true]' | '[false, null]' | '[\n\ttrue\n]\n' | '[\n\tfalse\n\tnull\n]\n'>>;
type _NestedTupleMemberIntersectionEncoded = Assert<Equal<Encode<readonly [readonly [true] & readonly [boolean]] & readonly unknown[]>, '[[true]]'>>;
type _RequiredNamedOptionalTupleIntersectionEncoded = Assert<Equal<Encode<Readonly<Required<[value?: true, enabled?: false]>> & readonly boolean[]>, '[true, false]'>>;
type _ClosedEmptyRestIntersectionEncoded = Assert<Equal<Encode<readonly [true, ...readonly []] & readonly unknown[]>, '[true]'>>;
type _EmptyTupleLengthIntersectionEncoded = Assert<Equal<Encode<readonly [] & {readonly length: 0}>, '[]'>>;
type _NestedEmptyTupleAlternativesEncoded = Assert<Equal<Encode<readonly [(readonly [] | readonly [true, false]) & readonly unknown[]] & readonly unknown[]>, '[[]]' | '[[true, false]]'>>;
type _TupleIntersectionDepthAlternativesRejected = Assert<Equal<Encode<readonly [readonly [true] & readonly boolean[]] & readonly unknown[], {maxDepth: 1} | {maxDepth: 2}>, SomlError<'Maximum nesting depth exceeded'>>>;

// Literal enums and mapped scalar wrappers retain concrete encodings.
enum DeploymentStatus {
	Stopped = 0,
	Started = 2,
}

enum DeploymentName {
	Stopped = 'stopped',
	Started = 'started',
}

// Numeric enum keys identify required properties, even though number is assignable to the enum.
const enumKeyConfiguration = {[DeploymentStatus.Stopped]: true, [DeploymentStatus.Started]: false} as const;
type _ComputedNumericEnumKeysEncoded = Assert<Equal<Encode<typeof enumKeyConfiguration>, '{0: true, 2: false}'>>;
type _NumericEnumRecordEncoded = Assert<Equal<Encode<Record<DeploymentStatus, true>>, '{0: true, 2: true}'>>;
type _NumericEnumKeysCanonicalEncoded = Assert<Equal<Encode<typeof enumKeyConfiguration, {canonical: true}>, '0: true\n2: false\n'>>;
type _NumericIndexSignatureRejected = Assert<Equal<Encode<Record<number, true>>, SomlError<'Encoding does not support index signatures'>>>;
type _NumericEnumKeysNestedEncoded = Assert<Equal<Encode<readonly [typeof enumKeyConfiguration]>, '[{0: true, 2: false}]'>>;
type _NumericEnumKeysWithStringMemberEncoded = Assert<Equal<Encode<typeof enumKeyConfiguration & {tag: 'service'}>, "{0: true, 2: false, tag: 'service'}">>;
type _NumericEnumKeysRoundTrip = Assert<Equal<Parse<Encode<typeof enumKeyConfiguration>>, {'0': true; '2': false}>>;
type _OptionalNumericEnumKeysRejected = Assert<Equal<Encode<Partial<Record<DeploymentStatus, true>>>, SomlError<'Encoding does not support optional properties'>>>;
type _NumericIndexWithNamedMemberRejected = Assert<Equal<Encode<{[key: number]: true; tag: false}>, SomlError<'Encoding does not support index signatures'>>>;

// Enum members can supply concrete parsing options.
enum IntegerRepresentation {
	Source = 'source',
	Bigint = 'bigint',
}
type _NumericEnumDepthOptionRejected = Assert<Equal<Parse<'[[[]]]', {maxDepth: DeploymentStatus.Started}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _StringEnumIntegerOptionParsed = Assert<Equal<Parse<'[0xF]', {integers: IntegerRepresentation.Bigint}>, [15n]>>;

type _NumericEnumMemberEncoded = Assert<Equal<Encode<DeploymentStatus.Stopped>, '0.0'>>;
type _NumericEnumAlternativesEncoded = Assert<Equal<Encode<DeploymentStatus>, '0.0' | '2.0'>>;
type _StringEnumMemberEncoded = Assert<Equal<Encode<DeploymentName.Started>, "'started'">>;
type _StringEnumAlternativesEncoded = Assert<Equal<Encode<DeploymentName>, "'stopped'" | "'started'">>;
type _ReadonlyIntegerCanonicalRootRejected = Assert<Equal<Encode<Readonly<SomlInteger<'0xFF'>>, {canonical: true}>, SomlError<'A canonical document must be an object or array'>>>;
type _ReadonlyIntegerTupleCanonicalEncoded = Assert<Equal<Encode<Readonly<[Readonly<SomlInteger<'0xFF'>>]>, {canonical: true}>, '[\n\t255\n]\n'>>;
type _ReadonlyDurationObjectCanonicalEncoded = Assert<Equal<Encode<Readonly<[{readonly duration: Readonly<SomlDuration<'1.000000001s'>>}]>, {canonical: true}>, '[\n\t{\n\t\tduration: 1.000000001s\n\t}\n]\n'>>;
type _ReadonlyInstantTupleCanonicalEncoded = Assert<Equal<Encode<Readonly<[Readonly<SomlInstant<'0004-02-29T23:59:59.000010000Z'>>]>, {canonical: true}>, '[\n\t0004-02-29T23:59:59.00001Z\n]\n'>>;
type _PickedIntegerEncoded = Assert<Equal<Encode<Pick<SomlInteger<'15'>, keyof SomlInteger<'15'>>>, '15'>>;
type _ReplacedIntegerSourceEncoded = Assert<Equal<Encode<Omit<SomlInteger<'1'>, 'source'> & {readonly source: '0xFF'}>, '0xFF'>>;
type _NestedEnumAlternativesEncoded = Assert<Equal<Encode<[{state: DeploymentStatus; name: DeploymentName.Started}]>, "[{name: 'started', state: 0.0}]" | "[{name: 'started', state: 2.0}]">>;
type _EnumMembersRoundTrip = Assert<Equal<Parse<Encode<[DeploymentStatus.Started, DeploymentName.Stopped]>>, [2, 'stopped']>>;
type _RadixNumberLiteralsEncoded = Assert<Equal<Encode<[0xFF, 0o77, 0b101]>, '[255.0, 63.0, 5.0]'>>;
type _ReadonlyDurationInvalidSourceAlternativeRejected = Assert<IsError<Encode<[Readonly<SomlDuration<'1s' | '0.1ns'>>]>>>;
type _ReadonlyScalarTuplePropertyEncoded = Assert<Equal<Encode<{readonly values: Readonly<[SomlInteger<'1'>, null]>}>, '{values: [1, null]}'>>;

// Standard generic utilities preserve finite configuration values.
declare function configuration<const Name extends string, const Ports extends readonly bigint[]>(name: Name, ports: Ports): {readonly name: Name; readonly ports: Ports};
type FunctionConfiguration = ReturnType<typeof configuration<'api', readonly [80n, 443n]>>;
type _InstantiatedFunctionResultEncoded = Assert<Equal<Encode<FunctionConfiguration>, "{name: 'api', ports: [80, 443]}">>;
type _InstantiatedFunctionResultRoundTrip = Assert<Equal<Parse<Encode<FunctionConfiguration>, {integers: 'bigint'}>, {name: 'api'; ports: [80n, 443n]}>>;

declare function configurationParameters(name: 'api', port: 8080n, enabled: true): void;
type _FunctionParametersEncoded = Assert<Equal<Encode<Parameters<typeof configurationParameters>>, "['api', 8080, true]">>;
type _ConstructorParametersEncoded = Assert<Equal<Encode<ConstructorParameters<new(name: 'api', port: 8080n) => {name: 'api'; port: 8080n}>>, "['api', 8080]">>;

type ConfigurationWithSecret = Parse<"name: 'api'\nport: 8080\nsecret: 'hidden'">;
type _OmittedParsedPropertyEncoded = Assert<Equal<Encode<Omit<ConfigurationWithSecret, 'secret'>>, "{name: 'api', port: 8080}">>;
type _AwaitedConfigurationEncoded = Assert<Equal<Encode<Awaited<Promise<{enabled: true; ports: readonly [80n, 443n]}>>>, '{enabled: true, ports: [80, 443]}'>>;
type _NonNullableConfigurationEncoded = Assert<Equal<Encode<NonNullable<{enabled: true} | null | undefined>>, '{enabled: true}'>>;
type _ExtractedPublicScalar = Assert<Equal<Extract<SomlValue, bigint>, bigint>>;
type _PlainConfigurationModel = Assert<ConfigurationWithSecret extends SomlObject ? true : false>;

type ReturnedTuple<Values extends readonly (() => unknown)[]> = {[Key in keyof Values]: ReturnType<Values[Key]>};
type _ReturnedTupleValuesEncoded = Assert<Equal<Encode<ReturnedTuple<readonly [() => 'api', () => 8080n, () => true]>>, "['api', 8080, true]">>;
type _ReturnedTupleInvalidValueRejected = Assert<Equal<Encode<ReturnedTuple<readonly [() => true, () => undefined]>>, SomlError<'Unsupported value'>>>;

type StringifyKeys<Value> = {[Key in keyof Value as Key extends string | number ? `${Key}` : never]: Value[Key]};
type _RemappedNumericKeysEncoded = Assert<Equal<Encode<StringifyKeys<{10: false; 2: true; 1: null}>>, '{1: null, 10: false, 2: true}'>>;
type _RemappedNumericKeysRoundTrip = Assert<Equal<Parse<Encode<StringifyKeys<{10: false; 2: true; 1: null}>>>, {'1': null; '10': false; '2': true}>>;

type EncodeConstrainedValue<Value extends SomlValue> = Encode<Value>;
type _GenericValueConstraintEncoded = Assert<Equal<EncodeConstrainedValue<{port: SomlInteger<'8080'>; enabled: true}>, '{enabled: true, port: 8080}'>>;
type ParseConstrainedSource<Source extends string> = Parse<Source, {integers: 'bigint'}>;
type _GenericSourceConstraintParsed = Assert<Equal<ParseConstrainedSource<'port: 8080\nenabled: true'>, {port: 8080n; enabled: true}>>;
type _GenericSourceConstraintInvalid = Assert<Equal<ParseConstrainedSource<'port: 01'>, SomlError<'Invalid scalar'>>>;
type _GenericCanonicalRoundTrip = Assert<Equal<Canonicalize<Encode<FunctionConfiguration>>, "name: 'api'\nports: [\n\t80\n\t443\n]\n">>;

// Concrete interfaces and callable boundaries retain their declared value shapes.
interface ConfigurationMetadata {
	readonly kind: 'service';
	readonly enabled: true;
}

interface InterfaceConfiguration extends ConfigurationMetadata {
	readonly ports: readonly [80n, 443n];
}

type _InheritedReadonlyInterfaceEncoded = Assert<Equal<Encode<InterfaceConfiguration>, "{enabled: true, kind: 'service', ports: [80, 443]}">>;
type _ReadonlyInterfaceRoundTrip = Assert<Equal<Parse<Encode<Readonly<InterfaceConfiguration>>, {integers: 'bigint'}>, {enabled: true; kind: 'service'; ports: [80n, 443n]}>>;
type _PickedInterfaceMembersEncoded = Assert<Equal<Encode<Pick<InterfaceConfiguration, 'ports' | 'kind'>>, "{kind: 'service', ports: [80, 443]}">>;

interface CallableData {
	(): true;
	readonly value: true;
}

interface ConstructableData {
	new(): ConfigurationMetadata;
	readonly value: true;
}

type _CallableDataInterfaceRejected = Assert<IsError<Encode<CallableData>>>;
type _ConstructableDataInterfaceRejected = Assert<IsError<Encode<ConstructableData>>>;
type _PickedCallableDataMembersEncoded = Assert<Equal<Encode<Readonly<Pick<CallableData, 'value'>>>, '{value: true}'>>;
type _PickedConstructableDataMembersEncoded = Assert<Equal<Encode<Readonly<Pick<ConstructableData, 'value'>>>, '{value: true}'>>;
type _CallableInterfaceReturnValueEncoded = Assert<Equal<Encode<ReturnType<CallableData>>, 'true'>>;
type _ConstructableInterfaceInstanceEncoded = Assert<Equal<Encode<InstanceType<ConstructableData>>, "{enabled: true, kind: 'service'}">>;
type _FunctionDataIntersectionExcludedFromObject = Assert<((() => void) & {readonly value: true}) extends SomlObject ? false : true>;
type _ConstructSignatureDataExcludedFromValue = Assert<{new(): ConfigurationMetadata; readonly value: true} extends SomlValue ? false : true>;
type _CallableDataInterfaceExcludedFromValue = Assert<CallableData extends SomlValue ? false : true>;
type _ConstructableDataInterfaceExcludedFromValue = Assert<ConstructableData extends SomlValue ? false : true>;
type _FunctionSignatureExcludedFromValue = Assert<(() => void) extends SomlValue ? false : true>;
type _FunctionLookingInterfaceDataEncoded = Assert<Equal<Encode<ConfigurationMetadata & {readonly call: true; readonly apply: false; readonly bind: null}>, '{apply: false, bind: null, call: true, enabled: true, kind: \'service\'}'>>;

// Numeric coercion and key remapping preserve concrete object members.
type _NativeNumericKeysCanonicalEncoded = Assert<Equal<Encode<{1e999: true; [-1e999]: false; 1e-6: true; 1e20: false}, {canonical: true}>, "-Infinity: false\n'0.000001': true\n100000000000000000000: false\nInfinity: true\n">>;
type MergedKeys = {[Key in 'enabled' | 'active' as 'state']: Key extends 'enabled' ? true : false};
type _CollidingRemappedKeysEncoded = Assert<Equal<Encode<MergedKeys>, '{state: true}' | '{state: false}'>>;
// One runtime key must satisfy both numeric and string alias constraints.
type IntersectedKeyAliases = {readonly 1: {kind: true; primary: true} | {kind: false; primary: false}} & {readonly '1': {kind: true; secondary: true} | {kind: false; secondary: false}};
type _IntersectedKeyAliasAlternativesEncoded = Assert<Equal<Encode<IntersectedKeyAliases>, '{1: {kind: true, primary: true, secondary: true}}' | '{1: {kind: false, primary: false, secondary: false}}'>>;
type _NestedCollidingRemappedKeysEncoded = Assert<Equal<Encode<{[Key in keyof MergedKeys as `nested-${Key}`]: {value: MergedKeys[Key]}}>, '{nested-state: {value: true}}' | '{nested-state: {value: false}}'>>;
type _CorrelatedRemappedNumericKeysEncoded = Assert<Equal<Encode<{[Key in 1 | 2 as `key-${Key}`]: {value: Key extends 1 ? true : false}}>, '{key-1: {value: true}, key-2: {value: false}}'>>;
type _RemappedNumericKeyObjectAlternativesEncoded = Assert<Equal<Encode<{[Key in 1 | 2 as `${Key}`]: Key extends 1 ? {first: true} | {second: false} : null}>, '{1: {first: true}, 2: null}' | '{1: {second: false}, 2: null}'>>;

// Quoted keys decode before duplicate detection, while the colon must remain adjacent.
type _RootDecodedTabDuplicate = Assert<Equal<Parse<"\"a\\tb\": true\n'a\tb': false">, SomlError<'Duplicate object key'>>>;
type _RootDecodedBackslashDuplicate = Assert<Equal<Parse<"\"a\\\\b\": true\n'a\\b': false">, SomlError<'Duplicate object key'>>>;
type _QuotedKeyBlockCommentBeforeColon = Assert<Equal<Parse<"\"a\\tb\"/*before*/: true">, SomlError<'Expected a colon directly after an object key'>>>;
type _QuotedKeyLineCommentBeforeColon = Assert<Equal<Parse<"'a\\b'#before\n: true">, SomlError<'Expected a colon directly after an object key'>>>;
type _RootLiteralMultilineKey = Assert<Equal<Parse<"'key\nother': true">, SomlError<'A quoted string cannot contain a line break'>>>;
type _RootLongLiteralBlockKey = Assert<Equal<Parse<"''''\nkey\n'''': true">, SomlError<'A block string cannot be a key'>>>;
type _DecodedKeyValueLineCommentParsed = Assert<Equal<Parse<"\"a\\nb\": #after colon\ntrue">, {"a\nb": true}>>;
type _DecodedKeyValueLineCommentCanonicalized = Assert<Equal<Canonicalize<"\"a\\nb\": #after colon\ntrue">, "\"a\\nb\": true\n">>;
type _QuotedKeysWithQuoteRunsParsed = Assert<Equal<Parse<"\"'''\": true\n'\"\"\"': false">, {"'''": true; "\"\"\"": false}>>;
type _QuotedKeysWithQuoteRunsCanonicalized = Assert<Equal<Canonicalize<"\"'''\": true\n'\"\"\"': false">, "'\"\"\"': false\n\"'''\": true\n">>;
type _RootLiteralAndDecodedNewlineKeysDistinctParsed = Assert<Equal<Parse<"'a\\nb': true\n\"a\\nb\": false">, {"a\\nb": true; "a\nb": false}>>;
type _RootLiteralAndDecodedNewlineKeysDistinctCanonicalized = Assert<Equal<Canonicalize<"'a\\nb': true\n\"a\\nb\": false">, "\"a\\nb\": false\n'a\\nb': true\n">>;

// Numeric and string aliases of one required key must retain its value.
type AliasedNumericKeys = {readonly [Key in 1 | '1']: true};
type _AliasedNumericKeysEncoded = Assert<Equal<Encode<AliasedNumericKeys>, '{1: true}'>>;
type _AliasedNumericKeysCanonicalEncoded = Assert<Equal<Encode<AliasedNumericKeys, {canonical: true}>, '1: true\n'>>;
type _NestedAliasedNumericKeysEncoded = Assert<Equal<Encode<{nested: AliasedNumericKeys}>, '{nested: {1: true}}'>>;
type _AliasedNumericKeysRoundTrip = Assert<Equal<Parse<Encode<AliasedNumericKeys & {other: false}>>, {'1': true; other: false}>>;
type _AliasedZeroKeyEncoded = Assert<Equal<Encode<Record<0 | '0', true>>, '{0: true}'>>;
type _AliasedNegativeKeyEncoded = Assert<Equal<Encode<Record<-1 | '-1', null>>, '{-1: null}'>>;
type _MultipleAliasedNumericKeysEncoded = Assert<Equal<Encode<{[Key in 1 | '1' | 2 | '2']: false}>, '{1: false, 2: false}'>>;
type _AliasedDecimalKeyEncoded = Assert<Equal<Encode<Record<1e-6 | '0.000001', true>>, "{'0.000001': true}">>;
type _AliasedExponentKeyEncoded = Assert<Equal<Encode<Record<1e-7 | '1e-7', true>>, '{1e-7: true}'>>;
type _AliasedMappedKeyWithUniqueMemberEncoded = Assert<Equal<Encode<{readonly [Key in 1 | '1' | 'other']: true}>, '{1: true, other: true}'>>;
type _AliasedKeyValueAlternativesEncoded = Assert<Equal<Encode<Record<1 | '1', boolean>>, '{1: true}' | '{1: false}'>>;
type _AliasedKeyTupleValueEncoded = Assert<Equal<Encode<Record<1 | '1', readonly [true, null]>>, '{1: [true, null]}'>>;
type _AliasedKeyInsideTupleEncoded = Assert<Equal<Encode<readonly [AliasedNumericKeys, false]>, '[{1: true}, false]'>>;
type _AliasedKeyCanonicalNestedEncoded = Assert<Equal<Encode<{nested: AliasedNumericKeys; other: false}, {canonical: true}>, 'nested: {\n\t1: true\n}\nother: false\n'>>;
type _AliasedKeyBigintRoundTrip = Assert<Equal<Parse<Encode<Record<1 | '1', 8080n>>, {integers: 'bigint'}>, {'1': 8080n}>>;
type _AliasedKeyInvalidMemberRejected = Assert<Equal<Encode<Record<1 | '1', undefined> & {other: false}>, SomlError<'Unsupported value'>>>;
type _AliasedKeyUnknownNumberRejected = Assert<Equal<Encode<Record<1 | '1', number> & {other: false}>, SomlError<'Encoding requires a number literal'>>>;
type _AliasedKeyAnyMemberRejected = Assert<Equal<Encode<Record<1 | '1', any> & {other: false}>, SomlError<'Encoding requires a known value type'>>>;
type _AliasedKeyOptionalMemberRejected = Assert<IsError<Encode<Partial<AliasedNumericKeys>>>>;

// Parsing preserves scalar spellings that canonicalization would normalize.
type OriginalScalarSpellingSource = '# original spellings\nitems: [0x000A /* radix */, 1_000, {\n\tduration: 90m\n\tinstant: 2000-01-01T01:00:00.1200+01:00\n}]\n';
type _NestedOriginalScalarSpellingsParsed = Assert<Equal<Parse<OriginalScalarSpellingSource>, {items: [SomlInteger<'0x000A'>, SomlInteger<'1_000'>, {duration: SomlDuration<'90m'>; instant: SomlInstant<'2000-01-01T01:00:00.1200+01:00'>}]}>>;
type _NestedOriginalScalarSpellingsBigintParsed = Assert<Equal<Parse<OriginalScalarSpellingSource, {integers: 'bigint'}>, {items: [10n, 1000n, {duration: SomlDuration<'90m'>; instant: SomlInstant<'2000-01-01T01:00:00.1200+01:00'>}]}>>;
type _EquivalentIntegerSpellingsSourceUnionParsed = Assert<Equal<Parse<'[0xA]' | '[10]'>, [SomlInteger<'0xA'>] | [SomlInteger<'10'>]>>;

// Scalar source alternatives keep their corresponding radix, unit, and date parts.
type _IntegerRadixSourceAlternatives = Assert<Equal<Encode<[SomlInteger<'0xFF' | '0o10' | '-2'>], {canonical: true}>, '[\n\t255\n]\n' | '[\n\t8\n]\n' | '[\n\t-2\n]\n'>>;
type _DurationCoefficientUnitCorrelation = Assert<Equal<Encode<[SomlDuration<'1h' | '2m'>], {canonical: true}>, '[\n\t1h\n]\n' | '[\n\t2m\n]\n'>>;
type _DurationPartAndSignCorrelation = Assert<Equal<Encode<[SomlDuration<'1h2m3.000000001s' | '-4m5.25s'>], {canonical: true}>, '[\n\t1h2m3.000000001s\n]\n' | '[\n\t-4m5.25s\n]\n'>>;
type _InstantDateOffsetCorrelation = Assert<Equal<Encode<[SomlInstant<'2000-01-01T00:00:00+01:00' | '2024-03-01T23:59:00-00:01'>], {canonical: true}>, '[\n\t1999-12-31T23:00:00Z\n]\n' | '[\n\t2024-03-02T00:00:00Z\n]\n'>>;
type _IntegerInvalidAlternative = Assert<Equal<Encode<{value: SomlInteger<'0xFF' | '0xG'>}, {canonical: true}>, SomlError<'Invalid scalar source'>>>;
type _InstantInvalidAlternative = Assert<Equal<Encode<{value: SomlInstant<'2024-02-29T00:00:00Z' | '2023-02-29T00:00:00Z'>}, {canonical: true}>, SomlError<'Invalid scalar source'>>>;
type _DurationInvalidAlternative = Assert<Equal<Encode<{value: SomlDuration<'1h' | '0.1ns'>}, {canonical: true}>, SomlError<'Invalid scalar source'>>>;
type NumericStringOverlap = {readonly 1: boolean} & {readonly '1': true};
type _OverlappingNumericStringKeys = Assert<Equal<Encode<NumericStringOverlap>, '{1: true}'>>;
type _OverlappingNumericStringKeysRoundTrip = Assert<Equal<Parse<Encode<NumericStringOverlap>>, {'1': true}>>;

// Scalar tokens stay contiguous; comment line breaks do not act as separators.
type _MixedUnitMinimumDurationCanonicalized = Assert<Equal<Canonicalize<"{range: [{value: -2562047h47m16s854ms775us808ns}], valid: true}">, "range: [\n\t{\n\t\tvalue: -2562047h47m16.854775808s\n\t}\n]\nvalid: true\n">>;
type _MixedUnitFractionMaximumDurationCanonicalized = Assert<Equal<Canonicalize<"{range: [{value: 2562047h47m16s854ms775.807us}], valid: true}">, "range: [\n\t{\n\t\tvalue: 2562047h47m16.854775807s\n\t}\n]\nvalid: true\n">>;
type _MixedUnitFractionDurationOverflowRejected = Assert<IsError<Parse<"{range: [{value: 2562047h47m16s854ms775.808us}], valid: true}">>>;
type _BlockCommentInsideRadixPrefixRejected = Assert<IsError<Parse<"[0x/*x*/F]">>>;
type _BlockCommentBeforeInstantZoneRejected = Assert<IsError<Parse<"[2024-01-01T00:00:00/*x*/Z]">>>;
type _BlockCommentLineBreakDoesNotSeparateDurations = Assert<IsError<Parse<"[1s/*a\nb*/2s]">>>;
type _MultilineCommentsAroundDurationCommaCanonicalized = Assert<Equal<Canonicalize<"{value: [1s/*a\nb*/,/*c\nd*/2s], after: true}">, "after: true\nvalue: [\n\t1s\n\t2s\n]\n">>;
type _SignedNanosecondAndInstantClosingCommentsCanonicalized = Assert<Equal<Canonicalize<"[{duration: -1ns},/*a\nb*/{instant: 0001-01-01T23:59:59.000000001+23:59}]">, "[\n\t{\n\t\tduration: -0.000000001s\n\t}\n\t{\n\t\tinstant: 0001-01-01T00:00:59.000000001Z\n\t}\n]\n">>;

// Computed enum values need a concrete numeric literal before encoding.
declare function computedCode(): number;
enum ComputedCode {
	Value = computedCode(),
}

enum CalculatedCode {
	Value = 2 ** 5,
	Negative = -3,
}

enum MixedComputedCode {
	Known = 12,
	Unknown = computedCode(),
}

type _ComputedEnumMemberRejected = Assert<IsError<Encode<ComputedCode.Value>>>;
type _ComputedEnumRejected = Assert<IsError<Encode<ComputedCode>>>;
type _MixedComputedEnumRejected = Assert<IsError<Encode<MixedComputedCode>>>;
type _ComputedEnumTupleRejected = Assert<IsError<Encode<[ComputedCode.Value]>>>;
type _ComputedEnumObjectRejected = Assert<IsError<Encode<{value: ComputedCode.Value}>>>;
type _CalculatedEnumEncoded = Assert<Equal<Encode<CalculatedCode>, '32.0' | '-3.0'>>;

// Computed enum keys cannot identify a finite set of required properties.
type _ComputedEnumKeysRejected = Assert<IsError<Encode<{[Key in ComputedCode.Value]: true}>>>;
type _MixedComputedEnumKeysRejected = Assert<IsError<Encode<Record<MixedComputedCode, true>>>>;
type _KnownComputedEnumKeySubsetEncoded = Assert<Equal<Encode<Pick<Record<MixedComputedCode, true>, MixedComputedCode.Known>>, '{12: true}'>>;

// String enum sources retain literal documents and their alternatives.
enum DocumentSource {
	Object = "name: 'api'\nports: [80, 443]\nconfig: {enabled: true}",
	Boolean = '[true]',
	Invalid = '[01]',
}

type _EnumDocumentParsed = Assert<Equal<Parse<DocumentSource.Object, {integers: 'bigint'}>, {name: 'api'; ports: [80n, 443n]; config: {enabled: true}}>>;
type _EnumDocumentCanonicalized = Assert<Equal<Canonicalize<DocumentSource.Object>, "config: {\n\tenabled: true\n}\nname: 'api'\nports: [\n\t80\n\t443\n]\n">>;
type _EnumInvalidDocumentAlternativeRejected = Assert<Equal<Canonicalize<DocumentSource.Boolean | DocumentSource.Invalid>, SomlError<'Invalid scalar'>>>;
type _EnumTemplateDocumentParsed = Assert<Equal<Parse<`{nested: ${DocumentSource.Boolean}}`>, {nested: [true]}>>;

// Inherited required data members remain part of a class instance's configuration.
class RequiredBaseConfiguration {
	readonly enabled = true;
	readonly identity: readonly ['api', 1n] = ['api', 1n];
}

class RequiredDerivedConfiguration extends RequiredBaseConfiguration {
	constructor(readonly limits: {readonly retries: SomlInteger<'3'>; readonly delay: SomlDuration<'90m'>}) {
		super();
	}
}

type _InheritedClassDataEncoded = Assert<Equal<Encode<RequiredDerivedConfiguration>, "{enabled: true, identity: ['api', 1], limits: {delay: 90m, retries: 3}}">>;
type _InheritedClassDataCanonicalEncoded = Assert<Equal<Encode<RequiredDerivedConfiguration, {canonical: true}>, "enabled: true\nidentity: [\n\t'api'\n\t1\n]\nlimits: {\n\tdelay: 1h30m\n\tretries: 3\n}\n">>;
type _InheritedClassDataRoundTrip = Assert<Equal<Parse<Encode<RequiredDerivedConfiguration>, {integers: 'bigint'}>, {enabled: true; identity: ['api', 1n]; limits: {delay: SomlDuration<'90m'>; retries: 3n}}>>;

// Finite template keys preserve their corresponding values and sorted order.
type ServiceConfiguration = {[Name in DeploymentName as `service.${Name}`]: {readonly name: Name; readonly active: Name extends DeploymentName.Started ? true : false}};
type _EnumTemplateKeysEncoded = Assert<Equal<Encode<ServiceConfiguration>, "{'service.started': {active: true, name: 'started'}, 'service.stopped': {active: false, name: 'stopped'}}">>;
type PortConfiguration = {[Key in `port-${80 | 443}-${'tcp' | 'udp'}`]: Key extends `port-80-${string}` ? 80n : 443n};
type _FiniteTemplateKeysCanonicalEncoded = Assert<Equal<Encode<PortConfiguration, {canonical: true}>, 'port-443-tcp: 443\nport-443-udp: 443\nport-80-tcp: 80\nport-80-udp: 80\n'>>;
type _NestedInvalidScalarAlternativesRejected = Assert<Equal<Encode<{value: readonly [{delay: SomlDuration<'1s'>} | {count: SomlInteger<'01'>}] | readonly [{count: SomlInteger<'1'>}]}, {canonical: true}>, SomlError<'Invalid scalar source'>>>;

// Required accessors and merged mapped keys retain their concrete member values.
interface NamedAccessorConfiguration {
	get name(): 'api';
}

interface EnabledAccessorConfiguration {
	get enabled(): true;
	set enabled(value: true);
}

interface AccessorConfiguration extends NamedAccessorConfiguration, EnabledAccessorConfiguration {
	readonly ports: readonly [80n, 443n];
}

type _RequiredAccessorMembersEncoded = Assert<Equal<Encode<AccessorConfiguration>, "{enabled: true, name: 'api', ports: [80, 443]}">>;
type _RequiredAccessorMembersRoundTrip = Assert<Equal<Parse<Encode<AccessorConfiguration>, {integers: 'bigint'}>, {enabled: true; name: 'api'; ports: [80n, 443n]}>>;
type HttpConfiguration = {kind: 'http'; port: 80n};
type HttpsConfiguration = {kind: 'https'; port: 443n};
type CollapsedConfiguration = {[Key in keyof {primary: HttpConfiguration; fallback: HttpsConfiguration} as 'configuration']: {primary: HttpConfiguration; fallback: HttpsConfiguration}[Key]};
type _MergedMappedKeyValuesEncoded = Assert<Equal<Encode<CollapsedConfiguration>, "{configuration: {kind: 'http', port: 80}}" | "{configuration: {kind: 'https', port: 443}}">>;
type NetworkConfiguration<Value> = Value extends {port: bigint} ? Value & {readonly healthy: true} : never;
type RequiredNetworkConfiguration = Extract<NetworkConfiguration<{kind: 'local'; socket: 'api.sock'} | HttpConfiguration | HttpsConfiguration>, {healthy: true}>;
type _ConditionalConfigurationAlternativesEncoded = Assert<Equal<Encode<{network: RequiredNetworkConfiguration}>, "{network: {healthy: true, kind: 'http', port: 80}}" | "{network: {healthy: true, kind: 'https', port: 443}}">>;

// Refining a scalar source excludes invalid alternatives before canonical encoding.
type RefinedInteger = SomlInteger<'bad' | '0xFF'> & {readonly source: '0xFF'};
type RefinedDuration = SomlDuration<'0.1ns' | '90m'> & {readonly source: '90m'};
type RefinedInstant = SomlInstant<'bad' | '2000-01-01T01:00:00+01:00'> & {readonly source: '2000-01-01T01:00:00+01:00'};
type _RefinedScalarSourcesCanonicalEncoded = Assert<Equal<Encode<{values: readonly [RefinedInteger, {duration: RefinedDuration; instant: RefinedInstant}]}, {canonical: true}>, 'values: [\n\t255\n\t{\n\t\tduration: 1h30m\n\t\tinstant: 2000-01-01T00:00:00Z\n\t}\n]\n'>>;

// Diagnostics remain exact after the quoted-string and parser recursion batches reset.
type _QuotedInvalidEscapeAfterBatch = Assert<Equal<Parse<`["${TwoHundredFiftySix}\\q"]`>, SomlError<'Invalid escape'>>>;
type _QuotedUnterminatedStringAfterBatch = Assert<Equal<Parse<`["${TwoHundredFiftySix}\\"]`>, SomlError<'Unterminated string'>>>;
type _QuotedLineBreakAfterBatch = Assert<Equal<Parse<`["${TwoHundredFiftySix}\n"]`>, SomlError<'A quoted string cannot contain a line break'>>>;
type _EscapedBlockInvalidEscapeAfterBatch = Assert<Equal<Parse<`["""\n${TwoHundredFiftySix}\\q\n"""]`>, SomlError<'Invalid escape'>>>;
type _InvalidScalarAfterParserBatch = Assert<Equal<Parse<'[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,01]'>, SomlError<'Invalid scalar'>>>;

// Generic value constraints accept readonly parsed configurations in both integer modes.
type ParsedModelSource = "'__proto__': [0xF, {constructor: 90m}]\n'': true";
type SourceModelConfiguration = Readonly<Parse<ParsedModelSource>>;
type BigintModelConfiguration = Readonly<Parse<ParsedModelSource, {integers: 'bigint'}>>;
type _ReadonlyParsedModelsConstrainedEncoded = Assert<Equal<EncodeConstrainedValue<readonly [SourceModelConfiguration, BigintModelConfiguration]>, "[{'': true, __proto__: [0xF, {constructor: 90m}]}, {'': true, __proto__: [15, {constructor: 90m}]}]">>;
type _NestedSourceIntegerExcludedFromBigintModel = Assert<{readonly configuration: SourceModelConfiguration} extends Parse<string, {integers: 'bigint'}> ? false : true>;

// UTC century transitions and duration carries normalize independently within one document.
type _NonLeapCenturyForwardCarryCanonicalized = Assert<Equal<Canonicalize<"[{time: 0100-02-28T23:59:59.999999999-00:01, carry: 59m59s1000.000_001ms/* units carried */}, true]">, "[\n\t{\n\t\tcarry: 1h0.000000001s\n\t\ttime: 0100-03-01T00:00:59.999999999Z\n\t}\n\ttrue\n]\n">>;
type _LeapCenturyForwardCarryCanonicalized = Assert<Equal<Canonicalize<"[{time: 0400-02-28T23:59:59.999999999-00:01, carry: -59s999ms999us1001ns/* units carried */}, true]">, "[\n\t{\n\t\tcarry: -1m0.000000001s\n\t\ttime: 0400-02-29T00:00:59.999999999Z\n\t}\n\ttrue\n]\n">>;
type _MillionHourCarryCanonicalized = Assert<Equal<Canonicalize<"[{time: 1900-02-28T23:59:00.000000001-23:59, carry: 999999h59m59s999ms1000.001us/* units carried */}, true]">, "[\n\t{\n\t\tcarry: 1000000h0.000000001s\n\t\ttime: 1900-03-01T23:58:00.000000001Z\n\t}\n\ttrue\n]\n">>;
type _NonLeapCenturyBackwardMaximumCarryCanonicalized = Assert<Equal<Canonicalize<"[{time: 0100-03-01T12:00:59.010000000+13:01, carry: 2562047h46m76s854ms775.807us/* units carried */}, true]">, "[\n\t{\n\t\tcarry: 2562047h47m16.854775807s\n\t\ttime: 0100-02-28T22:59:59.01Z\n\t}\n\ttrue\n]\n">>;
type _LeapCenturyBackwardMinimumCarryCanonicalized = Assert<Equal<Canonicalize<"[{time: 0400-03-01T12:00:59.010000001+13:01, carry: -2562047h46m76s854ms775.808us/* units carried */}, true]">, "[\n\t{\n\t\tcarry: -2562047h47m16.854775808s\n\t\ttime: 0400-02-29T22:59:59.010000001Z\n\t}\n\ttrue\n]\n">>;

// Block delimiters, dedenting, and item separators are determined before escape decoding.
type _EscapedTripleQuoteRunIsBlockContent = Assert<Equal<Parse<"[\"\"\"\n\\\"\"\"\n\"\"\"]">, ["\"\"\""]>>;
type _EscapedLongQuoteRunIsBlockContent = Assert<Equal<Parse<"[\"\"\"\"\n\\\"\"\"\"\n\"\"\"\"]">, ["\"\"\"\""]>>;
type _BlockDecodedBlankLinesPreservedAfterDedent = Assert<Equal<Parse<"[\"\"\"\n\t\\n\n\n\ttext\n\n\t\\n\n\t\"\"\"]">, ["\n\n\ntext\n\n\n"]>>;
type _DecodedBlockLineBreakDoesNotSeparateArrayItems = Assert<Equal<Parse<"[\"\"\"\n\\n\n\"\"\" true]">, SomlError<"Expected a comma or line break between array items">>>;
type _DecodedBlockLineBreakDoesNotSeparateObjectMembers = Assert<Equal<Parse<"a: \"\"\"\n\\n\n\"\"\" b: false">, SomlError<"Expected a comma or line break between object members">>>;

// Nested block text and quoted keys retain their values when canonicalized together.
type LiteralNestedBlockDocument = "{\"a\\tb\": ['''\n\tline\n\t# text\n\t''', /* next */ {text: true}]}";
type EscapedNestedBlockDocument = "{\"a\\tb\": [\"\"\"\n\tline\\n# text\n\t\"\"\"\n# next\n{text: true}]}";
type CanonicalNestedBlockDocument = "\"a\\tb\": [\n\t\"line\\n# text\"\n\t{\n\t\ttext: true\n\t}\n]\n";
type _NestedBlockCanonicalOutput = Assert<Equal<Canonicalize<LiteralNestedBlockDocument>, CanonicalNestedBlockDocument>>;
type _EquivalentNestedBlockDocumentsCanonicalizeTogether = Assert<Equal<Canonicalize<LiteralNestedBlockDocument | EscapedNestedBlockDocument>, CanonicalNestedBlockDocument>>;
type _NestedBlockCompactRoundTrip = Assert<Equal<Parse<Encode<Parse<EscapedNestedBlockDocument>>>, {'a\tb': ['line\n# text', {text: true}]}>>;

// Numeric token state survives a recursion reset before normalization.
type SixtyFourZeros = '0000000000000000000000000000000000000000000000000000000000000000';
type TwoHundredFiftySixZeros = `${SixtyFourZeros}${SixtyFourZeros}${SixtyFourZeros}${SixtyFourZeros}`;
type _LongRadixTokenConvertedExactly = Assert<Equal<Parse<`[0x${TwoHundredFiftySixZeros}F]`, {integers: 'bigint'}>, [15n]>>;
type _LongFloatExponentCancellation = Assert<Equal<Parse<`[0.${TwoHundredFiftySixZeros}1e257]`>, [1]>>;
type _LongExactDurationFractionCanonicalized = Assert<Equal<Canonicalize<`[1.${TwoHundredFiftySixZeros}s]`>, '[\n\t1s\n]\n'>>;

// Numeric-looking keys and array-like member names remain ordinary object data.
type NumericLookingKeyConfiguration = Parse<"1: {value: true}\n01: [false]\n-0: null\n0: []">;
type _NumericLookingKeySetPreservedAsStrings = Assert<Equal<keyof NumericLookingKeyConfiguration, '1' | '01' | '-0' | '0'>>;
type _RequiredNumericLookingKeysEncoded = Assert<Equal<Encode<{readonly [Key in keyof NumericLookingKeyConfiguration]-?: NumericLookingKeyConfiguration[Key]}>, '{-0: null, 0: [], 01: [false], 1: {value: true}}'>>;
type ArrayLookingObjectConfiguration = Parse<'0: null\n1: false\nlength: 2\nconstructor: []\npush: true', {integers: 'bigint'}>;
type _ArrayLookingObjectBigintRoundTrip = Assert<Equal<Parse<Encode<ArrayLookingObjectConfiguration>, {integers: 'bigint'}>, ArrayLookingObjectConfiguration>>;
type _ArrayLookingObjectCanonicalEncoded = Assert<Equal<Encode<ArrayLookingObjectConfiguration, {canonical: true}>, '0: null\n1: false\nconstructor: []\nlength: 2\npush: true\n'>>;

// NoInfer preserves concrete configuration values and source literals.
type InferenceBlockedConfiguration = {readonly enabled: true; readonly values: readonly [80n, 'api']; readonly timeout: SomlDuration<'90m'>};
type _NoInferConfigurationEncoded = Assert<Equal<Encode<NoInfer<InferenceBlockedConfiguration>>, "{enabled: true, timeout: 90m, values: [80, 'api']}">>;
type _NoInferSourceParsed = Assert<Equal<Parse<NoInfer<'[true, 0xF]'>, {integers: 'bigint'}>, [true, 15n]>>;

type _NoInferPatternAlternativeRejected = Assert<Equal<Parse<NoInfer<'[]' | `'key${number}': true`>>, SomlError<'Parsing requires a string literal'>>>;
type _NoInferUnsupportedMemberRejected = Assert<Equal<Encode<NoInfer<{value: undefined}>>, SomlError<'Unsupported value'>>>;

// Wrapped scalar source parameters and parser document alternatives preserve their correlations.
type _IntegerWrappedSource = Assert<Equal<Encode<SomlInteger<NoInfer<'1' | '20'>>>, '1' | '20'>>;
type _IntegerWrappedSourceCanonical = Assert<Equal<Encode<{value: SomlInteger<NoInfer<'0x10' | '0xF'>>}, {canonical: true}>, 'value: 16\n' | 'value: 15\n'>>;
type _DurationWrappedSource = Assert<Equal<Encode<SomlDuration<NoInfer<'90m' | '1h2m'>>>, '90m' | '1h2m'>>;
type _DurationWrappedSourceCanonical = Assert<Equal<Encode<{value: SomlDuration<NoInfer<'90m' | '1h2m'>>}, {canonical: true}>, 'value: 1h30m\n' | 'value: 1h2m\n'>>;
type _InstantWrappedSourceCanonical = Assert<Equal<Encode<{value: SomlInstant<NoInfer<'2024-01-01T01:00:00+01:00' | '2024-01-02T01:00:00+01:00'>>}, {canonical: true}>, 'value: 2024-01-01T00:00:00Z\n' | 'value: 2024-01-02T00:00:00Z\n'>>;
type _WrappedParserCorrelation = Assert<Equal<Parse<NoInfer<'{a:true,b:1}' | '{a:false,b:2}'>, {integers: 'bigint'}>, {a: true; b: 1n} | {a: false; b: 2n}>>;
type _WrappedParserKeyValues = Assert<Equal<Parse<NoInfer<'{a:true,b:1}' | '{c:false,d:2}'>, {integers: 'bigint'}>, {a: true; b: 1n} | {c: false; d: 2n}>>;
type _WrappedDecodedKeyDocumentsCorrelated = Assert<Equal<Parse<NoInfer<'"\\t": {value: true}' | '"\\n": {value: false}'>>, {'\t': {value: true}} | {'\n': {value: false}}>>;

// Independent implementation cases cover float boundaries, exact long fractions, and UTC rollover.
type _MinimumNormalFloatCanonicalized = Assert<Equal<Canonicalize<'[2.2250738585072014e-308]'>, '[\n\t2.2250738585072014e-308\n]\n'>>;
type _LargePositionalFloatCanonicalized = Assert<Equal<Canonicalize<'value: 999999999999999900000.0'>, 'value: 999999999999999900000.0\n'>>;
type _LongNanosecondFractionCanonicalized = Assert<Equal<Canonicalize<'value: 0.000_000_001_000_000_000_000s'>, 'value: 0.000000001s\n'>>;
type _GregorianReformInstantCanonicalized = Assert<Equal<Canonicalize<'value: 1582-10-10T00:00:00.000000001+23:59'>, 'value: 1582-10-09T00:01:00.000000001Z\n'>>;
type _EarlyCenturyInstantEncoded = Assert<Equal<Encode<{value: SomlInstant<'0004-03-01T00:00:00.999999999+23:59'>}, {canonical: true}>, 'value: 0004-02-29T00:01:00.999999999Z\n'>>;

// Blank block edges are discarded before escaped LF content is decoded.
type _BlockBlankEdgesAndDecodedLineFeed = Assert<Equal<Parse<"a: \"\"\"\n \t\n\t\té\n \t\n\t\t\\n\n \t\n\t\t\"\"\"">, {a: 'é\n\n\n'}>>;

// A source-only object does not erase a branded scalar alternative.
type _ScalarOrSourceObjectCompactEncoded = Assert<Equal<Encode<SomlDuration<'1500ms'> | {readonly source: '1500ms'}>, '1500ms' | "{source: '1500ms'}">>;
type _ScalarOrSourceObjectCanonicalEncoded = Assert<Equal<Encode<{value: SomlDuration<'1500ms'> | {readonly source: '1500ms'}}, {canonical: true}>, 'value: 1.5s\n' | "value: {\n\tsource: '1500ms'\n}\n">>;
type _ScalarOrSourceObjectRoundTrip = Assert<Equal<Parse<Encode<{value: SomlDuration<'1500ms'> | {readonly source: '1500ms'}}>>, {value: SomlDuration<'1500ms'>} | {value: {source: '1500ms'}}>>;
type _IntegerOrSourceObjectEncoded = Assert<Equal<Encode<readonly [SomlInteger<'0xF'> | {readonly source: '0xF'}]>, '[0xF]' | "[{source: '0xF'}]">>;

// String enum members remain concrete document alternatives.
enum ConfigurationDocument {
	Array = "['true', 0xF]",
	Object = "label: 'true'\ntimeout: 1ns",
}
type _EnumDocumentAlternativesParsed = Assert<Equal<Parse<ConfigurationDocument>, ['true', SomlInteger<'0xF'>] | {label: 'true'; timeout: SomlDuration<'1ns'>}>>;
type _EnumDocumentAlternativesCanonicalized = Assert<Equal<Canonicalize<ConfigurationDocument>, "[\n\t'true'\n\t15\n]\n" | "label: 'true'\ntimeout: 0.000000001s\n">>;

// NoInfer must not hide concrete object and tuple alternatives from encoding.
type _NoInferObjectAlternativesEncoded = Assert<Equal<Encode<NoInfer<{a: true} | {b: false}>>, '{a: true}' | '{b: false}'>>;
type _NoInferTupleAlternativesEncoded = Assert<Equal<Encode<NoInfer<readonly [true] | readonly [false, null]>>, '[true]' | '[false, null]'>>;
type _NoInferObjectMemberCorrelationEncoded = Assert<Equal<Encode<NoInfer<{a: true; b: 1n} | {a: false; b: 2n}>>, '{a: true, b: 1}' | '{a: false, b: 2}'>>;
type _NoInferTupleMemberCorrelationEncoded = Assert<Equal<Encode<NoInfer<readonly [true, 1n] | readonly [false, 2n]>>, '[true, 1]' | '[false, 2]'>>;
type _NoInferFormattingAlternativesEncoded = Assert<Equal<Encode<{a: true}, NoInfer<{canonical: true} | {canonical: false}>>, '{a: true}' | 'a: true\n'>>;
type _NoInferIntegerModeAlternativesParsed = Assert<Equal<Parse<'[1]', NoInfer<{integers: 'source'} | {integers: 'bigint'}>>, [SomlInteger<'1'>] | [1n]>>;

type _NestedNoInferObjectAlternativesEncoded = Assert<Equal<Encode<{value: NoInfer<{a: true} | {b: false}>}>, '{value: {a: true}}' | '{value: {b: false}}'>>;
type _NestedNoInferTupleCorrelationCanonicalEncoded = Assert<Equal<Encode<{values: NoInfer<readonly [true, 1n] | readonly [false, 2n]>}, {canonical: true}>, 'values: [\n\ttrue\n\t1\n]\n' | 'values: [\n\tfalse\n\t2\n]\n'>>;
type _NoInferEmptyTupleAlternativesEncoded = Assert<Equal<Encode<NoInfer<readonly [] | readonly [true]>, {canonical: true}>, '[]\n' | '[\n\ttrue\n]\n'>>;
type _NoInferMixedContainerAndNullEncoded = Assert<Equal<Encode<NoInfer<null | {enabled: true}>>, 'null' | '{enabled: true}'>>;
type _NoInferMixedCanonicalRootRejected = Assert<Equal<Encode<NoInfer<true | {enabled: true}>, {canonical: true}>, SomlError<'A canonical document must be an object or array'>>>;
type _NoInferScalarAlternativesEncoded = Assert<Equal<Encode<NoInfer<'api' | 80n>>, "'api'" | '80'>>;
type _NoInferScalarOrSourceObjectEncoded = Assert<Equal<Encode<NoInfer<SomlDuration<'90m'> | {readonly source: 'configuration'}>>, '90m' | "{source: 'configuration'}">>;
type _NoInferUnknownRejected = Assert<Equal<Encode<NoInfer<unknown>>, SomlError<'Unsupported value'>>>;
type _NoInferAnyRejected = Assert<Equal<Encode<NoInfer<any>>, SomlError<'Encoding requires a known value type'>>>;
type _NoInferNeverRejected = Assert<Equal<Encode<NoInfer<never>>, SomlError<'Encoding requires a known value type'>>>;
type _NoInferOptionalAlternativeRejected = Assert<Equal<Encode<NoInfer<{value: true} | {value?: false}>>, SomlError<'Encoding does not support optional properties'>>>;
type _NoInferOpenTupleAlternativeRejected = Assert<Equal<Encode<NoInfer<readonly [true] | readonly false[]>>, SomlError<'Encoding requires a finite tuple'>>>;
type _NoInferCallableAlternativeRejected = Assert<Equal<Encode<NoInfer<{value: true} | (() => true)>>, SomlError<'Unsupported value'>>>;
type _NoInferPrivateConstructorAlternativeRejected = Assert<Equal<Encode<NoInfer<typeof PrivateConfigurationConstructor | {value: true}>>, SomlError<'Unsupported value'>>>;
type _NoInferInvalidScalarAlternativeRejected = Assert<Equal<Encode<NoInfer<SomlInteger<'1'> | SomlInteger<'01'>>>, SomlError<'Invalid scalar source'>>>;
type _NoInferTupleAlternativeRoundTrip = Assert<Equal<Parse<Encode<NoInfer<readonly [true, 1n] | readonly [false, 2n]>>, {integers: 'bigint'}>, [true, 1n] | [false, 2n]>>;
type _NoInferObjectAlternativeDepthRejected = Assert<Equal<Encode<NoInfer<{value: true} | {value: readonly []}>, {maxDepth: 1}>, SomlError<'Maximum nesting depth exceeded'>>>;
type _NoInferNestedFormattingAlternativesEncoded = Assert<Equal<Encode<{values: readonly [true, {enabled: false}]}, NoInfer<{canonical: true} | {canonical: false}>>, '{values: [true, {enabled: false}]}' | 'values: [\n\ttrue\n\t{\n\t\tenabled: false\n\t}\n]\n'>>;
type _NoInferIntegerModeCorrelationParsed = Assert<Equal<Parse<'[1, {value: 0xF}]', NoInfer<{integers: 'source'} | {integers: 'bigint'}>>, [SomlInteger<'1'>, {value: SomlInteger<'0xF'>}] | [1n, {value: 15n}]>>;
type _NoInferDepthAlternativesParsed = Assert<Equal<Parse<'[[]]', NoInfer<{maxDepth: 1} | {maxDepth: 2}>>, SomlError<'Maximum nesting depth exceeded'>>>;
type _NoInferDepthAlternativesEncoded = Assert<Equal<Encode<readonly [readonly []], NoInfer<{maxDepth: 1} | {maxDepth: 2}>>, SomlError<'Maximum nesting depth exceeded'>>>;

// Each wrapped alternative is inhabited without asserting or changing its type.
const inferenceBlockedFirstObject: NoInfer<{a: true} | {b: false}> = {a: true};
const inferenceBlockedSecondObject: NoInfer<{a: true} | {b: false}> = {b: false};
const inferenceBlockedShortTuple: NoInfer<readonly [true] | readonly [false, null]> = [true];
const inferenceBlockedLongTuple: NoInfer<readonly [true] | readonly [false, null]> = [false, null];

// Inference must retain unsupported void alternatives so a valid branch cannot hide them.
type _VoidValueRejected = Assert<Equal<Encode<void>, SomlError<'Unsupported value'>>>;
type _VoidScalarAlternativeRejected = Assert<Equal<Encode<void | true>, SomlError<'Unsupported value'>>>;
type _VoidObjectAlternativeRejected = Assert<Equal<Encode<void | {enabled: true}>, SomlError<'Unsupported value'>>>;
type _VoidObjectMemberRejected = Assert<Equal<Encode<{value: void | true}>, SomlError<'Unsupported value'>>>;
type _VoidTupleMemberRejected = Assert<Equal<Encode<readonly [void | true]>, SomlError<'Unsupported value'>>>;
type _WrappedVoidAlternativeRejected = Assert<Equal<Encode<NoInfer<void | true>>, SomlError<'Unsupported value'>>>;

// Ordinary unions retain alternatives even when one shape contains another.
type _SubsumedObjectAlternativesEncoded = Assert<Equal<Encode<{value: true} | {value: true; extra: false}>, '{value: true}' | '{extra: false, value: true}'>>;

// Symbol members must not disappear during string-key remapping.
const symbolConfigurationKey = Symbol('metadata');
const symbolKeyedConfiguration = {[symbolConfigurationKey]: true, enabled: false} as const;
type _SymbolKeyedObjectRejected = Assert<Equal<Encode<typeof symbolKeyedConfiguration>, SomlError<'Encoding requires string or numeric object keys'>>>;

// Numeric enum constants can represent NaN, which is not a SOML value.
enum NonfiniteMeasurement {
	Missing = 0 / 0,
	Unbounded = 1 / 0,
	NegativeUnbounded = -1 / 0,
	Zero = 0,
}
const missingMeasurementConfiguration = {value: NonfiniteMeasurement.Missing} as const;
type _NanEnumMemberRejected = Assert<Equal<Encode<NonfiniteMeasurement.Missing>, SomlError<'NaN is not a SOML value'>>>;
type _NanEnumConfigurationRejected = Assert<Equal<Encode<typeof missingMeasurementConfiguration>, SomlError<'NaN is not a SOML value'>>>;
type _NanEnumAlternativeRejected = Assert<Equal<Encode<NonfiniteMeasurement>, SomlError<'NaN is not a SOML value'>>>;
type _InfiniteEnumMemberEncoded = Assert<Equal<Encode<NonfiniteMeasurement.Unbounded>, 'infinity'>>;
type _NegativeInfiniteEnumMemberEncoded = Assert<Equal<Encode<NonfiniteMeasurement.NegativeUnbounded>, '-infinity'>>;
type _FiniteEnumMemberEncoded = Assert<Equal<Encode<NonfiniteMeasurement.Zero>, '0.0'>>;
type _NanEnumTupleRejected = Assert<Equal<Encode<readonly [0, NonfiniteMeasurement.Missing]>, SomlError<'NaN is not a SOML value'>>>;
type _NanEnumCanonicalConfigurationRejected = Assert<Equal<Encode<typeof missingMeasurementConfiguration, {canonical: true}>, SomlError<'NaN is not a SOML value'>>>;
type _NanEnumMemberUnionRejected = Assert<Equal<Encode<NonfiniteMeasurement.Missing | 1>, SomlError<'NaN is not a SOML value'>>>;
type _NanEnumFormattingAlternativesRejected = Assert<Equal<Encode<typeof missingMeasurementConfiguration, {canonical: true} | {canonical: false}>, SomlError<'NaN is not a SOML value'>>>;
type _WrappedNanEnumRejected = Assert<Equal<Encode<NoInfer<NonfiniteMeasurement.Missing>>, SomlError<'NaN is not a SOML value'>>>;
type _NanEnumSourceSpelling = Assert<Equal<`${NonfiniteMeasurement.Missing}`, 'NaN'>>;
type _NanLiteralStringEncoded = Assert<Equal<Encode<'NaN'>, "'NaN'">>;
const nanKeyConfiguration = {[NonfiniteMeasurement.Missing]: true} as const;
type _ComputedNanEnumKeyEncoded = Assert<Equal<Encode<typeof nanKeyConfiguration>, '{NaN: true}'>>;
type _ComputedNanEnumKeyCanonicalEncoded = Assert<Equal<Encode<typeof nanKeyConfiguration, {canonical: true}>, 'NaN: true\n'>>;
type _ComputedNanEnumKeyRoundTrip = Assert<Equal<Parse<Encode<typeof nanKeyConfiguration>>, {NaN: true}>>;

// Native dates preserve their exact calendar components and remain distinct from strings and instants.
type _DateBounds = Assert<Equal<Parse<'[0001-01-01, 9999-12-31]'>, [SomlDate<'0001-01-01'>, SomlDate<'9999-12-31'>]>>;
type _HistoricalDates = Assert<Equal<Parse<'day: 1582-10-10\nsamoa: 2011-12-30'>, {day: SomlDate<'1582-10-10'>; samoa: SomlDate<'2011-12-30'>}>>;
type _DateLeapCentury = Assert<Equal<Parse<'[2000-02-29]'>, [SomlDate<'2000-02-29'>]>>;
type _DateCommonCentury = Assert<IsError<Parse<'[1900-02-29]'>>>;
type _DateImpossibleDay = Assert<IsError<Parse<'[2026-02-30]'>>>;
type _DateYearZero = Assert<IsError<Parse<'[0000-01-01]'>>>;
type _DateShortMonth = Assert<IsError<Parse<'[2026-1-01]'>>>;
type _DateLongYear = Assert<IsError<Parse<'[10000-01-01]'>>>;
type _DateT = Assert<IsError<Parse<'[2026-11-01T]'>>>;
type _DateZ = Assert<IsError<Parse<'[2026-11-01Z]'>>>;
type _DateSuffix = Assert<IsError<Parse<'[2026-11-01foo]'>>>;
type _DateLocalTime = Assert<IsError<Parse<'[2026-11-01T12:00:00]'>>>;
type _DateString = Assert<Equal<Parse<"[2026-11-01, '2026-11-01', 2026-11-01T00:00:00Z]">, [SomlDate<'2026-11-01'>, '2026-11-01', SomlInstant<'2026-11-01T00:00:00Z'>]>>;
type _DateComments = Assert<Equal<Parse<'{day: 1582-10-10# Calendar\nother: [2011-12-30/* Samoa */, 2000-02-29]}'>, {day: SomlDate<'1582-10-10'>; other: [SomlDate<'2011-12-30'>, SomlDate<'2000-02-29'>]}>>;
type _DateMissingSeparator = Assert<IsError<Parse<'[2026-11-01 2026-11-02]'>>>;
type _DateNativeEncoding = Assert<Equal<Encode<SomlDate<'1582-10-10'>>, '1582-10-10'>>;
type _DateObjectEncoding = Assert<Equal<Encode<{day: SomlDate<'1582-10-10'>}>, '{day: 1582-10-10}'>>;
type _DateCanonical = Assert<Equal<Canonicalize<"text: '1582-10-10'\nday: 1582-10-10">, "day: 1582-10-10\ntext: '1582-10-10'\n">>;
type _DateInvalidEncoding = Assert<IsError<Encode<SomlDate<'1900-02-29'>>>>;
type _DateInstantSourceEncoding = Assert<IsError<Encode<SomlDate<'2026-11-01T00:00:00Z'>>>>;
type _InstantDateSourceEncoding = Assert<IsError<Encode<SomlInstant<'2026-11-01'>>>>;
type _DurationDateSourceEncoding = Assert<IsError<Encode<SomlDuration<'2026-11-01'>>>>;
type _DateWidenedEncoding = Assert<Equal<Encode<SomlDate>, SomlError<'Encoding requires a scalar source literal'>>>;
type _DateNeverEncoding = Assert<Equal<Encode<SomlDate<never>>, SomlError<'Encoding requires a scalar source literal'>>>;
type _DateUnionEncoding = Assert<Equal<Encode<[SomlDate<'0001-01-01' | '9999-12-31'>]>, '[0001-01-01]' | '[9999-12-31]'>>;
type _DateCanonicalUnionEncoding = Assert<Equal<Encode<[SomlDate<'2024-02-29' | '2023-02-28'>], {canonical: true}>, '[\n\t2024-02-29\n]\n' | '[\n\t2023-02-28\n]\n'>>;
type _DateInstantUnionEncoding = Assert<Equal<Encode<[SomlDate<'2026-11-01'> | SomlInstant<'2026-11-01T00:00:00Z'>]>, '[2026-11-01]' | '[2026-11-01T00:00:00Z]'>>;
type _DateInvalidAlternative = Assert<IsError<Encode<[SomlDate<'2000-02-29' | '1900-02-29'>]>>>;
type _DateIsValue = Assert<SomlDate<'1582-10-10'> extends SomlValue ? true : false>;
type _DateIsNotObject = Assert<SomlDate<'1582-10-10'> extends SomlObject ? false : true>;
type _DateAlias = Assert<Equal<CalendarDate<'1582-10-10'>, SomlDate<'1582-10-10'>>>;
type _DateBigintModel = Assert<{day: SomlDate<'1582-10-10'>} extends Parse<string, {integers: 'bigint'}> ? true : false>;
type _DateBigintParse = Assert<Equal<Parse<'[1582-10-10]', {integers: 'bigint'}>, [SomlDate<'1582-10-10'>]>>;

type _DateReadonlyEncoding = Assert<Equal<Encode<Readonly<[Readonly<SomlDate<'1582-10-10'>>]>>, '[1582-10-10]'>>;
type _DateWrappedSourceUnion = Assert<Equal<Encode<[SomlDate<NoInfer<'0001-01-01' | '9999-12-31'>>]>, '[0001-01-01]' | '[9999-12-31]'>>;
type _DateWrappedInvalidSource = Assert<IsError<Encode<[SomlDate<NoInfer<'2000-02-29' | '1900-02-29'>>]>>>;
type _DateMonthOverflow = Assert<IsError<Parse<'[2026-13-01]'>>>;
type _DateMonthZero = Assert<IsError<Parse<'[2026-00-01]'>>>;
type _DateDayZero = Assert<IsError<Parse<'[2026-01-00]'>>>;
type _DateMonthLengths = Assert<Equal<Parse<'[2026-01-31, 2026-04-30, 2026-12-31]'>, [SomlDate<'2026-01-31'>, SomlDate<'2026-04-30'>, SomlDate<'2026-12-31'>]>>;
type _DateShortMonthDay31 = Assert<IsError<Parse<'[2026-04-31]'>>>;
type _DateDayTooLarge = Assert<IsError<Parse<'[2026-01-32]'>>>;
type _DateTwoDigitYear = Assert<IsError<Parse<'[26-11-01]'>>>;
type _DateNegativeYear = Assert<IsError<Parse<'[-2026-11-01]'>>>;
type _DatePositiveYear = Assert<IsError<Parse<'[+2026-11-01]'>>>;
type _DateTrailingDigit = Assert<IsError<Parse<'[2026-11-010]'>>>;
type _DateAsciiOnly = Assert<IsError<Parse<'[２０２６-11-01]'>>>;
