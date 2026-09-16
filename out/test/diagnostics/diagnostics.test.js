"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const diagnostics_1 = require("../../src/diagnostics");
describe('diagnostics', () => {
    it('parses a lex error with column', () => {
        const d = (0, diagnostics_1.parseFlyDiagnostics)('hello.fly:3:5: lex error: unexpected character')[0];
        assert.strictEqual(d.file, 'hello.fly');
        assert.strictEqual(d.line, 2);
        assert.strictEqual(d.column, 4);
        assert.strictEqual(d.message, 'unexpected character');
    });
    it('parses a parse error without column', () => {
        const d = (0, diagnostics_1.parseFlyDiagnostics)('a.fly:10: parse error: expected grab')[0];
        assert.strictEqual(d.line, 9);
        assert.strictEqual(d.column, undefined);
        assert.strictEqual(d.message, 'expected grab');
    });
    it('parses a sema/driver error (bare "error:")', () => {
        const d = (0, diagnostics_1.parseFlyDiagnostics)('sema.fly:3: error: cannot reassign hard variable')[0];
        assert.strictEqual(d.line, 2);
        assert.strictEqual(d.column, undefined);
        assert.strictEqual(d.message, 'cannot reassign hard variable');
    });
    it('parses a codegen error with column', () => {
        const d = (0, diagnostics_1.parseFlyDiagnostics)('out.fly:2:3: codegen error: bad')[0];
        assert.strictEqual(d.line, 1);
        assert.strictEqual(d.column, 2);
        assert.strictEqual(d.message, 'bad');
    });
    it('ignores non-diagnostic lines (launcher output, fly-cc trailer)', () => {
        const res = (0, diagnostics_1.parseFlyDiagnostics)('fly: -build: compilation failed (fly-cc exited 1)\n' +
            'fly-cc: compilation aborted due to the above error(s)');
        assert.strictEqual(res.length, 0);
    });
    it('parses multiple diagnostics from a single block', () => {
        const res = (0, diagnostics_1.parseFlyDiagnostics)('a.fly:1:2: lex error: bad\n' +
            'b.fly:5: parse error: nope\n' +
            'c.fly:7: error: sema issue');
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0].file, 'a.fly');
        assert.strictEqual(res[1].file, 'b.fly');
        assert.strictEqual(res[2].file, 'c.fly');
    });
    it('DIAGNOSTIC_REGEX matches real compiler lines', () => {
        assert.ok(diagnostics_1.DIAGNOSTIC_REGEX.test('file:1:2: lex error: bad'));
        assert.ok(diagnostics_1.DIAGNOSTIC_REGEX.test('file:5: parse error: bad'));
        assert.ok(diagnostics_1.DIAGNOSTIC_REGEX.test('file:5:3: codegen error: bad'));
        assert.ok(diagnostics_1.DIAGNOSTIC_REGEX.test('file:2: error: bad'));
        assert.ok(!diagnostics_1.DIAGNOSTIC_REGEX.test('fly-cc: compilation aborted due to the above error(s)'));
        assert.ok(!diagnostics_1.DIAGNOSTIC_REGEX.test('fly: -build: compilation failed (fly-cc exited 1)'));
    });
});
//# sourceMappingURL=diagnostics.test.js.map