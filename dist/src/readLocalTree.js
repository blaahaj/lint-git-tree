import { execFile } from "node:child_process";
import { promisify } from "node:util";
const asyncExec = promisify(execFile);
export const readLocalTree = async (args) => (await asyncExec("git", ["ls-tree", "-t", "-r", "-z", args.tree], {
    cwd: args.dir,
    encoding: "buffer",
})).stdout;
//# sourceMappingURL=readLocalTree.js.map