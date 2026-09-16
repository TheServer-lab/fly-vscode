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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const cli_1 = require("./cli");
const project_1 = require("./project");
const tasks_1 = require("./tasks");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('fly.build', () => runFlyAction('build')), vscode.commands.registerCommand('fly.run', () => runFlyAction('run')), vscode.commands.registerCommand('fly.buildAndRun', () => runFlyAction('buildAndRun')), (0, tasks_1.registerTaskProvider)());
}
async function runFlyAction(action) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('Open a .fly file to build or run.');
        return;
    }
    const filePath = editor.document.uri.fsPath;
    const flyExe = vscode.workspace.getConfiguration('fly')
        .get('executable', 'fly');
    const projectRoot = (0, project_1.detectProject)(filePath);
    const isProject = !!projectRoot;
    const plans = (0, cli_1.planCommands)({ action, isProject, filePath, projectRoot, flyExe });
    const cwd = projectRoot || path.dirname(filePath);
    for (const plan of plans) {
        const task = new vscode.Task({ type: 'fly', action, filePath }, vscode.workspace.workspaceFolders?.[0], 'Fly: ' + capitalize(action), 'fly', new vscode.ProcessExecution(plan.exe, plan.args, { cwd }), ['$fly.CompilerError']);
        vscode.tasks.executeTask(task);
    }
}
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map