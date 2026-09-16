import * as vscode from 'vscode';
import * as path  from 'path';
import { planCommands, Action } from './cli';
import { detectProject }        from './project';
import { registerTaskProvider } from './tasks';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('fly.build',       () => runFlyAction('build')),
        vscode.commands.registerCommand('fly.run',         () => runFlyAction('run')),
        vscode.commands.registerCommand('fly.buildAndRun', () => runFlyAction('buildAndRun')),
        registerTaskProvider(),
    );
}

async function runFlyAction(action: Action) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('Open a .fly file to build or run.');
        return;
    }

    const filePath   = editor.document.uri.fsPath;
    const flyExe     = vscode.workspace.getConfiguration('fly')
                           .get<string>('executable', 'fly')!;
    const projectRoot = detectProject(filePath);
    const isProject   = !!projectRoot;

    const plans = planCommands({ action, isProject, filePath, projectRoot, flyExe });
    const cwd   = projectRoot || path.dirname(filePath);

    for (const plan of plans) {
        const task = new vscode.Task(
            { type: 'fly', action, filePath },
            vscode.workspace.workspaceFolders?.[0]!,
            'Fly: ' + capitalize(action),
            'fly',
            new vscode.ProcessExecution(plan.exe, plan.args, { cwd }),
            ['$fly.CompilerError'],
        );
        vscode.tasks.executeTask(task);
    }
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function deactivate() {}
