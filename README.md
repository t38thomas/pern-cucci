# Cucci (pern-cucci)

Minimalist and esoteric interpreted language written in TypeScript.

## Installation

```bash
npm install pern-cucci
```

## Usage

### As a Library

```typescript
import { runCucci } from 'pern-cucci';

const output = runCucci('.HelloWorld');
console.log(output); // "HelloWorld"
```

### CLI

If installed globally:
```bash
pern main.cucci
```

## Documentation

See [DOCS.md](./DOCS.md) for full language specification.
