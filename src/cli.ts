import * as path from 'path';

export type Action = 'build' | 'run' | 'buildAndRun';

export interface CommandPlan {
    exe:  string;
    args: string[];
}

export function planCommands(opts: {
    action:      Action;
    isProject:   boolean;
    filePath?:   string;
    projectRoot?:string;
    flyExe:      string;
}): CommandPlan[] {
    const { action, isProject, filePath, flyExe } = opts;

    if (isProject) {
        if (action === 'build') return [{ exe: flyExe, args: ['-build'] }];
        // -run rebuilds when stale; plain -run covers both Run and Build-and-Run
        if (action === 'run' || action === 'buildAndRun')
            return [{ exe: flyExe, args: ['-run'] }];
    }

    // Standalone file
    if (!filePath) throw new Error('filePath is required for standalone builds');

    const stemPath = path.join(
        path.dirname(filePath),
        path.basename(filePath, path.extname(filePath))
    );
    const o = ['-o', stemPath];

    if (action === 'build')
        return [{ exe: flyExe, args: ['-compile', filePath, '-finish', ...o] }];
    if (action === 'run')
        return [{ exe: flyExe, args: ['-compile', filePath, '-run',   ...o] }];
    if (action === 'buildAndRun')
        return [{ exe: flyExe, args: ['-compile', filePath, '-done',  ...o] }];

    throw new Error('unknown action');
}
