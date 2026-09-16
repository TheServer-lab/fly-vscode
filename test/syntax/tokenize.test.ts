import * as fs   from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { Registry, IToken, IGrammar } from 'vscode-textmate';
import { loadWASM, createOnigScanner, createOnigString } from 'vscode-oniguruma';

const wasmBin = fs.readFileSync(
    path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm')
);
loadWASM(wasmBin.buffer);

const grammarJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../syntaxes/fly.tmLanguage.json'), 'utf8')
);

let grammar: IGrammar;

before(async () => {
    const registry = new Registry({
        onigLib: Promise.resolve({
            createOnigScanner: (patterns: string[]) => createOnigScanner(patterns),
            createOnigString:  (s: string)          => createOnigString(s),
        }),
        loadGrammar: async () => grammarJson,
    });
    grammar = (await registry.loadGrammar('source.fly'))!;
});

const sampleLines = [
    '$ Hello world',                    // 0  line comment
    '$$ block $$',                      // 1  block comment
    'name = "Fly"',                     // 2  assignment + string
    'show("Hello {name}!")',            // 3  string with interpolation
    'items = ["a", "b"]',               // 4  array literal
    'show("val = {val + 1}")',          // 5  interpolation with arithmetic
    'show("Hel{{lo}}")',                // 6  escaped braces
    'score = num("10")',                // 7  type name as builtin
    'hard max = 3',                     // 8  hard + numeric literal
    'if score > max {',                 // 9  if + comparison
    '    show("yes")',                  // 10 indented show
    '} orif score == EMP {',            // 11 orif + EMP constant
    '    show("emp")',                  // 12
    '}',                                // 13 closing brace
    'x = band 5',                       // 14 bitwise keyword
    'if a and b {',                     // 15 logical keyword
];

function findToken(tokens: IToken[], offset: number): IToken | undefined {
    return tokens.find(t => t.startIndex <= offset && t.endIndex > offset);
}

function tokenizeAll(): IToken[][] {
    let ruleStack: any = undefined;
    const all: IToken[][] = [];
    for (const line of sampleLines) {
        const result = grammar.tokenizeLine(line, ruleStack);
        all.push(result.tokens);
        ruleStack = result.ruleStack;
    }
    return all;
}

describe('syntax highlighting', () => {
    let lines: IToken[][];

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
});
