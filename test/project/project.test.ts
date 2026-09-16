import * as assert from 'assert';
import { detectProject } from '../../src/project';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('project detection', () => {

    it('finds flylink.sleep in the same directory', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        fs.writeFileSync(path.join(tmp, 'flylink.sleep'), 'project');
        const file = path.join(tmp, 'main.fly');
        fs.writeFileSync(file, '');
        assert.strictEqual(detectProject(file), tmp);
        fs.rmSync(tmp, { recursive: true, force: true });
    });

    it('finds flylink.sleep in a parent directory', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        const sub = path.join(tmp, 'src');
        fs.mkdirSync(sub, { recursive: true });
        fs.writeFileSync(path.join(tmp, 'flylink.sleep'), 'project');
        const file = path.join(sub, 'main.fly');
        fs.writeFileSync(file, '');
        assert.strictEqual(detectProject(file), tmp);
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
        assert.strictEqual(detectProject(deepFile), undefined);
        fs.rmSync(dir, { recursive: true, force: true });
    });

    it('returns undefined when no flylink.sleep exists', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fly-'));
        const file = path.join(tmp, 'main.fly');
        fs.writeFileSync(file, '');
        assert.strictEqual(detectProject(file), undefined);
        fs.rmSync(tmp, { recursive: true, force: true });
    });
});
