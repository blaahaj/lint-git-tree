#!/usr/bin/env node
import * as tmp from "tmp";
import { lintLocalTree, lintRemoteTree, reportAndExit } from "./module.js";
import { stat } from "node:fs/promises";
const isDirectory = (path) => stat(path).then((s) => s.isDirectory(), (err) => {
    if (err instanceof Error && "code" in err && err.code === "ENOENT")
        return false;
    throw err;
});
const main = async (argv) => {
    if (argv.includes("--help")) {
        console.log([
            "Usage: lint-git-tree --help",
            "Usage: lint-git-tree [REPO [TREE]]",
            "",
            "REPO defaults to '.'; TREE defaults to HEAD.",
            "",
            "If REPO is a directory, then the given local repository will be used;",
            "otherwise, it is taken to be a URL of a repository to clone.",
        ].join("\n"));
    }
    else if (argv.length <= 2) {
        const repo = argv[0] ?? ".";
        const tree = argv[1] ?? "HEAD";
        if (await isDirectory(repo)) {
            return reportAndExit(await lintLocalTree(repo, tree));
        }
        else {
            const [dir, cleanup] = await new Promise((resolve, reject) => {
                tmp.dir({ mode: 0o700, prefix: "lint-git-tree" }, (error, path, cleanup) => {
                    if (error)
                        reject(error);
                    else
                        resolve([path, cleanup]);
                });
            });
            return reportAndExit(await lintRemoteTree({
                url: repo,
                dir: `${dir}/repo`,
                commit: tree,
            }).finally(() => cleanup()));
        }
    }
    else {
        console.error("Unrecognised invocation. Try with '--help'");
        process.exit(1);
    }
};
main(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map