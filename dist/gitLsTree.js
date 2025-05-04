import { execFile } from "node:child_process";
import { promisify } from "node:util";
const asyncExec = promisify(execFile);
export const readRemoteTree = async (args) => {
    await asyncExec("git", ["init", "--bare", "--", args.tmpDir]);
    await asyncExec("git", ["fetch", "--depth", "1", args.remoteUrl, process.env.GITHUB_SHA ?? "?"], {
        cwd: args.tmpDir,
    });
    const out = (await asyncExec("git", ["ls-tree", "-t", "-r", "-z", "FETCH_HEAD:"], {
        cwd: args.tmpDir,
        encoding: "buffer",
    })).stdout;
    return out;
};
export function* parse(listing) {
    let index = 0;
    while (index < listing.length) {
        const tabIndex = listing.indexOf(9, index);
        if (tabIndex <= 0)
            throw new Error(`Missing TAB after position ${index}`);
        const zeroIndex = listing.indexOf(0, tabIndex);
        if (zeroIndex <= 0)
            throw new Error(`Missing NUL after position ${tabIndex}`);
        const [mode, type, sha] = listing
            .toString("ascii", index, tabIndex)
            .split(" ");
        const name = Buffer.copyBytesFrom(listing, tabIndex + 1, zeroIndex - (tabIndex + 1));
        yield {
            mode,
            type,
            sha,
            name,
        };
        index = zeroIndex + 1;
    }
}
