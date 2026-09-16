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
const project_1 = require("../../src/project");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
describe('project detection', () => {
    it('finds flylink.sleep in the same directory', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        fs.writeFileSync(path.join(tmp, 'flylink.sleep'), 'project');
        const file = path.join(tmp, 'main.fly');
        fs.writeFileSync(file, '');
        assert.strictEqual((0, project_1.detectProject)(file), tmp);
        fs.rmSync(tmp, { recursive: true, force: true });
    });
    it('finds flylink.sleep in a parent directory', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        const sub = path.join(tmp, 'src');
        fs.mkdirSync(sub, { recursive: true });
        fs.writeFileSync(path.join(tmp, 'flylink.sleep'), 'project');
        const file = path.join(sub, 'main.fly');
        fs.writeFileSync(file, '');
        assert.strictEqual((0, project_1.detectProject)(file), tmp);
        fs.rmSync(tmp, { recursive: true, force: true });
    });
    it('does not look beyond 8 levels', () => {
        let dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        let cur = dir;
        for (let i = 0; i < 9; i++) {
            cur = path.join(cur, 'd');
            fs.mkdirSync(cur, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, 'flylink.sleep'), 'project');
        const deepFile = path.join(cur, 'main.fly');
        fs.writeFileSync(deepFile, '');
        assert.strictEqual((0, project_1.detectProject)(deepFile), undefined);
        fs.rmSync(dir, { recursive: true, force: true });
    });
    it('returns undefined when no flylink.sleep exists', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        const file = path.join(tmp, 'main.fly');
        fs.writeFileSync(file, '');
        assert.strictEqual((0, project_1.detectProject)(file), undefined);
        fs.rmSync(tmp, { recursive: true, force: true });
    });
});
//# sourceMappingURL=project.test.js.map