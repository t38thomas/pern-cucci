// src/cli.ts
import * as fs from 'fs';
import * as path from 'path';
import { Environment } from './environment';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { CucciSyntaxError, CucciRuntimeError } from './errors';

export function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: pern <file.cucci>");
        process.exit(1);
    }

    const filePath = path.resolve(args[0]);
    if (!fs.existsSync(filePath)) {
        console.error(`Critical Error: File '${filePath}' not found.`);
        process.exit(1);
    }

    const ext = path.extname(filePath);
    if (ext !== '.cucci') {
        console.error(`Critical Error: Source file must have .cucci extension.`);
        process.exit(1);
    }

    const source = fs.readFileSync(filePath, 'utf-8');
    const lines = source.split(/\r?\n/);
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop(); // EOF tolerance

    const env = new Environment();
    const parser = new Parser(env);
    const interpreter = new Interpreter(env);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) {
            console.error(`\n[CucciSyntaxError] line ${i+1}`);
            console.error(`Empty lines violate the Cucci specification.`);
            process.exit(1); 
        }

        try {
            const stmt = parser.parseLine(line);
            interpreter.execute(stmt);
        } catch (e: any) {
            if (e instanceof CucciSyntaxError || e instanceof CucciRuntimeError) {
                let msg = e.message.replace(/^(Syntax Error|Runtime Error)( at line \d+)?: /, '');
                console.error(`\n[${e.name}] line ${i+1} -> ${line}`);
                console.error(msg);
            } else {
                console.error(`\n[Fatal Inner Error at line ${i+1}] -> ${line}`);
                console.error(e.stack || e.message);
            }
            process.exit(1);
        }
    }
}
