import * as vscode from 'vscode';

export function registerTaskProvider(): vscode.Disposable {
    return vscode.tasks.registerTaskProvider('fly', {
        provideTasks(): vscode.Task[] {
            const folder = vscode.workspace.workspaceFolders?.[0];
            if (!folder) return [];

            const flyExe = vscode.workspace.getConfiguration('fly')
                              .get<string>('executable', 'fly')!;
            const cwd    = folder.uri.fsPath;
            const problemMatchers = ['$fly.CompilerError'];

            return [
                new vscode.Task(
                    { type: 'fly', action: 'build' },
                    folder, 'Fly: Build', 'fly',
                    new vscode.ProcessExecution(flyExe, ['-build'], { cwd }),
                    problemMatchers),
                new vscode.Task(
                    { type: 'fly', action: 'run' },
                    folder, 'Fly: Run', 'fly',
                    new vscode.ProcessExecution(flyExe, ['-run'], { cwd }),
                    problemMatchers),
                new vscode.Task(
                    { type: 'fly', action: 'buildAndRun' },
                    folder, 'Fly: Build and Run', 'fly',
                    new vscode.ProcessExecution(flyExe, ['-run'], { cwd }),
                    problemMatchers),
            ];
        },
        resolveTask(task) { return task; },
    });
}
