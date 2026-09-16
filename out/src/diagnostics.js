"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIAGNOSTIC_REGEX = void 0;
exports.parseFlyDiagnostics = parseFlyDiagnostics;
exports.DIAGNOSTIC_REGEX = /^(.+?):(\d+)(?::(\d+))?: (?:lex |parse |codegen )?error: (.*)$/;
function parseFlyDiagnostics(stderr) {
    const results = [];
    for (const raw of stderr.split(/\r?\n/)) {
        const m = exports.DIAGNOSTIC_REGEX.exec(raw);
        if (!m)
            continue;
        results.push({
            file: m[1],
            line: Number(m[2]) - 1,
            column: m[3] !== undefined ? Number(m[3]) - 1 : undefined,
            message: m[4],
        });
    }
    return results;
}
//# sourceMappingURL=diagnostics.js.map