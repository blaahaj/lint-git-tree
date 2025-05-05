import { randomUUID } from "node:crypto";
import { readRemoteTree } from "./readRemoteTree.js";
import { parseGitTree } from "./parseGitTree.js";
import { checkTreeEntries } from "./checkTreeEntries.js";
import { reportAndExit } from "./module.js";

const main = async () => {
  const entries = [
    ...parseGitTree(
      await readRemoteTree({
        tmpDir: `${process.env.RUNNER_TEMP ?? "?"}/lint-git-tree-${randomUUID()}`,
        remoteUrl: `https://github.com/${process.env.GITHUB_REPOSITORY ?? "?"}`,
        sha: process.env.GITHUB_SHA ?? "?",
        rm: false,
      }),
    ),
  ];

  reportAndExit(checkTreeEntries(entries));
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
