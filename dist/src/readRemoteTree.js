import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readLocalTree } from "./readLocalTree.js";
import { rm } from "node:fs/promises";
const asyncExec = promisify(execFile);
export const readRemoteTree = async (args) => {
    try {
        await asyncExec("git", ["init", "--bare", "--", args.tmpDir]);
        await asyncExec("git", ["fetch", "--depth", "1", args.remoteUrl, args.sha], {
            cwd: args.tmpDir,
        });
        return await readLocalTree({ dir: args.tmpDir, tree: "FETCH_HEAD" });
    }
    finally {
        if (args.rm ?? true)
            await rm(args.tmpDir, { recursive: true, force: true });
    }
};
//# sourceMappingURL=readRemoteTree.js.map