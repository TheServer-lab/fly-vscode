import * as fs from 'fs';
import * as path from 'path';

export function detectProject(filePath: string): string | undefined {
    let dir = path.dirname(filePath);
    for (let i = 0; i < 8; i++) {
        if (fs.existsSync(path.join(dir, 'flylink.sleep'))) return dir;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return undefined;
}
