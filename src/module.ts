import { checkTreeEntries, type CheckResult } from "./checkTreeEntries.js";
import { parseGitTree } from "./parseGitTree.js";
import { readLocalTree } from "./readLocalTree.js";
import { readRemoteTree } from "./readRemoteTree.js";

export type { CheckResult } from "./checkTreeEntries.js";

export const lintRemoteTree = async (args: {
  readonly url: string;
  readonly dir: string;
  readonly commit: string;
}): Promise<CheckResult> => {
  const stdout = await readRemoteTree({
    tmpDir: args.dir,
    remoteUrl: args.url,
    sha: args.commit,
  });
  const entries = [...parseGitTree(stdout)];
  return checkTreeEntries(entries);
};

export const lintLocalTree = async (
  dir: string,
  tree: string,
): Promise<CheckResult> => {
  const out = await readLocalTree({ dir, tree });
  const items = [...parseGitTree(out)];
  return checkTreeEntries(items);
};

export const reportAndExit = (checkResult: CheckResult): never => {
  const { errors } = checkResult;

  for (const e of errors) {
    console.log(e);
  }

  if (errors.length > 0) process.exit(1);
  process.exit(0);
};
