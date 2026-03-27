import test from 'node:test';
import * as assert from 'node:assert';
import { Environment } from './src/environment';
import { Parser } from './src/parser';
import { CucciSyntaxError } from './src/errors';

test('Reproduction: Emoji identifiers break current parser', () => {
    const env = new Environment();
    const parser = new Parser(env);
    
    // 😀 is one grapheme cluster, but two UTF-16 code units.
    assert.throws(() => {
        parser.parseLine('😀10');
    }, /Unresolvable token/); // It will likely fail to parse the second half of the emoji
});
