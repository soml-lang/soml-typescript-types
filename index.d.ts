// Requires strictNullChecks to distinguish null from other value types.
declare const somlType: unique symbol;

/**
A branded compile-time SOML integer preserving its source spelling.
*/
export type SomlInteger<Source extends string = string> = {readonly [somlType]: 'integer'; readonly source: Source};

/**
A structural compile-time SOML float.
*/
export type SomlFloat = number;

/**
A branded compile-time SOML date preserving its exact proleptic Gregorian YYYY-MM-DD spelling in years 0001 to 9999, without a time or timezone. Dates remain distinct from strings and instants.

@example
```
import type {Encode, SomlDate} from 'soml-typescript-types';

type Source = Encode<{day: SomlDate<'1582-10-10'>}>;
//=> '{day: 1582-10-10}'
```
*/
export type SomlDate<Source extends string = string> = {readonly [somlType]: 'date'; readonly source: Source};

/**
A branded compile-time SOML instant preserving its source spelling.
*/
export type SomlInstant<Source extends string = string> = {readonly [somlType]: 'instant'; readonly source: Source};

/**
A branded compile-time SOML duration preserving its source spelling.
*/
export type SomlDuration<Source extends string = string> = {readonly [somlType]: 'duration'; readonly source: Source};

/**
A value accepted by the type-level SOML encoder.
*/
export type SomlValue = SomlScalar | readonly SomlValue[] | SomlObject;

// Private brands distinguish scalars and diagnostics from plain SOML objects.
/**
An object accepted by the type-level SOML encoder.
*/
export type SomlObject = {readonly [somlType]?: never; readonly [key: string]: SomlValue};

/**
Options for Parse.

Option values must be concrete literals. Widened or ambiguous option types are unsupported to keep this compile-time API simple.
*/
export type ParseOptions = {
	readonly maxDepth?: NestingLimit;

	/**
	`integers: 'bigint'` infers exact bigint literals across the full signed int64 range. The default, `'source'`, preserves spelling as `SomlInteger<Source>`.

	@example
	```
	import type {Parse} from 'soml-typescript-types';

	type Configuration = Parse<`name: 'api-gateway'
	port: 8080
	healthy: true`, {integers: 'bigint'}>;
	//=> {name: 'api-gateway'; port: 8080n; healthy: true}
	```
	*/
	readonly integers?: 'source' | 'bigint';
};
/**
Options for Encode.

Option values must be concrete literals. Widened or ambiguous option types are unsupported to keep this compile-time API simple.
*/
export type EncodeOptions = {readonly maxDepth?: NestingLimit; readonly canonical?: boolean};

/**
A branded compile-time diagnostic. The position is reserved and always 0; source offsets are not tracked.
*/
export type SomlError<Reason extends string = string, Position extends number = 0> = {readonly [somlType]: 'error'; readonly error: 'SOML parse error'; readonly reason: Reason; readonly position: Position};

type SomlScalar = string | SomlInteger | bigint | number | boolean | null | SomlDate | SomlInstant | SomlDuration;

// Constrained inference exposes NoInfer unions without rebuilding their members.
// Structurally subsumed NoInfer alternatives may still collapse during TypeScript inference.
type Inferred<Value> = Value extends infer Concrete & ({} | null | undefined | void) ? Concrete : never;

type NestingLimit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100;

type MaximumDepth<Options> = Options extends {readonly maxDepth: infer Depth extends NestingLimit} ? Depth : 100;

type BareCharacter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '_' | '-';

type DecimalDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type HexDigit = DecimalDigit | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

type BinaryDigit = '0' | '1';

type OctalDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';

type ForbiddenControl = '\u0000' | '\u0001' | '\u0002' | '\u0003' | '\u0004' | '\u0005' | '\u0006' | '\u0007' | '\u0008' | '\u000B' | '\u000C' | '\u000D' | '\u000E' | '\u000F' | '\u0010' | '\u0011' | '\u0012' | '\u0013' | '\u0014' | '\u0015' | '\u0016' | '\u0017' | '\u0018' | '\u0019' | '\u001A' | '\u001B' | '\u001C' | '\u001D' | '\u001E' | '\u001F' | '\u007F';

type AsciiOrder = '\t\n !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

type AllAscii<Source extends string, Count extends unknown[] = []> = Count['length'] extends 256
	? AllAscii<Source> & {}
	: Source extends `${infer Character}${infer Rest}`
		? AsciiOrder extends `${string}${Character}${string}` ? AllAscii<Rest, [...Count, 0]> : false
		: Source extends '' ? true : false;

type CompareCharacters<Left extends string, Right extends string> = Left extends Right
	? 'equal'
	: AsciiOrder extends `${string}${Left}${string}${Right}${string}` ? 'less' : 'greater';

type CompareStrings<Left extends string, Right extends string> = Left extends `${infer Character}${infer Rest}`
	? Right extends `${infer RightCharacter}${infer RightRest}`
		? CompareCharacters<Character, RightCharacter> extends infer Comparison ? Comparison extends 'equal' ? CompareStrings<Rest, RightRest> : Comparison : never
		: 'greater'
	: Right extends '' ? 'equal' : 'less';

// Resetting tail recursion in batches lets source size follow the compiler's resources rather than a fixed character cap.
type ValidateCharacters<Source extends string, Count extends unknown[] = []> = Count['length'] extends 256
	? ValidateCharacters<Source> & {}
	: Source extends `${infer Character}${infer Rest}`
		? Character extends ForbiddenControl ? SomlError<'Raw control characters are not allowed'> : ValidateCharacters<Rest, [...Count, 0]>
		: Source extends '' ? true : SomlError<'Validation requires a string literal'>;

type ValidateSource<Source extends string> = Source extends `\uFEFF${string}`
	? SomlError<'A document cannot start with a BOM'>
	: ValidateCharacters<Source>;

type ValidDigits<Source extends string, Digit extends string> = Source extends `${Digit}${infer Rest}`
	? Rest extends ''
		? true
		: Rest extends `_${infer AfterSeparator}`
			? ValidDigits<AfterSeparator, Digit>
			: ValidDigits<Rest, Digit>
	: false;

type ValidDecimalInteger<Source extends string> = Source extends '0'
	? true
	: Source extends `${Exclude<DecimalDigit, '0'>}${string}`
		? ValidDigits<Source, DecimalDigit>
		: false;

type WithoutSeparators<Source extends string> = Source extends `${infer Before}_${infer After}`
	? WithoutSeparators<`${Before}${After}`>
	: Source;

type WithoutLeadingZeros<Source extends string> = Source extends `0${infer Rest}`
	? WithoutLeadingZeros<Rest>
	: Source;

type CompareDigitLengths<Source extends string, Maximum extends string> = Source extends `${infer _Character}${infer Rest}`
	? Maximum extends `${infer _MaximumCharacter}${infer MaximumRest}`
		? CompareDigitLengths<Rest, MaximumRest>
		: 'greater'
	: Maximum extends '' ? 'equal' : 'less';

type MagnitudeAtMost<Source extends string, Maximum extends string> = CompareDigitLengths<Source, Maximum> extends infer Comparison
	? Comparison extends 'less'
		? true
		: Comparison extends 'equal' ? CompareStrings<Lowercase<Source>, Lowercase<Maximum>> extends 'greater' ? false : true : false
	: false;

type RadixInteger<Source extends string, Digit extends string, Maximum extends string> = ValidDigits<Source, Digit> extends true
	? MagnitudeAtMost<WithoutLeadingZeros<WithoutSeparators<Source>>, Maximum>
	: false;

type IsIntegerToken<Source extends string> = Source extends `-${infer Magnitude}`
	? Magnitude extends '0'
		? false
		: ValidDecimalInteger<Magnitude> extends true
			? MagnitudeAtMost<WithoutSeparators<Magnitude>, '9223372036854775808'>
			: false
	: Source extends `0x${infer Digits}`
		? RadixInteger<Digits, HexDigit, '7FFFFFFFFFFFFFFF'>
		: Source extends `0o${infer Digits}`
			? RadixInteger<Digits, OctalDigit, '777777777777777777777'>
			: Source extends `0b${infer Digits}`
				? RadixInteger<Digits, BinaryDigit, '111111111111111111111111111111111111111111111111111111111111111'>
				: ValidDecimalInteger<Source> extends true
					? MagnitudeAtMost<WithoutSeparators<Source>, '9223372036854775807'>
					: false;

type ValidExponent<Source extends string> = Source extends `-${infer Magnitude}`
	? Magnitude extends '0' ? false : ValidDecimalInteger<Magnitude>
	: ValidDecimalInteger<Source>;

type ValidFractionalNumber<Source extends string> = Source extends `${infer Integer}.${infer Fraction}`
	? ValidDecimalInteger<Integer> extends true ? ValidDigits<Fraction, DecimalDigit> : false
	: false;

type ValidDecimalFloat<Source extends string> = Source extends `${infer Mantissa}e${infer Exponent}`
	? ValidExponent<Exponent> extends true
		? Mantissa extends `${string}.${string}` ? ValidFractionalNumber<Mantissa> : ValidDecimalInteger<Mantissa>
		: false
	: ValidFractionalNumber<Source>;

