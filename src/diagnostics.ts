export interface Diagnostic {
    file:   string;
    line:   number;
    column: number | undefined;
    message: string;
}

export const DIAGNOSTIC_REGEX =
    /^(.+?):(\d+)(?::(\d+))?: (?:lex |parse |codegen )?error: (.*)$/;

export function parseFlyDiagnostics(stderr: string): Diagnostic[] {
    const results: Diagnostic[] = [];
    for (const raw of stderr.split(/\r?\n/)) {
        const m = DIAGNOSTIC_REGEX.exec(raw);
        if (!m) continue;
        results.push({
            file:   m[1],
            line:   Number(m[2]) - 1,
            column: m[3] !== undefined ? Number(m[3]) - 1 : undefined,
            message: m[4],
        });
    }
    return results;
}
