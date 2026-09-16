import * as assert from 'assert';
import { parseFlyDiagnostics, DIAGNOSTIC_REGEX } from '../../src/diagnostics';

describe('diagnostics', () => {

    it('parses a lex error with column', () => {
        const d = parseFlyDiagnostics('hello.fly:3:5: lex error: unexpected character')[0];
        assert.strictEqual(d.file,    'hello.fly');
        assert.strictEqual(d.line,    2);
        assert.strictEqual(d.column,  4);
        assert.strictEqual(d.message, 'unexpected character');
    });

    it('parses a parse error without column', () => {
        const d = parseFlyDiagnostics('a.fly:10: parse error: expected grab')[0];
        assert.strictEqual(d.line,    9);
        assert.strictEqual(d.column,  undefined);
        assert.strictEqual(d.message, 'expected grab');
    });

    it('parses a sema/driver error (bare "error:")', () => {
        const d = parseFlyDiagnostics('sema.fly:3: error: cannot reassign hard variable')[0];
        assert.strictEqual(d.line,    2);
        assert.strictEqual(d.column,  undefined);
        assert.strictEqual(d.message, 'cannot reassign hard variable');
    });

    it('parses a codegen error with column', () => {
        const d = parseFlyDiagnostics('out.fly:2:3: codegen error: bad')[0];
        assert.strictEqual(d.line,    1);
        assert.strictEqual(d.column,  2);
        assert.strictEqual(d.message, 'bad');
    });

    it('ignores non-diagnostic lines (launcher output, fly-cc trailer)', () => {
        const res = parseFlyDiagnostics(
            'fly: -build: compilation failed (fly-cc exited 1)\n' +
            'fly-cc: compilation aborted due to the above error(s)'
        );
        assert.strictEqual(res.length, 0);
    });

    it('parses multiple diagnostics from a single block', () => {
        const res = parseFlyDiagnostics(
            'a.fly:1:2: lex error: bad\n' +
            'b.fly:5: parse error: nope\n' +
            'c.fly:7: error: sema issue'
        );
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0].file, 'a.fly');
        assert.strictEqual(res[1].file, 'b.fly');
        assert.strictEqual(res[2].file, 'c.fly');
    });

    it('DIAGNOSTIC_REGEX matches real compiler lines', () => {
        assert.ok(   DIAGNOSTIC_REGEX.test('file:1:2: lex error: bad'));
        assert.ok(   DIAGNOSTIC_REGEX.test('file:5: parse error: bad'));
        assert.ok(   DIAGNOSTIC_REGEX.test('file:5:3: codegen error: bad'));
        assert.ok(   DIAGNOSTIC_REGEX.test('file:2: error: bad'));
        assert.ok(  !DIAGNOSTIC_REGEX.test('fly-cc: compilation aborted due to the above error(s)'));
        assert.ok(  !DIAGNOSTIC_REGEX.test('fly: -build: compilation failed (fly-cc exited 1)'));
    });
});