type IsFloatToken<Source extends string> = Source extends `-${infer Magnitude}`
	? ValidDecimalFloat<Magnitude>
	: ValidDecimalFloat<Source>;

type Numeric<Source extends string, Options extends ParseOptions = {}> = IsIntegerToken<Source> extends true
	? Options extends {readonly integers: 'bigint'} ? IntegerCanonical<Source> extends `${infer Value extends bigint}` ? Value : SomlError<'Invalid integer'> : SomlInteger<Source>
	: IsFloatToken<Source> extends true
		? FloatValue<Source>
		: SomlError<'Invalid scalar', 0>;

type DurationUnits = ['h', 'm', 's', 'ms', 'us', 'ns'];
type DurationUnit = DurationUnits[number];

type ReadDurationUnit<Source extends string> = Source extends `ms${infer Rest}`
	? ['ms', Rest]
	: Source extends `us${infer Rest}`
		? ['us', Rest]
		: Source extends `ns${infer Rest}`
			? ['ns', Rest]
			: Source extends `${infer Unit}${infer Rest}`
				? Unit extends 'h' | 'm' | 's' ? [Unit, Rest] : false
				: false;

type RemainingDurationUnits<Unit extends DurationUnit, Units extends DurationUnit[]> = Units extends [infer First extends DurationUnit, ...infer Rest extends DurationUnit[]]
	? Unit extends First ? Rest : RemainingDurationUnits<Unit, Rest>
	: never;

type ValidDurationParts<Source extends string, Units extends DurationUnit[] = DurationUnits> = ReadToken<Source, DecimalDigit | '_' | '.'> extends [infer NumberText extends string, infer AfterNumber extends string]
	? ReadDurationUnit<AfterNumber> extends [infer Unit extends DurationUnit, infer Rest extends string]
		? RemainingDurationUnits<Unit, Units> extends infer Remaining extends DurationUnit[]
			? [Remaining] extends [never]
				? false
				: NumberText extends `${string}.${string}`
					? Rest extends '' ? ValidFractionalNumber<NumberText> : false
					: ValidDecimalInteger<NumberText> extends true
						? Rest extends '' ? true : ValidDurationParts<Rest, Remaining>
						: false
			: false
		: false
	: false;

