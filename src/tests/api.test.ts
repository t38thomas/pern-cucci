import { test } from 'node:test';
import assert from 'node:assert';
import { runCucci } from '../api';

test('runCucci captures and returns interpreter output', () => {
    const code = [
        'a5',
        'b10',
        '.(a+b)',
        '.HelloWorld'
    ].join('\n');

    const result = runCucci(code);
    const expected = "15\nHelloWorld";
    
    assert.strictEqual(result, expected);
});

test('runCucci handles multiple expressions and empty lines', () => {
    const code = [
        'x42',
        '',
        '.x',
        'yx*2',
        '.y',
        ''
    ].join('\n');

    const result = runCucci(code);
    const expected = "42\n84";
    
    assert.strictEqual(result, expected);
});
