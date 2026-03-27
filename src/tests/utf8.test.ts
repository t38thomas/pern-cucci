import test from 'node:test';
import * as assert from 'node:assert';
import { Environment } from '../environment';
import { Parser } from '../parser';

test('UTF-8 Support - Emoji identifiers', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    // Assignment with emoji identifier
    const stmt = parser.parseLine('😀10');
    assert.strictEqual(stmt.type, 'AssignStmt');
    if (stmt.type === 'AssignStmt') {
        assert.strictEqual(stmt.name, '😀');
        assert.strictEqual(stmt.value.type, 'NumberLiteral');
        if (stmt.value.type === 'NumberLiteral') {
            assert.strictEqual(stmt.value.value, 10);
        }
    }
});

test('UTF-8 Support - Emoji function names and params', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    // Function definition with emoji name and param
    const stmt = parser.parseLine('$🚀x:x*2');
    assert.strictEqual(stmt.type, 'FuncDefStmt');
    if (stmt.type === 'FuncDefStmt') {
        assert.strictEqual(stmt.name, '🚀');
        assert.deepStrictEqual(stmt.params, ['x']);
    }

    const stmt2 = parser.parseLine('$f💙:💙+1');
    if (stmt2.type === 'FuncDefStmt') {
        assert.strictEqual(stmt2.name, 'f');
        assert.deepStrictEqual(stmt2.params, ['💙']);
    }
});

test('UTF-8 Support - Emojis in strings', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    // String with emoji
    const stmt = parser.parseLine('SHello 😀');
    assert.strictEqual(stmt.type, 'AssignStmt');
    if (stmt.type === 'AssignStmt') {
        assert.strictEqual(stmt.name, 'S');
        assert.strictEqual(stmt.value.type, 'StringLiteral');
        if (stmt.value.type === 'StringLiteral') {
            assert.strictEqual(stmt.value.value, 'Hello 😀');
        }
    }
});

test('UTF-8 Support - Complex emojis (Family)', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    // 👨‍👩‍👧‍👦 is multiple code points but one grapheme cluster
    const stmt = parser.parseLine('👨‍👩‍👧‍👦100');
    assert.strictEqual(stmt.type, 'AssignStmt');
    if (stmt.type === 'AssignStmt') {
        assert.strictEqual(stmt.name, '👨‍👩‍👧‍👦');
        assert.strictEqual(stmt.value.type, 'NumberLiteral');
    }
});
