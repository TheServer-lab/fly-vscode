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
exports.registerTaskProvider = registerTaskProvider;
const vscode = __importStar(require("vscode"));
function registerTaskProvider() {
    return vscode.tasks.registerTaskProvider('fly', {
        provideTasks() {
            const folder = vscode.workspace.workspaceFolders?.[0];
            if (!folder)
                return [];
            const flyExe = vscode.workspace.getConfiguration('fly')
                .get('executable', 'fly');
            const cwd = folder.uri.fsPath;
            const problemMatchers = ['$fly.CompilerError'];
            return [
                new vscode.Task({ type: 'fly', action: 'build' }, folder, 'Fly: Build', 'fly', new vscode.ProcessExecution(flyExe, ['-build'], { cwd }), problemMatchers),
                new vscode.Task({ type: 'fly', action: 'run' }, folder, 'Fly: Run', 'fly', new vscode.ProcessExecution(flyExe, ['-run'], { cwd }), problemMatchers),
                new vscode.Task({ type: 'fly', action: 'buildAndRun' }, folder, 'Fly: Build and Run', 'fly', new vscode.ProcessExecution(flyExe, ['-run'], { cwd }), problemMatchers),
            ];
        },
        resolveTask(task) { return task; },
    });
}
//# sourceMappingURL=tasks.js.map