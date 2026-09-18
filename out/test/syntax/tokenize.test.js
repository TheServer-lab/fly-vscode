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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const vscode_textmate_1 = require("vscode-textmate");
const vscode_oniguruma_1 = require("vscode-oniguruma");
const wasmBin = fs.readFileSync(path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm'));
(0, vscode_oniguruma_1.loadWASM)(wasmBin.buffer);
const grammarJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../syntaxes/fly.tmLanguage.json'), 'utf8'));
let grammar;
before(async () => {
    const registry = new vscode_textmate_1.Registry({
        onigLib: Promise.resolve({
            createOnigScanner: (patterns) => (0, vscode_oniguruma_1.createOnigScanner)(patterns),
            createOnigString: (s) => (0, vscode_oniguruma_1.createOnigString)(s),
        }),
        loadGrammar: async () => grammarJson,
    });
    grammar = (await registry.loadGrammar('source.fly'));
});
const sampleLines = [
    '$ Hello world', // 0  line comment
    '$$ block $$', // 1  block comment
    'name = "Fly"', // 2  assignment + string
    'show("Hello {name}!")', // 3  string with interpolation
    'items = ["a", "b"]', // 4  array literal
    'show("val = {val + 1}")', // 5  interpolation with arithmetic
    'show("Hel{{lo}}")', // 6  escaped braces
    'score = num("10")', // 7  type name as builtin
    'hard max = 3', // 8  hard + numeric literal
    'if score > max {', // 9  if + comparison
    '    show("yes")', // 10 indented show
    '} orif score == EMP {', // 11 orif + EMP constant
    '    show("emp")', // 12
    '}', // 13 closing brace
    'x = band 5', // 14 bitwise keyword
    'if a and b {', // 15 logical keyword
    'group Person {', // 16 group declaration
    '    name', // 17 group field (plain identifier)
    '    age', // 18
    '    job introduce() {', // 19 job inside a group
    '        show("hello, i\'m " + self.name)', // 20 string + self member access
    '    }', // 21
    '}', // 22
    'group Employee from Person {', // 23 group with inheritance
    '    role', // 24
    '    job describe() {', // 25
    '        self.introduce()', // 26 self receiver + method call
    '        show(self.role)', // 27
    '    }', // 28
    '}', // 29
    'alice = Employee("alice", 55, "sr eng")', // 30 construction = ordinary call
    'wait 0.5', // 31 wait statement, decimal
    'wait .5', // 32 wait statement, leading-dot decimal
    'process.wait("cmd")', // 33 dotted API call (wait ≠ keyword here)
];
function findToken(tokens, offset) {
    return tokens.find(t => t.startIndex <= offset && t.endIndex > offset);
}
function tokenizeAll() {
    let ruleStack = undefined;
    const all = [];
    for (const line of sampleLines) {
        const result = grammar.tokenizeLine(line, ruleStack);
        all.push(result.tokens);
        ruleStack = result.ruleStack;
    }
    return all;
}
describe('syntax highlighting', () => {
    let lines;
    before(() => { lines = tokenizeAll(); });
    it('line comments start with $', () => {
        assert.ok(findToken(lines[0], 0)?.scopes.some(s => s.includes('comment.line.dollar.fly')));
    });
    it('block comments delimited by $$', () => {
        assert.ok(findToken(lines[1], 0)?.scopes.some(s => s.includes('comment.block.fly')));
    });
    it('assignment operator =', () => {
        assert.ok(findToken(lines[2], 5)?.scopes.some(s => s.includes('keyword.operator.assignment.fly')));
    });
    it('double-quoted string literal', () => {
        assert.ok(findToken(lines[2], 7)?.scopes.some(s => s.includes('string.quoted.double.fly')));
    });
    it('interpolation {…} inside a string', () => {
        assert.ok(findToken(lines[3], 12)?.scopes.some(s => s.includes('meta.interpolation.fly')));
    });
    it('keyword.other (show)', () => {
        assert.ok(findToken(lines[3], 0)?.scopes.some(s => s.includes('keyword.other.fly')));
    });
    it('array bracket [', () => {
        assert.ok(findToken(lines[4], 8)?.scopes.some(s => s.includes('punctuation.other.fly')));
    });
    it('type name num', () => {
        // line 7: 'score = num("10")' — num starts at offset 8
        assert.ok(findToken(lines[7], 8)?.scopes.some(s => s.includes('storage.type.fly')));
    });
    it('keyword.declaration (hard)', () => {
        assert.ok(findToken(lines[8], 0)?.scopes.some(s => s.includes('keyword.declaration.fly')));
    });
    it('numeric literal 3', () => {
        assert.ok(findToken(lines[8], 11)?.scopes.some(s => s.includes('constant.numeric.fly')));
    });
    it('keyword.control (if)', () => {
        assert.ok(findToken(lines[9], 0)?.scopes.some(s => s.includes('keyword.control.fly')));
    });
    it('comparison operator >', () => {
        assert.ok(findToken(lines[9], 9)?.scopes.some(s => s.includes('keyword.operator.comparison.fly')));
    });
    it('keyword.control (orif)', () => {
        assert.ok(findToken(lines[11], 2)?.scopes.some(s => s.includes('keyword.control.fly')));
    });
    it('constant.language (EMP)', () => {
        assert.ok(findToken(lines[11], 16)?.scopes.some(s => s.includes('constant.language.fly')));
    });
    it('keyword.operator.bitwise (band)', () => {
        assert.ok(findToken(lines[14], 4)?.scopes.some(s => s.includes('keyword.operator.bitwise.fly')));
    });
    it('keyword.operator.logical (and)', () => {
        assert.ok(findToken(lines[15], 5)?.scopes.some(s => s.includes('keyword.operator.logical.fly')));
    });
    it('arithmetic operator + inside interpolation', () => {
        // line 5: 'show("val = {val + 1}")' — + is at offset 17
        const token = findToken(lines[5], 17);
        assert.ok(token?.scopes.some(s => s.includes('keyword.operator.arithmetic.fly')));
    });
    it('keyword.declaration (group)', () => {
        assert.ok(findToken(lines[16], 0)?.scopes.some(s => s.includes('keyword.declaration.fly')));
    });
    it('entity.name.type (group name Person)', () => {
        assert.ok(findToken(lines[16], 6)?.scopes.some(s => s.includes('entity.name.type.fly')));
    });
    it('keyword.declaration (job inside group body)', () => {
        assert.ok(findToken(lines[19], 4)?.scopes.some(s => s.includes('keyword.declaration.fly')));
    });
    it('entity.name.type (group name Employee)', () => {
        assert.ok(findToken(lines[23], 6)?.scopes.some(s => s.includes('entity.name.type.fly')));
    });
    it('keyword.other (from)', () => {
        assert.ok(findToken(lines[23], 15)?.scopes.some(s => s.includes('keyword.other.fly')));
    });
    it('entity.name.type (inherited parent Person)', () => {
        assert.ok(findToken(lines[23], 20)?.scopes.some(s => s.includes('entity.name.type.fly')));
    });
    it('self is a receiver identifier, not a keyword', () => {
        // line 26: '        self.introduce()' — self at offset 8
        const token = findToken(lines[26], 8);
        assert.ok(token?.scopes.some(s => s.includes('variable.other.object.fly')));
        assert.ok(!token?.scopes.some(s => s.includes('keyword.')));
    });
    it('member name after dot is a property, not a keyword', () => {
        // line 20: '        show("hello, i\'m " + self.name)' — name at offset 34
        const token = findToken(lines[20], 34);
        assert.ok(token?.scopes.some(s => s.includes('variable.other.property.fly')));
        assert.ok(!token?.scopes.some(s => s.includes('keyword.')));
    });
    it('member access dot is punctuation.accessor', () => {
        // line 20 — dot between self (29) and name (34) is at offset 33
        assert.ok(findToken(lines[20], 33)?.scopes.some(s => s.includes('punctuation.accessor.fly')));
    });
    it('group construction is ordinary call syntax', () => {
        // line 30: Employee(...) — the type name is a plain identifier, not a keyword
        const token = findToken(lines[30], 8);
        assert.ok(token && !token.scopes.some(s => s.includes('keyword.')));
    });
    it('keyword.other (wait statement)', () => {
        assert.ok(findToken(lines[31], 0)?.scopes.some(s => s.includes('keyword.other.fly')));
    });
    it('decimal literal 0.5', () => {
        assert.ok(findToken(lines[31], 5)?.scopes.some(s => s.includes('constant.numeric.fly')));
    });
    it('leading-dot decimal .5 is a single numeric literal', () => {
        // line 32: 'wait .5' — '.' at offset 5, token must span both chars
        const token = findToken(lines[32], 5);
        assert.ok(token?.scopes.some(s => s.includes('constant.numeric.fly')));
        assert.strictEqual(token.startIndex, 5);
        assert.strictEqual(token.endIndex - token.startIndex, 2);
    });
    it('dotted API call member (process.wait) is a property, not the wait keyword', () => {
        // line 33: 'process.wait("cmd")' — process at 0, wait at 8
        assert.ok(findToken(lines[33], 0)?.scopes.some(s => s.includes('variable.other.object.fly')));
        const token = findToken(lines[33], 8);
        assert.ok(token?.scopes.some(s => s.includes('variable.other.property.fly')));
        assert.ok(!token?.scopes.some(s => s.includes('keyword.')));
    });
});
//# sourceMappingURL=tokenize.test.js.map