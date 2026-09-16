import * as fs       from 'fs';
import * as path     from 'path';
import { execSync, spawnSync } from 'child_process';
import { parseFlyDiagnostics } from '../../src/diagnostics';

const flyRepoRoot = path.resolve(__dirname, '..', '..', '..', '..', 'fly');
const flyWinExe   = path.join(flyRepoRoot, 'build-windows', 'fly.exe');
const fly         = fs.existsSync(flyWinExe) ? flyWinExe : 'fly';

const tmp         = fs.mkdtempSync(path.join(require('os').tmpdir(), 'fly-ext-'));
const isWin       = process.platform === 'win32';
let failures      = 0;

function assert(cond: boolean, msg: string) {
    if (!cond) { console.error('FAIL: ' + msg); failures++; }
}

// ---- Standalone build ----
try {
    const src  = path.join(tmp, 'hello.fly');
    const stem = path.join(tmp, 'hello');
    fs.writeFileSync(src, 'show("Hello from fly-vscode!")');
    execSync(`"${fly}" -compile "${src}" -finish -o "${stem}"`, { stdio: 'pipe' });
    const exe = isWin ? stem + '.exe' : stem;
    assert(fs.existsSync(exe), 'standalone artifact should exist');
    console.log('standalone build   OK');
} catch (e: any) {
    console.error('standalone build   FAILED', e.message);
    failures++;
}

// ---- Project build ----
try {
    const proj = path.join(tmp, 'proj');
    fs.mkdirSync(path.join(proj, 'src'), { recursive: true });
    fs.writeFileSync(path.join(proj, 'flylink.sleep'),
        'project\nname "test"\nversion "0.1.0"\nsource "src/main.fly"\noutput "bin/test"');
    fs.writeFileSync(path.join(proj, 'src', 'main.fly'), 'show("project build OK")');
    execSync(`"${fly}" -build`, { cwd: proj, stdio: 'pipe' });
    const out = isWin
        ? path.join(proj, 'bin', 'test.exe')
        : path.join(proj, 'bin', 'test');
    assert(fs.existsSync(out), 'project artifact should exist');
    console.log('project build     OK');
} catch (e: any) {
    console.error('project build     FAILED', e.message);
    failures++;
}

// ---- Diagnostics parser against real compiler output ----
try {
    const errSrc = path.join(tmp, 'err.fly');
    fs.writeFileSync(errSrc, 'x = grabe');
    const r = spawnSync(fly, ['-compile', errSrc, '-o', path.join(tmp, 'err_out')],
        { encoding: 'utf8' });
    const stderr: string = r.stderr || '';
    const diags = parseFlyDiagnostics(stderr);
    assert(diags.length >= 1, 'should parse at least one diagnostic from grabe error');
    if (diags.length >= 1) {
        assert(diags[0].message.toLowerCase().includes('grabe'),
            'message should reference grabe');
        console.log('diagnostics parse OK');
    }
} catch (e: any) {
    console.error('diagnostics parse  FAILED', e.message);
    failures++;
}

// ---- CLI integration ----
try {
    const { planCommands } = require('../../src/cli');
    const plans = planCommands({ action: 'build', isProject: true, flyExe: fly });
    assert(plans.length === 1 && plans[0].args[0] === '-build', 'cli planCommands works');
    console.log('cli planCommands  OK');
} catch (e: any) {
    console.error('cli planCommands  FAILED', e.message);
    failures++;
}

// ---- Cleanup ----
fs.rmSync(tmp, { recursive: true, force: true });

if (failures > 0) {
    console.error(`\n${failures} integration test(s) FAILED`);
    process.exit(1);
}
console.log('\nAll integration tests PASSED');
