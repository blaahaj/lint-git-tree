import { randomUUID } from "node:crypto";
import { readRemoteTree } from "./readRemoteTree.js";
import { parseGitTree } from "./parseGitTree.js";
import { checkTreeEntries } from "./checkTreeEntries.js";

const main = async () => {
  const entries = [
    ...parseGitTree(
      await readRemoteTree({
        tmpDir: `${process.env.RUNNER_TEMP ?? "?"}/lint-git-tree-${randomUUID()}`,
        remoteUrl: `https://github.com/${process.env.GITHUB_REPOSITORY ?? "?"}`,
        sha: process.env.GITHUB_SHA ?? "?",
      }),
    ),
  ];

  const { errors } = checkTreeEntries(entries);

  for (const e of errors) {
    console.log(e);
  }

  if (errors.length > 0) process.exit(1);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