type DecimalAdditionTable = [
	['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
	['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
	['2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
	['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
	['4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
	['5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
	['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
	['7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
	['8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
	['9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
];

type DecimalMultiplicationTable = [
	['00', '00', '00', '00', '00', '00', '00', '00', '00', '00'],
	['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
	['00', '02', '04', '06', '08', '10', '12', '14', '16', '18'],
	['00', '03', '06', '09', '12', '15', '18', '21', '24', '27'],
	['00', '04', '08', '12', '16', '20', '24', '28', '32', '36'],
	['00', '05', '10', '15', '20', '25', '30', '35', '40', '45'],
	['00', '06', '12', '18', '24', '30', '36', '42', '48', '54'],
	['00', '07', '14', '21', '28', '35', '42', '49', '56', '63'],
	['00', '08', '16', '24', '32', '40', '48', '56', '64', '72'],
	['00', '09', '18', '27', '36', '45', '54', '63', '72', '81'],
];

type DecimalDivisionSixTable = [
	[['0', '0'], ['0', '1'], ['0', '2'], ['0', '3'], ['0', '4'], ['0', '5'], ['1', '0'], ['1', '1'], ['1', '2'], ['1', '3']],
	[['1', '4'], ['1', '5'], ['2', '0'], ['2', '1'], ['2', '2'], ['2', '3'], ['2', '4'], ['2', '5'], ['3', '0'], ['3', '1']],
	[['3', '2'], ['3', '3'], ['3', '4'], ['3', '5'], ['4', '0'], ['4', '1'], ['4', '2'], ['4', '3'], ['4', '4'], ['4', '5']],
	[['5', '0'], ['5', '1'], ['5', '2'], ['5', '3'], ['5', '4'], ['5', '5'], ['6', '0'], ['6', '1'], ['6', '2'], ['6', '3']],
	[['6', '4'], ['6', '5'], ['7', '0'], ['7', '1'], ['7', '2'], ['7', '3'], ['7', '4'], ['7', '5'], ['8', '0'], ['8', '1']],
	[['8', '2'], ['8', '3'], ['8', '4'], ['8', '5'], ['9', '0'], ['9', '1'], ['9', '2'], ['9', '3'], ['9', '4'], ['9', '5']],
];

type DecimalNormalize<Source extends string> = WithoutLeadingZeros<Source> extends infer Result extends string
	? Result extends '' ? '0' : Result
	: never;

type DecimalReverse<Source extends string, Result extends string = ''> = Source extends `${infer Character}${infer Rest}`
	? DecimalReverse<Rest, `${Character}${Result}`>
	: Result;

type DecimalSumDigits<First extends DecimalDigit, Second extends DecimalDigit, Carry extends '0' | '1'> = DecimalAdditionTable[First][Second] extends `${infer Tens}${infer Units}`
	? Units extends ''
		? DecimalAdditionTable[Tens & DecimalDigit][Carry] extends `${infer AddedTens}${infer AddedUnits}`
			? AddedUnits extends '' ? [AddedTens & DecimalDigit, '0'] : [AddedUnits & DecimalDigit, '1']
			: never
		: [DecimalAdditionTable[Units & DecimalDigit][Carry] & DecimalDigit, '1']
	: never;

type DecimalAddReversed<First extends string, Second extends string, Carry extends '0' | '1' = '0', Result extends string = ''> = First extends `${infer FirstDigit extends DecimalDigit}${infer FirstRest}`
	? Second extends `${infer SecondDigit extends DecimalDigit}${infer SecondRest}`
		? DecimalSumDigits<FirstDigit, SecondDigit, Carry> extends [infer Digit extends DecimalDigit, infer NextCarry extends '0' | '1'] ? DecimalAddReversed<FirstRest, SecondRest, NextCarry, `${Digit}${Result}`> : never
		: DecimalSumDigits<FirstDigit, '0', Carry> extends [infer Digit extends DecimalDigit, infer NextCarry extends '0' | '1'] ? DecimalAddReversed<FirstRest, '', NextCarry, `${Digit}${Result}`> : never
	: Second extends ''
		? DecimalNormalize<Carry extends '1' ? `1${Result}` : Result>
		: DecimalAddReversed<Second, '', Carry, Result>;

type DecimalAdd<First extends string, Second extends string> = DecimalAddReversed<DecimalReverse<First>, DecimalReverse<Second>>;

type DecimalProductDigit<Digit extends DecimalDigit, Factor extends DecimalDigit, Carry extends DecimalDigit> = DecimalMultiplicationTable[Digit][Factor] extends `${infer Tens extends DecimalDigit}${infer Units extends DecimalDigit}`
	? DecimalSumDigits<Units, Carry, '0'> extends [infer ProductDigit extends DecimalDigit, infer AddedCarry extends '0' | '1']
		? [ProductDigit, DecimalAdditionTable[Tens][AddedCarry] & DecimalDigit]
		: never
	: never;

type DecimalMultiplyReversed<Source extends string, Factor extends DecimalDigit, Carry extends DecimalDigit = '0', Result extends string = ''> = Source extends `${infer Digit extends DecimalDigit}${infer Rest}`
	? DecimalProductDigit<Digit, Factor, Carry> extends [infer ProductDigit extends DecimalDigit, infer NextCarry extends DecimalDigit]
		? DecimalMultiplyReversed<Rest, Factor, NextCarry, `${ProductDigit}${Result}`>
		: never
	: DecimalNormalize<Carry extends '0' ? Result : `${Carry}${Result}`>;

type DecimalMultiplyDigit<Source extends string, Factor extends DecimalDigit> = DecimalMultiplyReversed<DecimalReverse<Source>, Factor>;

type DurationScale = {
	h: '00000000000';
	m: '0000000000';
	s: '000000000';
	ms: '000000';
	us: '000';
	ns: '';
};

type DurationMultiplyCoefficient<Source extends string, Unit extends DurationUnit> = Unit extends 'h'
	? DecimalMultiplyDigit<DecimalMultiplyDigit<Source, '6'>, '6'>
	: Unit extends 'm' ? DecimalMultiplyDigit<Source, '6'> : Source;

type DecimalRemoveFractionScale<ReversedProduct extends string, Fraction extends string> = Fraction extends `${infer _Digit}${infer Rest}`
	? ReversedProduct extends `0${infer ProductRest}` ? DecimalRemoveFractionScale<ProductRest, Rest> : SomlError<'Duration is not a whole number of nanoseconds'>
	: DecimalNormalize<DecimalReverse<ReversedProduct>>;

type DurationPartNanoseconds<Source extends string, Unit extends DurationUnit> = WithoutSeparators<Source> extends infer NumberText extends string
	? NumberText extends `${infer Whole}.${infer Fraction}`
		? DurationMultiplyCoefficient<DecimalNormalize<`${Whole}${Fraction}`>, Unit> extends infer Coefficient extends string
			? Coefficient extends '0'
				? '0'
				: DecimalRemoveFractionScale<DecimalReverse<`${Coefficient}${DurationScale[Unit]}`>, Fraction>
			: never
		: DecimalNormalize<`${DurationMultiplyCoefficient<NumberText, Unit>}${DurationScale[Unit]}`>
	: never;

type DurationSum<Source extends string, Sum extends string = '0'> = ReadToken<Source, DecimalDigit | '_' | '.'> extends [infer NumberText extends string, infer AfterNumber extends string]
	? ReadDurationUnit<AfterNumber> extends [infer Unit extends DurationUnit, infer Rest extends string]
		? DurationPartNanoseconds<NumberText, Unit> extends infer Part
			? Part extends string ? Rest extends '' ? DecimalAdd<Sum, Part> : DurationSum<Rest, DecimalAdd<Sum, Part>> : Part
			: never
		: SomlError<'Invalid duration'>
	: never;

type DurationSignedNanoseconds<Source extends string, Negative extends boolean> = ValidDurationParts<Source> extends true
	? DurationSum<Source> extends infer Nanoseconds
		? Nanoseconds extends string
			? Negative extends true
				? Nanoseconds extends '0'
					? SomlError<'Negative zero duration is not allowed'>
					: MagnitudeAtMost<Nanoseconds, '9223372036854775808'> extends true ? `-${Nanoseconds}` : SomlError<'Duration exceeds the int64 nanosecond range'>
				: MagnitudeAtMost<Nanoseconds, '9223372036854775807'> extends true ? Nanoseconds : SomlError<'Duration exceeds the int64 nanosecond range'>
			: Nanoseconds
		: never
	: SomlError<'Invalid duration'>;

type DurationNanoseconds<Source extends string> = Source extends `-${infer Magnitude}` ? DurationSignedNanoseconds<Magnitude, true> : DurationSignedNanoseconds<Source, false>;

type IsDurationToken<Source extends string> = DurationNanoseconds<Source> extends string ? true : false;

type DecimalDivideSix<Source extends string, Remainder extends '0' | '1' | '2' | '3' | '4' | '5' = '0', Quotient extends string = ''> = Source extends `${infer Digit extends DecimalDigit}${infer Rest}`
	? DecimalDivisionSixTable[Remainder][Digit] extends [infer QuotientDigit extends DecimalDigit, infer NextRemainder extends '0' | '1' | '2' | '3' | '4' | '5']
		? DecimalDivideSix<Rest, NextRemainder, `${Quotient}${QuotientDigit}`>
		: never
	: [DecimalNormalize<Quotient>, Remainder];

type DecimalDivideSixty<Source extends string> = DecimalDivideSix<Source> extends [infer Divided extends string, infer Remainder extends DecimalDigit]
	? DecimalReverse<Divided> extends `${infer LastDigit extends DecimalDigit}${infer Rest}`
		? [DecimalNormalize<DecimalReverse<Rest>>, DecimalAdd<DecimalMultiplyDigit<LastDigit, '6'>, Remainder>]
		: never
	: never;

type DurationSplitNanoseconds<Reversed extends string, Fraction extends string = '', Count extends unknown[] = []> = Count['length'] extends 9
	? [DecimalNormalize<DecimalReverse<Reversed>>, Fraction]
	: Reversed extends `${infer Digit}${infer Rest}`
		? DurationSplitNanoseconds<Rest, `${Digit}${Fraction}`, [...Count, 0]>
		: DurationSplitNanoseconds<'', `0${Fraction}`, [...Count, 0]>;

type DecimalWithoutTrailingZeros<Source extends string> = Source extends `${infer Rest}0` ? DecimalWithoutTrailingZeros<Rest> : Source;

type DurationFormat<Hours extends string, Minutes extends string, Seconds extends string, Fraction extends string> = `${Hours extends '0' ? '' : `${Hours}h`}${Minutes extends '0' ? '' : `${Minutes}m`}${Seconds extends '0' ? Fraction extends '' ? '' : `0.${Fraction}s` : `${Seconds}${Fraction extends '' ? '' : `.${Fraction}`}s`}` extends infer Text extends string
	? Text extends '' ? '0s' : Text
	: never;

type DurationCanonicalMagnitude<Nanoseconds extends string> = DurationSplitNanoseconds<DecimalReverse<Nanoseconds>> extends [infer WholeSeconds extends string, infer Fraction extends string]
	? DecimalDivideSixty<WholeSeconds> extends [infer WholeMinutes extends string, infer Seconds extends string]
		? DecimalDivideSixty<WholeMinutes> extends [infer Hours extends string, infer Minutes extends string]
			? DurationFormat<Hours, Minutes, Seconds, DecimalWithoutTrailingZeros<Fraction>>
			: never
		: never
	: never;

type DurationCanonical<Source extends string> = DurationNanoseconds<Source> extends infer Nanoseconds
	? Nanoseconds extends `-${infer Magnitude}`
		? `-${DurationCanonicalMagnitude<Magnitude>}`
		: Nanoseconds extends string ? DurationCanonicalMagnitude<Nanoseconds> : Nanoseconds
	: never;

/*
Exact round-to-nearest, ties-to-even boundaries. Generated by `(2n ** 54n - 1n) * 2n ** 970n` and `5n ** 1075n`; the latter is multiplied by 10^-1075. Equality rounds to infinity and zero, respectively.
*/
type FloatOverflowDigits = '179769313486231580793728971405303415079934132710037826936173778980444968292764750946649017977587207096330286416692887910946555547851940402630657488671505820681908902000708383676273854845817711531764475730270069855571366959622842914819860834936475292719074168444365510704342711559699508093042880177904174497792';
type FloatUnderflowDigits = '24703282292062327208828439643411068618252990130716238221279284125033775363510437593264991818081799618989828234772285886546332835517796989819938739800539093906315035659515570226392290858392449105184435931802849936536152500319370457678249219365623669863658480757001585769269903706311928279558551332927834338409351978015531246597263579574622766465272827220056374006485499977096599470454020828166226237857393450736339007967761930577506740176324673600968951340535537458516661134223766678604162159680461914467291840300530057530849048765391711386591646239524912623653881879636239373280423891018672348497668235089863388587925628302755995657524455507255189313690836254779186948667994968324049705821028513185451396213837722826145437693412532098591327667236328125';


type NumericDigitComplement = ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0'];

type NumericComplement<Reference extends string, Source extends string, Result extends string = ''> = Reference extends `${infer _Digit}${infer ReferenceRest}`
	? Source extends `${infer Digit extends DecimalDigit}${infer Rest}`
		? NumericComplement<ReferenceRest, Rest, `${NumericDigitComplement[Digit]}${Result}`>
		: NumericComplement<ReferenceRest, '', `9${Result}`>
	: Result;

// First is at least Second. Adding the nine's complement and one leaves a leading carry to discard.
type NumericSubtract<First extends string, Second extends string> = DecimalAdd<DecimalAdd<First, NumericComplement<DecimalReverse<First>, DecimalReverse<Second>>>, '1'> extends `1${infer Difference}` ? DecimalNormalize<Difference> : never;

type NumericNegate<Source extends string> = Source extends '0' ? '0' : `-${Source}`;

type NumericDifference<Positive extends string, Negative extends string> = MagnitudeAtMost<Negative, Positive> extends true ? NumericSubtract<Positive, Negative> : NumericNegate<NumericSubtract<Negative, Positive>>;

type NumericSignedAdd<First extends string, Second extends string> = First extends `-${infer FirstMagnitude}`
	? Second extends `-${infer SecondMagnitude}` ? NumericNegate<DecimalAdd<FirstMagnitude, SecondMagnitude>> : NumericDifference<Second, FirstMagnitude>
	: Second extends `-${infer SecondMagnitude}` ? NumericDifference<First, SecondMagnitude> : DecimalAdd<First, Second>;

type NumericLength<Source extends string, Count extends unknown[] = []> = Source extends `${infer _Character}${infer Rest}` ? NumericLength<Rest, [...Count, 0]> : `${Count['length']}`;

type FloatFractionMagnitude<Source extends string, LeadingZeros extends unknown[] = [0]> = Source extends `0${infer Rest}`
	? FloatFractionMagnitude<Rest, [...LeadingZeros, 0]>
	: Source extends '' ? ['0', '0'] : [DecimalWithoutTrailingZeros<Source>, `-${LeadingZeros['length']}`];

type FloatMantissaMagnitude<Source extends string> = Source extends `${infer Whole}.${infer Fraction}`
	? Whole extends '0'
		? FloatFractionMagnitude<Fraction>
		: Whole extends `${infer _First}${infer Rest}` ? [DecimalWithoutTrailingZeros<`${Whole}${Fraction}`>, NumericLength<Rest>] : never
	: Source extends '0'
		? ['0', '0']
		: Source extends `${infer _First}${infer Rest}` ? [DecimalWithoutTrailingZeros<Source>, NumericLength<Rest>] : never;

type FloatMagnitude<Source extends string> = Source extends `${infer Mantissa}e${infer Exponent}`
	? FloatMantissaMagnitude<Mantissa> extends [infer Digits extends string, infer Adjustment extends string] ? [Digits, NumericSignedAdd<Exponent, Adjustment>] : never
	: FloatMantissaMagnitude<Source>;

// Compare normalized significands, padding the shorter stream with zeros.
type FloatCompareDigits<First extends string, Second extends string> = First extends `${infer FirstDigit}${infer FirstRest}`
	? Second extends `${infer SecondDigit}${infer SecondRest}`
		? FirstDigit extends SecondDigit
			? FloatCompareDigits<FirstRest, SecondRest>
			: '0123456789' extends `${string}${FirstDigit}${string}${SecondDigit}${string}` ? 'less' : 'greater'
		: FloatCompareDigits<First, '0'>
	: Second extends '' ? 'equal' : FloatCompareDigits<'0', Second>;

type FloatValidateMagnitude<Digits extends string, Exponent extends string> = Digits extends '0'
	? true
	: Exponent extends `-${infer Magnitude}`
		? MagnitudeAtMost<Magnitude, '324'> extends true
			? Magnitude extends '324' ? FloatCompareDigits<Digits, FloatUnderflowDigits> extends 'greater' ? true : SomlError<'Nonzero float rounds to zero'> : true
			: SomlError<'Nonzero float rounds to zero'>
		: MagnitudeAtMost<Exponent, '308'> extends true
			? Exponent extends '308' ? FloatCompareDigits<Digits, FloatOverflowDigits> extends 'less' ? true : SomlError<'Float rounds to infinity'> : true
			: SomlError<'Float rounds to infinity'>;

type FloatScientific<Digits extends string, Exponent extends string> = Digits extends `${infer First}${infer Rest}` ? `${First}${Rest extends '' ? '' : `.${Rest}`}e${Exponent extends `-${string}` ? Exponent : `+${Exponent}`}` : never;

type FloatShiftDecimalRight<Digits extends string, Places extends string, Whole extends string = ''> = Places extends '0'
	? Digits extends '' ? Whole : `${Whole}.${Digits}`
	: Digits extends `${infer First}${infer Rest}`
		? FloatShiftDecimalRight<Rest, NumericSubtract<Places, '1'>, `${Whole}${First}`>
		: FloatShiftDecimalRight<'', NumericSubtract<Places, '1'>, `${Whole}0`>;

type FloatSmallNegativeZeros = ['', '0', '00', '000', '0000', '00000'];

type FloatInferSpelling<Digits extends string, Exponent extends string> = Exponent extends `-${infer Magnitude}`
	? Magnitude extends '1' | '2' | '3' | '4' | '5' | '6'
		? NumericSubtract<Magnitude, '1'> extends infer Count extends '0' | '1' | '2' | '3' | '4' | '5' ? `0.${FloatSmallNegativeZeros[Count]}${Digits}` : never
		: FloatScientific<Digits, Exponent>
	: MagnitudeAtMost<Exponent, '20'> extends true
		? FloatShiftDecimalRight<Digits, DecimalAdd<Exponent, '1'>>
		: FloatScientific<Digits, Exponent>;

type FloatInfer<Digits extends string, Exponent extends string, Negative extends boolean> = FloatInferSpelling<Digits, Exponent> extends infer Spelling extends string
	? `${Negative extends true ? '-' : ''}${Spelling}` extends `${infer Value extends number}` ? Value : number
	: never;

type FloatValueMagnitude<Source extends string, Negative extends boolean> = FloatMagnitude<Source> extends [infer Digits extends string, infer Exponent extends string]
	? FloatValidateMagnitude<Digits, Exponent> extends infer Validation
		? Validation extends true ? Digits extends '0' ? 0 : FloatInfer<Digits, Exponent, Negative> : Validation
		: never
	: SomlError<'Invalid float'>;

type FloatValue<Source extends string> = WithoutSeparators<Source> extends infer Clean extends string
	? Clean extends `-${infer Magnitude}` ? FloatValueMagnitude<Magnitude, true> : FloatValueMagnitude<Clean, false>
	: never;

type IntegerHexDigitValue = {A: '10'; B: '11'; C: '12'; D: '13'; E: '14'; F: '15'};

type IntegerRadixMultiply<Source extends string, Radix extends '2' | '8' | '16'> = Radix extends '16' ? DecimalMultiplyDigit<DecimalMultiplyDigit<Source, '4'>, '4'> : DecimalMultiplyDigit<Source, Extract<Radix, DecimalDigit>>;

type IntegerRadixFold<Source extends string, Radix extends '2' | '8' | '16', Sum extends string = '0'> = Source extends `${infer Digit}${infer Rest}`
	? Digit extends DecimalDigit | keyof IntegerHexDigitValue
		? IntegerRadixFold<Rest, Radix, DecimalAdd<IntegerRadixMultiply<Sum, Radix>, Digit extends keyof IntegerHexDigitValue ? IntegerHexDigitValue[Digit] : Digit>>
		: SomlError<'Invalid integer'>
	: Sum;

type IntegerCanonical<Source extends string> = IsIntegerToken<Source> extends true
	? WithoutSeparators<Source> extends infer Clean extends string
		? Clean extends `0x${infer Digits}`
			? IntegerRadixFold<WithoutLeadingZeros<Digits>, '16'>
			: Clean extends `0o${infer Digits}`
				? IntegerRadixFold<WithoutLeadingZeros<Digits>, '8'>
				: Clean extends `0b${infer Digits}` ? IntegerRadixFold<WithoutLeadingZeros<Digits>, '2'> : Clean
		: never
	: SomlError<'Invalid integer'>;

type CalendarMonth = `0${Exclude<DecimalDigit, '0'>}` | '10' | '11' | '12';
type InstantHour = `0${DecimalDigit}` | `1${DecimalDigit}` | `2${'0' | '1' | '2' | '3'}`;
type InstantMinute = `${'0' | '1' | '2' | '3' | '4' | '5'}${DecimalDigit}`;
type DivisibleByFour = '00' | '04' | '08' | '12' | '16' | '20' | '24' | '28' | '32' | '36' | '40' | '44' | '48' | '52' | '56' | '60' | '64' | '68' | '72' | '76' | '80' | '84' | '88' | '92' | '96';

type IsLeapYear<Year extends string> = Year extends `${infer First}${infer Second}${infer Third}${infer Fourth}`
	? `${Third}${Fourth}` extends '00'
		? `${First}${Second}` extends DivisibleByFour ? true : false
		: `${Third}${Fourth}` extends DivisibleByFour ? true : false
	: false;

type ValidPlainDigits<Source extends string, Maximum extends number, Count extends unknown[] = []> = Source extends `${infer Character}${infer Rest}`
	? Count['length'] extends Maximum
		? false
		: Character extends DecimalDigit ? ValidPlainDigits<Rest, Maximum, [...Count, 0]> : false
	: Count extends [] ? false : true;

type ValidGregorianDate<Year extends string, Month extends string, Day extends string> = ValidPlainDigits<Year, 4> extends true
	? CompareDigitLengths<Year, '0000'> extends 'equal'
		? Year extends '0000'
			? false
			: Month extends CalendarMonth
				? Day extends `0${Exclude<DecimalDigit, '0'>}` | `1${DecimalDigit}` | `2${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'}`
					? true
					: Day extends '29'
						? Month extends '02' ? IsLeapYear<Year> : true
						: Day extends '30'
							? Month extends '02' ? false : true
							: Day extends '31' ? Month extends '01' | '03' | '05' | '07' | '08' | '10' | '12' ? true : false : false
				: false
		: false
	: false;

type ValidInstantTime<Source extends string> = Source extends `${infer Hour}:${infer Minute}:${infer Seconds}`
	? Hour extends InstantHour
		? Minute extends InstantMinute
			? Seconds extends `${infer Second}.${infer Fraction}`
				? Second extends InstantMinute ? ValidPlainDigits<Fraction, 9> : false
				: Seconds extends InstantMinute ? true : false
			: false
		: false
	: false;

type ValidInstantOffset<Source extends string> = Source extends `${infer Hour}:${infer Minute}`
	? Hour extends InstantHour ? Minute extends InstantMinute ? true : false : false
	: false;

type ValidInstantTimeAndOffset<Source extends string> = Source extends `${infer Time}Z`
	? ValidInstantTime<Time>
	: Source extends `${infer Time}+${infer Offset}`
		? ValidInstantOffset<Offset> extends true ? ValidInstantTime<Time> : false
		: Source extends `${infer Time}-${infer Offset}`
			? Offset extends '00:00'
				? false
				: ValidInstantOffset<Offset> extends true ? ValidInstantTime<Time> : false
			: false;

type IsDateToken<Source extends string> = Source extends `${infer Year}-${infer Month}-${infer Day}`
	? ValidGregorianDate<Year, Month, Day>
	: false;

type IsInstantSyntax<Source extends string> = Source extends `${infer Year}-${infer Month}-${infer Day}T${infer Time}`
	? ValidGregorianDate<Year, Month, Day> extends true ? ValidInstantTimeAndOffset<Time> : false
	: false;

type InstantPadTwo<Source extends string> = Source extends DecimalDigit ? `0${Source}` : Source;
type InstantPadYear<Source extends string> = Source extends `${infer _First}${infer _Second}${infer _Third}${infer _Fourth}${infer _Rest}` ? Source : InstantPadYear<`0${Source}`>;

type InstantLastDay<Year extends string, Month extends string> = Month extends '02'
	? IsLeapYear<Year> extends true ? '29' : '28'
	: Month extends '04' | '06' | '09' | '11' ? '30' : '31';

type InstantNextDate<Year extends string, Month extends string, Day extends string> = Day extends InstantLastDay<Year, Month>
	? Month extends '12'
		? Year extends '9999' ? SomlError<'Instant falls outside years 0001 to 9999 in UTC'> : [InstantPadYear<DecimalAdd<Year, '1'>>, '01', '01']
		: [Year, InstantPadTwo<DecimalAdd<Month, '1'>>, '01']
	: [Year, Month, InstantPadTwo<DecimalAdd<Day, '1'>>];

type InstantPreviousDate<Year extends string, Month extends string, Day extends string> = Day extends '01'
	? Month extends '01'
		? Year extends '0001' ? SomlError<'Instant falls outside years 0001 to 9999 in UTC'> : [InstantPadYear<NumericSubtract<Year, '1'>>, '12', '31']
		: InstantPadTwo<NumericSubtract<Month, '1'>> extends infer PreviousMonth extends string ? [Year, PreviousMonth, InstantLastDay<Year, PreviousMonth>] : never
	: [Year, Month, InstantPadTwo<NumericSubtract<Day, '1'>>];

type InstantMinutes<Hour extends string, Minute extends string> = DecimalAdd<`${DecimalMultiplyDigit<Hour, '6'>}0`, Minute>;
type InstantDivideMinutes<Minutes extends string, Hour extends string = '0'> = MagnitudeAtMost<Minutes, '59'> extends true
	? [InstantPadTwo<Hour>, InstantPadTwo<Minutes>]
	: InstantDivideMinutes<NumericSubtract<Minutes, '60'>, DecimalAdd<Hour, '1'>>;

type InstantAdjustedMinutes<Hour extends string, Minute extends string, OffsetHour extends string, OffsetMinute extends string, Sign extends '+' | '-'> = Sign extends '+'
	? NumericSubtract<DecimalAdd<InstantMinutes<Hour, Minute>, '1440'>, InstantMinutes<OffsetHour, OffsetMinute>> extends infer Adjusted extends string
		? MagnitudeAtMost<Adjusted, '1439'> extends true ? [Adjusted, 'previous'] : [NumericSubtract<Adjusted, '1440'>, 'same']
		: never
	: DecimalAdd<InstantMinutes<Hour, Minute>, InstantMinutes<OffsetHour, OffsetMinute>> extends infer Adjusted extends string
		? MagnitudeAtMost<Adjusted, '1439'> extends true ? [Adjusted, 'same'] : [NumericSubtract<Adjusted, '1440'>, 'next']
		: never;

type InstantSeconds<Source extends string> = Source extends `${infer Whole}.${infer Fraction}`
	? DecimalWithoutTrailingZeros<Fraction> extends infer Trimmed extends string ? `${Whole}${Trimmed extends '' ? '' : `.${Trimmed}`}` : never
	: Source;

type InstantUtcValue<Year extends string, Month extends string, Day extends string, Seconds extends string, Minutes extends string, Shift extends 'previous' | 'same' | 'next'> = (Shift extends 'previous' ? InstantPreviousDate<Year, Month, Day> : Shift extends 'next' ? InstantNextDate<Year, Month, Day> : [Year, Month, Day]) extends infer UtcDate
	? UtcDate extends [infer UtcYear extends string, infer UtcMonth extends string, infer UtcDay extends string]
		? InstantDivideMinutes<Minutes> extends [infer Hour extends string, infer Minute extends string] ? `${UtcYear}-${UtcMonth}-${UtcDay}T${Hour}:${Minute}:${InstantSeconds<Seconds>}Z` : never
		: UtcDate
	: never;

type InstantNormalizeOffset<Year extends string, Month extends string, Day extends string, Time extends string, Sign extends '+' | '-', Offset extends string> = Time extends `${infer Hour}:${infer Minute}:${infer Seconds}`
	? Offset extends `${infer OffsetHour}:${infer OffsetMinute}`
		? InstantAdjustedMinutes<Hour, Minute, OffsetHour, OffsetMinute, Sign> extends [infer Minutes extends string, infer Shift extends 'previous' | 'same' | 'next'] ? InstantUtcValue<Year, Month, Day, Seconds, Minutes, Shift> : never
		: never
	: never;

type InstantNormalize<Source extends string> = Source extends `${infer Year}-${infer Month}-${infer Day}T${infer TimeAndOffset}`
	? TimeAndOffset extends `${infer Hour}:${infer Minute}:${infer Seconds}Z`
		? `${Year}-${Month}-${Day}T${Hour}:${Minute}:${InstantSeconds<Seconds>}Z`
		: TimeAndOffset extends `${infer Time}+${infer Offset}` ? InstantNormalizeOffset<Year, Month, Day, Time, '+', Offset> : TimeAndOffset extends `${infer Time}-${infer Offset}` ? InstantNormalizeOffset<Year, Month, Day, Time, '-', Offset> : never
	: never;

type InstantCanonical<Source extends string> = IsInstantSyntax<Source> extends true ? InstantNormalize<Source> : SomlError<'Invalid instant'>;
type IsInstantToken<Source extends string> = InstantCanonical<Source> extends string ? true : false;

type Scalar<Token extends string, Options extends ParseOptions = {}> = Token extends 'true'
	? true
	: Token extends 'false'
		? false
		: Token extends 'null'
			? null
			: Token extends 'infinity'
				? 1e999
				: Token extends '-infinity'
					? -1e999
					: IsDateToken<Token> extends true
						? SomlDate<Token>
						: IsInstantToken<Token> extends true
							? SomlInstant<Token>
							: IsDurationToken<Token> extends true ? SomlDuration<Token> : Numeric<Token, Options>;

type TrimTrivia<Source extends string, AllowLineBreak extends boolean = true> = Source extends ` ${infer Rest}` | `\t${infer Rest}`
	? TrimTrivia<Rest, AllowLineBreak>
	: Source extends `\n${infer Rest}`
		? AllowLineBreak extends true ? TrimTrivia<Rest, AllowLineBreak> : Source
		: Source extends `#${infer Comment}`
			? Comment extends `${string}\n${infer Rest}` ? TrimTrivia<`\n${Rest}`, AllowLineBreak> : ''
			: Source extends `/*${infer Comment}`
				? Comment extends `${infer Body}*/${infer Rest}`
					? Body extends `${string}/*${string}` ? SomlError<'Nested block comments are not allowed'> : TrimTrivia<Rest, AllowLineBreak>
					: SomlError<'Unterminated block comment'>
				: Source;

type ReadToken<Source extends string, Characters extends string, Text extends string = '', Count extends unknown[] = []> = Count['length'] extends 256
	? ReadToken<Source, Characters, Text> & {}
	: Source extends `${infer Character}${infer Rest}`
		? Character extends Characters ? ReadToken<Rest, Characters, `${Text}${Character}`, [...Count, 0]> : [Text, Source]
		: [Text, ''];

type ReadBare<Source extends string> = ReadToken<Source, BareCharacter> extends [infer Text extends string, infer Rest extends string]
	? Text extends '' ? SomlError<'Expected an object key'> : [Text, Rest]
	: never;

type ReadQuoted<Source extends string, Quote extends "'" | '"', Text extends string = '', Count extends unknown[] = []> = Count['length'] extends 256
	? ReadQuoted<Source, Quote, Text> & {}
	: Source extends `${infer Character}${infer Rest}`
		? Character extends Quote
			? [Text, Rest]
			: Character extends '\n'
				? SomlError<'A quoted string cannot contain a line break'>
				: [Quote, Character] extends ['"', '\\']
					? ReadEscape<Rest> extends infer Escaped
						? Escaped extends [infer Value extends string, infer Remaining extends string] ? ReadQuoted<Remaining, Quote, `${Text}${Value}`, [...Count, 0]> : Escaped
						: never
					: ReadQuoted<Rest, Quote, `${Text}${Character}`, [...Count, 0]>
		: SomlError<'Unterminated string'>;

type ReadEscape<Source extends string> = Source extends `${infer Character}${infer Rest}`
	? Character extends '\\' | '"'
		? [Character, Rest]
		: Character extends 'n'
			? ['\n', Rest]
			: Character extends 't'
				? ['\t', Rest]
				: Character extends 'u' ? SomlError<'Unicode escapes are unsupported'> : SomlError<'Invalid escape'>
	: SomlError<'Unterminated escape'>;

type ReadQuoteRun<Source extends string, Quote extends "'" | '"', Quotes extends string = ''> = Source extends `${Quote}${infer Rest}`
	? ReadQuoteRun<Rest, Quote, `${Quotes}${Quote}`>
	: [Quotes, Source];

type ReadIndentation<Source extends string, Indentation extends string = ''> = Source extends `${infer Character}${infer Rest}`
	? Character extends ' ' | '\t' ? ReadIndentation<Rest, `${Indentation}${Character}`> : [Indentation, Source]
	: [Indentation, ''];

// Deferring blank lines until the next nonblank line discards leading and trailing blank lines while preserving interior blank lines.
type DedentBlock<Source extends string, Indentation extends string, Text extends string = '', BlankLines extends string = ''> = Source extends `${infer Line}\n${infer Rest}`
	? ReadIndentation<Line> extends [string, infer Content extends string]
		? Content extends ''
			? DedentBlock<Rest, Indentation, Text, Text extends '' ? '' : `${BlankLines}\n`>
			: Line extends `${Indentation}${infer Dedented}`
				? DedentBlock<Rest, Indentation, `${Text}${Text extends '' ? '' : `${BlankLines}\n`}${Dedented}`>
				: SomlError<'A block string line must begin with the closing delimiter indentation'>
		: never
	: Text;

type DecodeBlockEscapes<Source extends string, Text extends string = '', Count extends unknown[] = []> = Count['length'] extends 256
	? DecodeBlockEscapes<Source, Text> & {}
	: Source extends `${infer Character}${infer Rest}`
		? Character extends '\\'
			? ReadEscape<Rest> extends infer Escaped
				? Escaped extends [infer Value extends string, infer Remaining extends string] ? DecodeBlockEscapes<Remaining, `${Text}${Value}`, [...Count, 0]> : Escaped
				: never
			: DecodeBlockEscapes<Rest, `${Text}${Character}`, [...Count, 0]>
		: Text;

type FinishBlock<Content extends string, Indentation extends string, Quote extends "'" | '"', Rest extends string> = DedentBlock<Content, Indentation> extends infer Text
	? Text extends string
		? Quote extends "'"
			? [Text, Rest]
			: DecodeBlockEscapes<Text> extends infer Value ? Value extends string ? [Value, Rest] : Value : never
		: Text
	: never;

type ReadBlockClosing<Source extends string, Delimiter extends string, Quote extends "'" | '"'> = ReadIndentation<Source> extends [infer Indentation extends string, infer AfterIndentation extends string]
	? AfterIndentation extends `${Delimiter}${infer Rest}`
		? Rest extends `${Quote}${string}` ? false : [Indentation, Rest]
		: false
	: never;

type ReadBlockLines<Source extends string, Delimiter extends string, Quote extends "'" | '"', Content extends string = ''> = ReadBlockClosing<Source, Delimiter, Quote> extends infer Closing
	? Closing extends [infer Indentation extends string, infer Rest extends string]
		? FinishBlock<Content, Indentation, Quote, Rest>
		: Source extends `${infer Line}\n${infer Rest}`
			? ReadBlockLines<Rest, Delimiter, Quote, `${Content}${Line}\n`>
			: SomlError<'Unterminated block string'>
	: never;

type ReadBlock<Source extends string, Quote extends "'" | '"'> = ReadQuoteRun<Source, Quote> extends [infer Delimiter extends string, infer AfterDelimiter extends string]
	? AfterDelimiter extends `\n${infer Content}` ? ReadBlockLines<Content, Delimiter, Quote> : SomlError<'A block string opening delimiter must be followed directly by a line break'>
	: never;

type ReadString<Source extends string> = Source extends `'''${string}`
	? ReadBlock<Source, "'">
	: Source extends `"""${string}`
		? ReadBlock<Source, '"'>
		: Source extends `'${infer Rest}` ? ReadQuoted<Rest, "'"> : Source extends `"${infer Rest}` ? ReadQuoted<Rest, '"'> : SomlError<'Expected a string'>;

type ReadKey<Source extends string> = Source extends `'''${string}` | `"""${string}`
	? SomlError<'A block string cannot be a key'>
	: Source extends `'${string}` | `"${string}` ? ReadString<Source> : ReadBare<Source>;

type AddMember<Object extends object, Key extends string, Value> = Object & {
	[Property in Key]: Value;
};

type ParserClosing = '}' | ']' | '';
type ParserFrame = [closing: ParserClosing, value: object, key: string];
type ParserPhase = 'member' | 'value' | 'tail';
type ParserStep = [source: string, closing: ParserClosing, value: object, phase: ParserPhase, key: string, stack: ParserFrame[]];

type StoreParsedValue<Source extends string, Closing extends ParserClosing, Collection extends object, Key extends string, Value, Stack extends ParserFrame[]> = Closing extends ']'
	? Collection extends unknown[] ? [Source, Closing, [...Collection, Value], 'tail', '', Stack] : SomlError<'Expected an array'>
	: [Source, Closing, AddMember<Collection, Key, Value>, 'tail', '', Stack];

type CloseParsedContainer<Source extends string, Collection extends object, Stack extends ParserFrame[], Value extends object = Collection extends unknown[] ? Collection : {[Property in keyof Collection]: Collection[Property]}> = Stack extends [...infer Parents extends ParserFrame[], infer Parent extends ParserFrame]
	? StoreParsedValue<Source, Parent[0], Parent[1], Parent[2], Value, Parents>
	: [Value, Source];

type ReadAtomicValue<Source extends string, Options extends ParseOptions> = Source extends `'${string}` | `"${string}`
	? ReadString<Source>
	: ReadToken<Source, BareCharacter | '.' | ':' | '+'> extends [infer Token extends string, infer Rest extends string]
		? Token extends '' ? SomlError<'Expected a value'> : Scalar<Token, Options> extends infer Value ? Value extends SomlError ? Value : [Value, Rest] : never
		: SomlError<'Expected a value'>;

type ReadParserValue<Source extends string, Closing extends ParserClosing, Collection extends object, Key extends string, Stack extends ParserFrame[], Options extends ParseOptions> = Source extends `{${infer Rest}` | `[${infer Rest}`
	? [...Stack, 0]['length'] extends MaximumDepth<Options>
		? SomlError<'Maximum nesting depth exceeded'>
		: Source extends `{${string}` ? [Rest, '}', {}, 'member', '', [...Stack, [Closing, Collection, Key]]] : [Rest, ']', [], 'member', '', [...Stack, [Closing, Collection, Key]]]
	: ReadAtomicValue<Source, Options> extends infer Result
		? Result extends [infer Value, infer Rest extends string] ? StoreParsedValue<Rest, Closing, Collection, Key, Value, Stack> : Result
		: never;

type ReadParserMember<Source extends string, Closing extends ParserClosing, Collection extends object, Stack extends ParserFrame[], Options extends ParseOptions> = Closing extends ']'
	? Source extends `]${infer Rest}`
		? CloseParsedContainer<Rest, Collection, Stack>
		: Source extends '' ? SomlError<'Expected a closing bracket'> : ReadParserValue<Source, Closing, Collection, '', Stack, Options>
	: Source extends ''
		? Closing extends '' ? CloseParsedContainer<'', Collection, Stack> : SomlError<'Expected a closing brace'>
		: Source extends `}${infer Rest}`
			? Closing extends '}' ? CloseParsedContainer<Rest, Collection, Stack> : SomlError<'Expected an object key'>
			: ReadKey<Source> extends infer Result
				? Result extends [infer Key extends string, infer Rest extends string]
					? Key extends keyof Collection
						? SomlError<'Duplicate object key'>
						: Rest extends `:${infer AfterColon}` ? [AfterColon, Closing, Collection, 'value', Key, Stack] : SomlError<'Expected a colon directly after an object key'>
					: Result
				: never;

type ReadParserTail<Source extends string, Closing extends ParserClosing, Collection extends object, Stack extends ParserFrame[]> = Source extends ''
	? Closing extends '' ? CloseParsedContainer<'', Collection, Stack> : Closing extends '}' ? SomlError<'Expected a closing brace'> : SomlError<'Expected a closing bracket'>
	: Closing extends '}'
		? Source extends `}${infer Rest}` ? CloseParsedContainer<Rest, Collection, Stack> : ReadParserSeparator<Source, Closing, Collection, Stack>
		: Closing extends ']'
			? Source extends `]${infer Rest}` ? CloseParsedContainer<Rest, Collection, Stack> : ReadParserSeparator<Source, Closing, Collection, Stack>
			: ReadParserSeparator<Source, Closing, Collection, Stack>;

type ReadParserSeparator<Source extends string, Closing extends ParserClosing, Collection extends object, Stack extends ParserFrame[]> = Source extends `,${infer Rest}`
	? Closing extends '' ? SomlError<'Commas are not allowed in a brace-less object'> : [Rest, Closing, Collection, 'member', '', Stack]
	: Source extends `\n${infer Rest}`
		? [Rest, Closing, Collection, 'member', '', Stack]
		: Closing extends ']' ? SomlError<'Expected a comma or line break between array items'> : SomlError<'Expected a comma or line break between object members'>;

// Every token advances this loop. Parent collections live in an explicit stack, so nesting does not add recursive type instantiations.
// An intersection periodically resets TypeScript's tail-recursion counter without changing the returned container or diagnostic.
type ParseTokens<Source extends string, Closing extends ParserClosing, Collection extends object, Phase extends ParserPhase, Key extends string, Stack extends ParserFrame[], Options extends ParseOptions, Iterations extends unknown[] = []> = Iterations['length'] extends 128
	? ParseTokens<Source, Closing, Collection, Phase, Key, Stack, Options> & {}
	: TrimTrivia<Source, Phase extends 'tail' ? false : true> extends infer Clean
		? Clean extends string
			? (Phase extends 'member' ? ReadParserMember<Clean, Closing, Collection, Stack, Options> : Phase extends 'value' ? ReadParserValue<Clean, Closing, Collection, Key, Stack, Options> : ReadParserTail<Clean, Closing, Collection, Stack>) extends infer Step
				? Step extends ParserStep ? ParseTokens<Step[0], Step[1], Step[2], Step[3], Step[4], Step[5], Options, [...Iterations, 0]> : Step
				: never
			: Clean
		: never;

type ParseDocument<Source extends string, Options extends ParseOptions> = TrimTrivia<Source> extends infer Clean
	? Clean extends string
		? Clean extends ''
			? SomlError<'Expected a document'>
			: (Clean extends `{${infer Rest}` ? ParseTokens<Rest, '}', {}, 'member', '', [], Options> : Clean extends `[${infer Rest}` ? ParseTokens<Rest, ']', [], 'member', '', [], Options> : ParseTokens<Clean, '', {}, 'member', '', [], Options>) extends infer Result
				? Result extends [infer Value, infer Rest extends string]
					? TrimTrivia<Rest> extends infer Tail ? Tail extends '' ? Value : Tail extends string ? SomlError<'Unexpected content after the document'> : Tail : never
					: Result
				: never
		: Clean
	: never;

type BigintParsedValue = Exclude<SomlScalar, SomlInteger> | readonly BigintParsedValue[] | BigintParsedObject;
type BigintParsedObject = {readonly [somlType]?: never; readonly [key: string]: BigintParsedValue};

type ParseSource<Source extends string, Options extends ParseOptions> = Options extends unknown
	? Source extends unknown
		? string extends Source
			? Options extends {readonly integers: 'bigint'} ? BigintParsedObject | BigintParsedValue[] : SomlObject | SomlValue[]
			: {} extends Record<Source, never>
				? SomlError<'Parsing requires a string literal'>
				: ValidateSource<Source> extends infer Validation ? Validation extends true ? ParseDocument<Source, Options> : Validation : never
		: never
	: never;

/**
Parse a SOML string literal into its value type. Supports objects, arrays, comments, block strings, numeric and temporal scalars, and up to 100 nested collections. Invalid input returns `SomlError`.

@example
```
import type {Parse} from 'soml-typescript-types';

type Configuration = Parse<`name: 'api-gateway'
port: 8080
healthy: true`, {integers: 'bigint'}>;
//=> {name: 'api-gateway'; port: 8080n; healthy: true}
```
*/
export type Parse<Source extends string, Options extends ParseOptions = {}> = unknown extends Source
	? SomlError<'Parsing requires a known source type'>
	: [Source] extends [never]
		? SomlError<'Parsing requires a known source type'>
		: ParseSource<Source, Inferred<Options>> extends infer Parsed
			? Extract<Parsed, SomlError> extends never ? Parsed : Extract<Parsed, SomlError>
			: never;

type EscapeString<Source extends string, Accumulator extends string = '', Count extends unknown[] = []> = Count['length'] extends 256
	? EscapeString<Source, Accumulator> & {}
	: Source extends `${infer Character}${infer Rest}`
		? Character extends '\\' | '"'
			? EscapeString<Rest, `${Accumulator}\\${Character}`, [...Count, 0]>
			: Character extends '\n'
				? EscapeString<Rest, `${Accumulator}\\n`, [...Count, 0]>
				: Character extends '\t'
					? EscapeString<Rest, `${Accumulator}\\t`, [...Count, 0]>
					: EscapeString<Rest, `${Accumulator}${Character}`, [...Count, 0]>
		: Accumulator;

type EncodeString<Source extends string> = {} extends Record<Source, never>
	? SomlError<'Encoding requires a string literal'>
	: ValidateCharacters<Source> extends infer Validation
		? Validation extends true
			? Source extends `${string}${"'" | '\n' | '\t'}${string}`
				? `"${EscapeString<Source>}"`
				: `'${Source}'`
			: Validation
		: never;

type AllBare<Source extends string, Count extends unknown[] = []> = Count['length'] extends 256
	? AllBare<Source> & {}
	: Source extends ''
		? true
		: Source extends `${BareCharacter}${infer Rest}` ? AllBare<Rest, [...Count, 0]> : false;

type EncodeKey<Source extends string> = {} extends Record<Source, never>
	? SomlError<'Encoding requires a string literal'>
	: AllAscii<Source> extends true
		? Source extends '' ? "''" : AllBare<Source> extends true ? Source : EncodeString<Source>
		: SomlError<'Encoding requires ASCII object keys'>;

type EncodeScalar<Source extends string, Expected, Options extends EncodeOptions = {}> = {} extends Record<Source, never>
	? SomlError<'Encoding requires a scalar source literal'>
	: ValidateSource<Source> extends infer Validation
		? Validation extends true
			? Scalar<Source> extends Expected
				? Options extends {readonly canonical: true} ? Expected extends SomlInteger ? IntegerCanonical<Source> : Expected extends SomlInstant ? InstantCanonical<Source> : Expected extends SomlDuration ? DurationCanonical<Source> : Source : Source
				: SomlError<'Invalid scalar source'>
			: Validation
		: never;

type EncodeNumber<Value extends number, Source extends string = `${Value}`> = {} extends Record<Source, never>
	? SomlError<'Encoding requires a number literal'>
	: Source extends 'NaN' ? SomlError<'NaN is not a SOML value'> : Source extends 'Infinity' ? 'infinity' : Source extends '-Infinity' ? '-infinity' : Source extends `${infer Mantissa}e+${infer Exponent}`
		? `${Mantissa}e${Exponent}`
		: Source extends `${string}.${string}` | `${string}e${string}`
			? Source
			: `${Source}.0`;

type EncodeBigInt<Value extends bigint> = bigint extends Value
	? SomlError<'Encoding requires a bigint literal'>
	: EncodeScalar<`${Value}`, SomlInteger>;

// The initial tuple order is compiler-dependent; insertion sorting makes the emitted order deterministic.
type LastKey<Keys extends string> = (Keys extends unknown ? (callback: () => Keys) => void : never) extends (callback: infer Callback) => void
	? Callback extends () => (infer Key extends string) ? Key : never
	: never;

type KeyTuple<Keys extends string, Accumulator extends string[] = []> = [Keys] extends [never]
	? Accumulator
	: LastKey<Keys> extends infer Key extends string ? KeyTuple<Exclude<Keys, Key>, [Key, ...Accumulator]> : never;

type InsertKey<Keys extends string[], Key extends string, Before extends string[] = []> = Keys extends [infer First extends string, ...infer Rest extends string[]]
	? CompareStrings<Key, First> extends 'less' ? [...Before, Key, ...Keys] : InsertKey<Rest, Key, [...Before, First]>
	: [...Before, Key];

type SortKeys<Keys extends string[], Accumulator extends string[] = []> = Keys extends [infer Key extends string, ...infer Rest extends string[]]
	? SortKeys<Rest, InsertKey<Accumulator, Key>>
	: Accumulator;

// Intersecting the key set prevents TypeScript from dropping numeric/string aliases during remapping.
type StringKeyed<Value extends object> = {
	[Key in keyof Value & (string | number) as `${Key}`]: Value[Key];
};

type InvalidKey<Keys extends string> = Keys extends unknown
	? EncodeKey<Keys> extends infer Encoded ? Encoded extends string ? never : Encoded : never
	: never;

type EncodeAtom<Value, Options extends EncodeOptions> = Value extends string
	? EncodeString<Value>
	: Value extends SomlInteger<infer Source>
		? EncodeScalar<Source, SomlInteger, Options>
		: Value extends bigint
			? EncodeBigInt<Value>
			: Value extends number
				? EncodeNumber<Value>
				: Value extends boolean
					? Value extends true ? 'true' : 'false'
					: Value extends null
						? 'null'
						: Value extends SomlDate<infer Source>
							? EncodeScalar<Source, SomlDate, Options>
							: Value extends SomlInstant<infer Source>
								? EncodeScalar<Source, SomlInstant, Options>
								: Value extends SomlDuration<infer Source>
									? EncodeScalar<Source, SomlDuration, Options>
									: SomlError<'Unsupported value'>;

type EncoderTask = ['value', unknown, unknown[], string, boolean] | ['text', string] | ['array', readonly unknown[], unknown[], string, unknown[]] | ['object', object, string[], unknown[], string, boolean];

type EncodeContainerTasks<Value extends object, Depth extends unknown[], Indentation extends string, Root extends boolean, Options extends EncodeOptions, Tasks extends EncoderTask[], Text extends string> = Depth['length'] extends MaximumDepth<Options>
	? SomlError<'Maximum nesting depth exceeded'>
	: Value extends readonly unknown[]
		? number extends Value['length']
			? SomlError<'Encoding requires a finite tuple'>
			: Value extends Required<Value>
				? Value['length'] extends 0
					? [`${Text}[]`, Tasks]
					: Options extends {readonly canonical: true}
						? [`${Text}[\n`, [['array', Value, [...Depth, 0], `${Indentation}\t`, []], ['text', `\n${Indentation}]`], ...Tasks]]
						: [`${Text}[`, [['array', Value, [...Depth, 0], Indentation, []], ['text', ']'], ...Tasks]]
				: SomlError<'Encoding requires a tuple without optional elements'>
		: Exclude<keyof Value, string | number> extends never
			? string extends keyof Value
				? SomlError<'Encoding does not support index signatures'>
				// Numeric enum keys accept number by assignability but can still name a finite set of properties.
				: `${number}` extends `${keyof Value & number}`
					? SomlError<'Encoding does not support index signatures'>
					: Value extends Required<Value>
						? StringKeyed<Value> extends infer Object extends object
							? [InvalidKey<keyof Object & string>] extends [never]
								? [keyof Object] extends [never]
									? string extends Value ? [`${Text}{}`, Tasks] : SomlError<'Encoding requires a concrete object type'>
									: Options extends {readonly canonical: true}
										? Root extends true
											? [Text, [['object', Object, SortKeys<KeyTuple<keyof Object & string>>, [...Depth, 0], '', true], ...Tasks]]
											: [`${Text}{\n`, [['object', Object, SortKeys<KeyTuple<keyof Object & string>>, [...Depth, 0], `${Indentation}\t`, true], ['text', `\n${Indentation}}`], ...Tasks]]
										: [`${Text}{`, [['object', Object, SortKeys<KeyTuple<keyof Object & string>>, [...Depth, 0], Indentation, true], ['text', '}'], ...Tasks]]
								: InvalidKey<keyof Object & string>
							: never
						: SomlError<'Encoding does not support optional properties'>
			: SomlError<'Encoding requires string or numeric object keys'>;

type EncodeValueTask<Value, Depth extends unknown[], Indentation extends string, Root extends boolean, Options extends EncodeOptions, Tasks extends EncoderTask[], Text extends string> = 0 extends (1 & Value)
	? SomlError<'Encoding requires a known value type'>
	: [Value] extends [never]
		? SomlError<'Encoding requires a known value type'>
		: Value extends SomlScalar
			? Options extends {readonly canonical: true}
				? Root extends true ? SomlError<'A canonical document must be an object or array'> : EncodeAtomicTask<Value, Options, Tasks, Text>
				: EncodeAtomicTask<Value, Options, Tasks, Text>
			// Function also identifies class constructors with private or protected construct signatures.
			: Value extends Function | (abstract new (...arguments_: never[]) => unknown) | ((...arguments_: never[]) => unknown)
				? SomlError<'Unsupported value'>
				: Value extends object
					? EncodeContainerTasks<Value, Depth, Indentation, Root, Options, Tasks, Text>
					: EncodeAtomicTask<Value, Options, Tasks, Text>;

type EncodeAtomicTask<Value, Options extends EncodeOptions, Tasks extends EncoderTask[], Text extends string> = EncodeAtom<Value, Options> extends infer Encoded
	? Encoded extends string ? [`${Text}${Encoded}`, Tasks] : Encoded
	: never;

type EncodeSeparator<First extends boolean, Indentation extends string, Options extends EncodeOptions> = Options extends {readonly canonical: true}
	? `${First extends true ? '' : '\n'}${Indentation}`
	: First extends true ? '' : ', ';

// Required indices preserve concrete tuple members when intersections or key remapping prevent reliable tail inference.
type EncodeArrayTask<Values extends readonly unknown[], Depth extends unknown[], Indentation extends string, Position extends unknown[], Options extends EncodeOptions, Tasks extends EncoderTask[], Text extends string> = Values['length'] extends Position['length']
	? [Text, Tasks]
	: Values extends Record<Position['length'], unknown>
		? [`${Text}${EncodeSeparator<Position extends [] ? true : false, Indentation, Options>}`, [['value', Values[Position['length']], Depth, Indentation, false], ['array', Values, Depth, Indentation, [...Position, 0]], ...Tasks]]
		: SomlError<'Encoding requires a tuple without optional elements'>;

type EncodeObjectTask<Value extends object, Keys extends string[], Depth extends unknown[], Indentation extends string, First extends boolean, Options extends EncodeOptions, Tasks extends EncoderTask[], Text extends string> = Keys extends [infer Key extends keyof Value & string, ...infer Rest extends string[]]
	? EncodeKey<Key> extends infer EncodedKey
		? EncodedKey extends string
			? [`${Text}${EncodeSeparator<First, Indentation, Options>}${EncodedKey}: `, [['value', Value[Key], Depth, Indentation, false], ['object', Value, Rest, Depth, Indentation, false], ...Tasks]]
			: EncodedKey
		: never
	: [Text, Tasks];

type RunEncoderTask<Task extends EncoderTask, Options extends EncodeOptions, Tasks extends EncoderTask[], Text extends string> = Task extends ['text', infer Fragment extends string]
	? [`${Text}${Fragment}`, Tasks]
	: Task extends ['value', infer Value, infer Depth extends unknown[], infer Indentation extends string, infer Root extends boolean]
		? EncodeValueTask<Inferred<Value>, Depth, Indentation, Root, Options, Tasks, Text>
		: Task extends ['array', infer Values extends readonly unknown[], infer Depth extends unknown[], infer Indentation extends string, infer Position extends unknown[]]
			? EncodeArrayTask<Values, Depth, Indentation, Position, Options, Tasks, Text>
			: Task extends ['object', infer Value extends object, infer Keys extends string[], infer Depth extends unknown[], infer Indentation extends string, infer First extends boolean]
				? EncodeObjectTask<Value, Keys, Depth, Indentation, First, Options, Tasks, Text>
				: SomlError<'Unsupported value'>;

// Scheduling container endings and remaining members keeps nested values out of the compiler's recursive instantiation stack.
type EncodeTasks<Tasks extends EncoderTask[], Options extends EncodeOptions, Text extends string = '', Iterations extends unknown[] = []> = Iterations['length'] extends 128
	? EncodeTasks<Tasks, Options, Text> & {}
	: Tasks extends [infer Task extends EncoderTask, ...infer Remaining extends EncoderTask[]]
		? RunEncoderTask<Task, Options, Remaining, Text> extends infer Step
			? Step extends [infer Encoded extends string, infer Next extends EncoderTask[]] ? EncodeTasks<Next, Options, Encoded, [...Iterations, 0]> : Step
			: never
		: Text;

type EncodeValue<Value, Options extends EncodeOptions> = Options extends unknown
	? EncodeTasks<[['value', Value, [], '', true]], Options> extends infer Encoded
		? Encoded extends string ? Options extends {readonly canonical: true} ? `${Encoded}\n` : Encoded : Encoded
		: never
	: never;

/**
Encode literal scalars, finite tuples, and object types with required members as a SOML string literal. Keys are sorted. Use `canonical: true` to normalize scalars, indent with tabs, and add a final LF; canonical documents must be objects or arrays. Unsupported values return `SomlError`.

Private or protected constructors that shadow built-in function members are unsupported because their construct signatures are hidden from conditional type checks.

@example
```
import type {Encode} from 'soml-typescript-types';

type Source = Encode<{port: 8080n; healthy: true}>;
//=> '{healthy: true, port: 8080}'
```
*/
export type Encode<Value, Options extends EncodeOptions = {}> = EncodeValue<Value, Inferred<Options>> extends infer Encoded
	? Extract<Encoded, SomlError> extends never
		? Encoded extends string
			? Encoded
			: SomlError<'Unsupported value'>
		: Extract<Encoded, SomlError>
	: never;

/**
Parse and normalize a SOML document into its canonical string literal. Accepts the same options as `Parse`. Invalid or unencodable input returns `SomlError`.

@example
```
import type {Canonicalize} from 'soml-typescript-types';

type Source = Canonicalize<"z: 0xFF\na: 90m">;
//=> 'a: 1h30m\nz: 255\n'
```
*/
export type Canonicalize<Source extends string, Options extends ParseOptions = {}> = {} extends Record<Source, never>
	? SomlError<'Canonicalization requires a string literal'>
	: Parse<Source, Options> extends infer Parsed
		? [Parsed] extends [SomlError] ? Parsed : Encode<Parsed, {canonical: true; maxDepth: MaximumDepth<Options>}>
		: never;

/**
Mark a string as a compile-time SOML date. An alias of `SomlDate`.

Importing this alias shadows the global `Date` type in that module. Import `SomlDate` instead when the module also uses the global `Date` type.

@example
```
import type {Date, Encode} from 'soml-typescript-types';

type Source = Encode<Date<'1582-10-10'>>;
//=> '1582-10-10'
```
*/
export type Date<Source extends string> = SomlDate<Source>;

/**
Mark a string as a compile-time SOML instant.
*/
export type Instant<Source extends string> = SomlInstant<Source>;

/**
Mark a string as a compile-time SOML duration.
*/
export type Duration<Source extends string> = SomlDuration<Source>;
