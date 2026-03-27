# Cucci Programming Language

Cucci is a minimalistic, esoteric interpreted programming language written in TypeScript. 
It features a scannerless parser, implicit type conversion, mathematical ambiguity, and single-character identifiers.

## Features
- **Scannerless Parser**: No tokenization phase. The environment state directly drives the syntax resolution at parse-time.
- **Single-character Identifiers**: Variables and functions are always one character long.
- **No Whitespace**: Cucci ignores spaces. Juxtaposition is used for assignment (`A 5` assigns 5 to A).
- **Arity-based Overloading**: You can define the same function name with different parameter counts.
- **Global Variables**: All variables are global. Functions have local scope for their parameters.

## Installation
Ensure you have Node.js v20+ installed.
```bash
npm install
npm run build
```

## Usage
Run a `.cucci` file using the CLI:
```bash
node bin/pern.js main.cucci
```

## Syntax Basics

### Assignment
Assignment is performed by placing the expression directly after the variable name:
```
A 5
B A+10
```

### Functions
Functions are defined using the `$` prefix, followed by the name, parameters, a `:`, and the body expression:
```
$f:10          // f() returns 10
$gxy:x*y       // g(x, y) returns x * y
```

### Calling Functions
Function calls evaluate greedily based on their arity:
```
A g 2 3        // evaluated as g(2, 3), assigns 6 to A
```
Parentheses can be used to group expressions.

### Operators
- `+`, `-`, `*`, `/`, `%` for arithmetic
- `<`, `>`, `=` for numeric comparison (returns 1 for true, 0 for false)
- `!` unary logical NOT
- `.` unary print side-effect: `.A` prints A and resolves to A.

### Example: Factorial
```cucci
$fn:(n=0)+(n>0)*(n*f(n-1))
.f5
```
