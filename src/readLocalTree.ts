import { execFile } from "node:child_process";
import { promisify } from "node:util";

const asyncExec = promisify(execFile);

export const readLocalTree = async (args: { dir: string; tree: string }) =>
  (
    await asyncExec("git", ["ls-tree", "-t", "-r", "-z", args.tree], {
      cwd: args.dir,
      encoding: "buffer",
    })
  ).stdout;
