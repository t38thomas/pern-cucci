import test from 'node:test';
import * as assert from 'node:assert';
import { Environment } from '../environment';
import { Parser } from '../parser';
import { CucciSyntaxError } from '../errors';

test('Parser - Throws on incomplete assignment', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    assert.throws(() => {
        parser.parseLine('+');
    }, CucciSyntaxError);
});

test('Parser - Assignment structure', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    const stmt = parser.parseLine('A10');
    assert.strictEqual(stmt.type, 'AssignStmt');
    if (stmt.type === 'AssignStmt') {
        assert.strictEqual(stmt.name, 'A');
        assert.strictEqual(stmt.value.type, 'NumberLiteral');
        if (stmt.value.type === 'NumberLiteral') {
            assert.strictEqual(stmt.value.value, 10);
        }
    }
});

test('Parser - Function definition', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    const stmt = parser.parseLine('$fxy:x+y');
    assert.strictEqual(stmt.type, 'FuncDefStmt');
    if (stmt.type === 'FuncDefStmt') {
        assert.strictEqual(stmt.name, 'f');
        assert.deepStrictEqual(stmt.params, ['x', 'y']);
    }
});
