import * as assert from 'assert';
import { planCommands } from '../../src/cli';
import * as path from 'path';

describe('CLI argument building', () => {

    it('project build returns -build', () => {
        const p = planCommands({ action: 'build', isProject: true, flyExe: 'fly' });
        assert.deepStrictEqual(p, [{ exe: 'fly', args: ['-build'] }]);
    });

    it('project run returns -run', () => {
        const p = planCommands({ action: 'run', isProject: true, flyExe: 'fly' });
        assert.deepStrictEqual(p, [{ exe: 'fly', args: ['-run'] }]);
    });

    it('project buildAndRun also returns -run (rebuilds when stale)', () => {
        const p = planCommands({ action: 'buildAndRun', isProject: true, flyExe: 'fly' });
        assert.deepStrictEqual(p, [{ exe: 'fly', args: ['-run'] }]);
    });

    it('standalone build uses -compile ... -finish', () => {
        const p = planCommands({
            action: 'build', isProject: false,
            filePath: 'C:\\src\\main.fly', flyExe: 'C:\\bin\\fly.exe',
        });
        assert.deepStrictEqual(p, [{
            exe: 'C:\\bin\\fly.exe',
            args: ['-compile', 'C:\\src\\main.fly', '-finish', '-o', 'C:\\src\\main'],
        }]);
    });

    it('standalone run uses -compile ... -run', () => {
        const p = planCommands({
            action: 'run', isProject: false,
            filePath: 'C:\\src\\main.fly', flyExe: 'C:\\bin\\fly.exe',
        });
        assert.deepStrictEqual(p, [{
            exe: 'C:\\bin\\fly.exe',
            args: ['-compile', 'C:\\src\\main.fly', '-run', '-o', 'C:\\src\\main'],
        }]);
    });

    it('standalone buildAndRun uses -compile ... -done', () => {
        const p = planCommands({
            action: 'buildAndRun', isProject: false,
            filePath: 'C:\\project\\app.fly', flyExe: 'fly',
        });
        assert.deepStrictEqual(p, [{
            exe: 'fly',
            args: ['-compile', 'C:\\project\\app.fly', '-done', '-o', 'C:\\project\\app'],
        }]);
    });

    it('throws when filePath is missing for standalone builds', () => {
        assert.throws(() =>
            planCommands({ action: 'build', isProject: false, flyExe: 'fly' }),
            /filePath is required/
        );
    });

    it('respects the executable override setting', () => {
        const p = planCommands({
            action: 'build', isProject: true,
            flyExe: '/opt/fly/bin/fly',
        });
        assert.strictEqual(p[0].exe, '/opt/fly/bin/fly');
    });
});
