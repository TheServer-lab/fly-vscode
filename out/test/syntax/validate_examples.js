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
const vscode_textmate_1 = require("vscode-textmate");
const vscode_oniguruma_1 = require("vscode-oniguruma");
const wasmBin = fs.readFileSync(path.join(path.dirname(require.resolve('vscode-oniguruma')), 'onig.wasm'));
const grammarJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../syntaxes/fly.tmLanguage.json'), 'utf8'));
async function main() {
    await (0, vscode_oniguruma_1.loadWASM)(wasmBin.buffer);
    const registry = new vscode_textmate_1.Registry({
        onigLib: Promise.resolve({
            createOnigScanner: (patterns) => (0, vscode_oniguruma_1.createOnigScanner)(patterns),
            createOnigString: (s) => (0, vscode_oniguruma_1.createOnigString)(s),
        }),
        loadGrammar: async () => grammarJson,
    });
    const grammar = (await registry.loadGrammar('source.fly'));
    // Use the real Fly repo's examples as a corpus
    const examplesDir = path.resolve(__dirname, '../../../../fly/examples');
    const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.fly'));
    let ok = 0;
    let fail = 0;
    let ruleStack = undefined;
    for (const file of files) {
        const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
        const lines = content.split(/\r?\n/);
        try {
            for (const line of lines) {
                const result = grammar.tokenizeLine(line, ruleStack);
                ruleStack = result.ruleStack;
            }
            ok++;
        }
        catch (e) {
            fail++;
            console.error('tokenize error in', file, e);
        }
    }
    console.log(`Validated grammar against ${ok} real examples (${fail} failures).`);
    if (fail > 0)
        process.exit(1);
}
main();
//# sourceMappingURL=validate_examples.js.map