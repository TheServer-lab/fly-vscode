"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.planCommands = planCommands;
const path = __importStar(require("path"));
function planCommands(opts) {
    const { action, isProject, filePath, flyExe } = opts;
    if (isProject) {
        if (action === 'build')
            return [{ exe: flyExe, args: ['-build'] }];
        // -run rebuilds when stale; plain -run covers both Run and Build-and-Run
        if (action === 'run' || action === 'buildAndRun')
            return [{ exe: flyExe, args: ['-run'] }];
    }
    // Standalone file
    if (!filePath)
        throw new Error('filePath is required for standalone builds');
    const stemPath = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
    const o = ['-o', stemPath];
    if (action === 'build')
        return [{ exe: flyExe, args: ['-compile', filePath, '-finish', ...o] }];
    if (action === 'run')
        return [{ exe: flyExe, args: ['-compile', filePath, '-run', ...o] }];
    if (action === 'buildAndRun')
        return [{ exe: flyExe, args: ['-compile', filePath, '-done', ...o] }];
    throw new Error('unknown action');
}
//# sourceMappingURL=cli.js.map