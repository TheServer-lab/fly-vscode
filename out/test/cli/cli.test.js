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
const cli_1 = require("../../src/cli");
describe('CLI argument building', () => {
    it('project build returns -build', () => {
        const p = (0, cli_1.planCommands)({ action: 'build', isProject: true, flyExe: 'fly' });
        assert.deepStrictEqual(p, [{ exe: 'fly', args: ['-build'] }]);
    });
    it('project run returns -run', () => {
        const p = (0, cli_1.planCommands)({ action: 'run', isProject: true, flyExe: 'fly' });
        assert.deepStrictEqual(p, [{ exe: 'fly', args: ['-run'] }]);
    });
    it('project buildAndRun also returns -run (rebuilds when stale)', () => {
        const p = (0, cli_1.planCommands)({ action: 'buildAndRun', isProject: true, flyExe: 'fly' });
        assert.deepStrictEqual(p, [{ exe: 'fly', args: ['-run'] }]);
    });
    it('standalone build uses -compile ... -finish', () => {
        const p = (0, cli_1.planCommands)({
            action: 'build', isProject: false,
            filePath: 'C:\\src\\main.fly', flyExe: 'C:\\bin\\fly.exe',
        });
        assert.deepStrictEqual(p, [{
                exe: 'C:\\bin\\fly.exe',
                args: ['-compile', 'C:\\src\\main.fly', '-finish', '-o', 'C:\\src\\main'],
            }]);
    });
    it('standalone run uses -compile ... -run', () => {
        const p = (0, cli_1.planCommands)({
            action: 'run', isProject: false,
            filePath: 'C:\\src\\main.fly', flyExe: 'C:\\bin\\fly.exe',
        });
        assert.deepStrictEqual(p, [{
                exe: 'C:\\bin\\fly.exe',
                args: ['-compile', 'C:\\src\\main.fly', '-run', '-o', 'C:\\src\\main'],
            }]);
    });
    it('standalone buildAndRun uses -compile ... -done', () => {
        const p = (0, cli_1.planCommands)({
            action: 'buildAndRun', isProject: false,
            filePath: 'C:\\project\\app.fly', flyExe: 'fly',
        });
        assert.deepStrictEqual(p, [{
                exe: 'fly',
                args: ['-compile', 'C:\\project\\app.fly', '-done', '-o', 'C:\\project\\app'],
            }]);
    });
    it('throws when filePath is missing for standalone builds', () => {
        assert.throws(() => (0, cli_1.planCommands)({ action: 'build', isProject: false, flyExe: 'fly' }), /filePath is required/);
    });
    it('respects the executable override setting', () => {
        const p = (0, cli_1.planCommands)({
            action: 'build', isProject: true,
            flyExe: '/opt/fly/bin/fly',
        });
        assert.strictEqual(p[0].exe, '/opt/fly/bin/fly');
    });
});
//# sourceMappingURL=cli.test.js.map