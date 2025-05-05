import { execFile } from "node:child_process";
import { promisify } from "node:util";

const asyncExec = promisify(execFile);

export const readRemoteTree = async (args: {
  remoteUrl: string;
  sha: string;
  tmpDir: string;
}) => {
  await asyncExec("git", ["init", "--bare", "--", args.tmpDir]);

  await asyncExec(
    "git",
    ["fetch", "--depth", "1", args.remoteUrl, process.env.GITHUB_SHA ?? "?"],
    {
      cwd: args.tmpDir,
    },
  );

  const out = (
    await asyncExec("git", ["ls-tree", "-t", "-r", "-z", "FETCH_HEAD:"], {
      cwd: args.tmpDir,
      encoding: "buffer",
    })
  ).stdout;

  return out;
};
