import test from 'node:test';
import * as assert from 'node:assert';
import { Environment } from '../environment';
import { Interpreter } from '../interpreter';
import { Parser } from '../parser';
import { CucciRuntimeError } from '../errors';

test('Interpreter - Basic Arithmetic', () => {
    const env = new Environment();
    const interpreter = new Interpreter(env);
    const parser = new Parser(env);
    
    interpreter.execute(parser.parseLine('A1+2*3'));
    assert.strictEqual(env.getVariable('A'), 7);
});

test('Interpreter - NaN Exception Propagation Prevention', () => {
    const env = new Environment();
    const interpreter = new Interpreter(env);
    const parser = new Parser(env);
    
    const stmt = parser.parseLine('Ahello');
    interpreter.execute(stmt);
    assert.strictEqual(env.getVariable('A'), 'hello');

    const stmt2 = parser.parseLine('BA-5');
    assert.throws(() => {
        interpreter.execute(stmt2);
    }, (err: Error) => err instanceof CucciRuntimeError && err.message.includes('Invalid numeric conversion'),
    "Should throw Runtime Error for NaN");
});

test('Interpreter - Call stack overflow protection', () => {
    const env = new Environment();
    const interpreter = new Interpreter(env);
    const parser = new Parser(env);
    
    // Infinite recursion: f calls f
    interpreter.execute(parser.parseLine('$f:f'));
    
    assert.throws(() => {
        interpreter.execute(parser.parseLine('Af'));
    }, (err: Error) => err instanceof CucciRuntimeError && err.message.includes('Maximum call stack size'), 
    "Should prevent stack overflow");
});
