export type Action = 'build' | 'run' | 'buildAndRun';
export interface CommandPlan {
    exe: string;
    args: string[];
}
export declare function planCommands(opts: {
    action: Action;
    isProject: boolean;
    filePath?: string;
    projectRoot?: string;
    flyExe: string;
}): CommandPlan[];
