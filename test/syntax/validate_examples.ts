import * as fs from 'fs';
import * as path from 'path';
import { Registry, IToken } from 'vscode-textmate';
import { loadWASM, createOnigScanner, createOnigString } from 'vscode-oniguruma';

const wasmBin = fs.readFileSync(
    path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm')
);

const grammarJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../../syntaxes/fly.tmLanguage.json'), 'utf8')
);

async function main() {
    await loadWASM(wasmBin.buffer);

    const registry = new Registry({
        onigLib: Promise.resolve({
            createOnigScanner: (patterns: string[]) => createOnigScanner(patterns),
            createOnigString:  (s: string)          => createOnigString(s),
        }),
        loadGrammar: async () => grammarJson,
    });
    const grammar = (await registry.loadGrammar('source.fly'))!;

    // Use the real Fly repo's examples as a corpus
    const examplesDir = path.resolve(__dirname, '../../../../fly/examples');
    const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.fly'));

    let ok = 0;
    let fail = 0;
    let ruleStack: any = undefined;

    for (const file of files) {
        const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
        const lines = content.split(/\r?\n/);
        try {
            for (const line of lines) {
                const result: { tokens: IToken[]; ruleStack: any } =
                    grammar.tokenizeLine(line, ruleStack);
                ruleStack = result.ruleStack;
            }
            ok++;
        } catch (e) {
            fail++;
            console.error('tokenize error in', file, e);
        }
    }
    console.log(`Validated grammar against ${ok} real examples (${fail} failures).`);
    if (fail > 0) process.exit(1);
}

main();