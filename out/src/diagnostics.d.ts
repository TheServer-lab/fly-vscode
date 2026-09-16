export interface Diagnostic {
    file: string;
    line: number;
    column: number | undefined;
    message: string;
}
export declare const DIAGNOSTIC_REGEX: RegExp;
export declare function parseFlyDiagnostics(stderr: string): Diagnostic[];
