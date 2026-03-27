// src/api.ts
import { Environment } from './environment';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

/**
 * Runs Cucci source code and returns the captured output as a string.
 * Each output from the '.' operator is appended on a new line.
 * @param source The Cucci source code string.
 * @returns The cumulative output string.
 */
export function runCucci(source: string): string {
    const lines = source.split(/\r?\n/);
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop(); // EOF tolerance

    const env = new Environment();
    const parser = new Parser(env);
    let output = "";
    const interpreter = new Interpreter(env, (val) => {
        output += String(val) + "\n";
    });

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) continue; // In the API we might want to be more lenient or follow the same strictness

        const stmt = parser.parseLine(line);
        interpreter.execute(stmt);
    }

    return output.trim(); 
}
