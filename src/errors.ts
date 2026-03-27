// src/errors.ts

export class CucciSyntaxError extends Error {
    constructor(message: string, public readonly line?: number) {
        super(line ? `Syntax Error at line ${line}: ${message}` : `Syntax Error: ${message}`);
        this.name = 'CucciSyntaxError';
        // Set the prototype explicitly for correct instanceof checks in TypeScript
        Object.setPrototypeOf(this, CucciSyntaxError.prototype);
    }
}

export class CucciRuntimeError extends Error {
    constructor(message: string, public readonly line?: number) {
        super(line ? `Runtime Error at line ${line}: ${message}` : `Runtime Error: ${message}`);
        this.name = 'CucciRuntimeError';
        // Set the prototype explicitly for correct instanceof checks in TypeScript
        Object.setPrototypeOf(this, CucciRuntimeError.prototype);
    }
}
