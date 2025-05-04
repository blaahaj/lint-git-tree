import { parse, readRemoteTree } from "./gitLsTree.js";
const main = async () => {
    const bareDir = "tree-bare-dir";
    const remoteUrl = `https://github.com/${process.env.GITHUB_REPOSITORY ?? "?"}`;
    const entries = [
        ...parse(await readRemoteTree({
            tmpDir: bareDir,
            remoteUrl,
            sha: process.env.GITHUB_SHA ?? "?",
        })),
    ];
    let errors = 0;
    const entriesByParent = new Map();
    for (const e of entries) {
        const lastSlash = e.name.lastIndexOf(0x2f);
        const basenameBuffer = lastSlash >= 0 ? Buffer.copyBytesFrom(e.name, lastSlash + 1) : e.name;
        const basename = basenameBuffer.toString("utf-8");
        const nameAndHex = `${basename} (${basenameBuffer.toString("hex")})`;
        if (basename.includes("\uFFFD")) {
            console.log(`ERROR: invalid UTF-8 in name: ${nameAndHex}`);
            ++errors;
        }
        else {
            const normalised = Buffer.from(basename.normalize(), "utf-8");
            if (!basenameBuffer.equals(normalised)) {
                console.log(`ERROR: non-normalised UTF-8 encoding in name: ${nameAndHex}`);
                ++errors;
            }
            else {
                const dirnameBuffer = lastSlash >= 0
                    ? Buffer.copyBytesFrom(e.name, 0, lastSlash)
                    : Buffer.of();
                const dirnameHex = dirnameBuffer.toString("hex");
                const arr = entriesByParent.get(dirnameHex);
                if (arr)
                    arr.push(basename);
                else
                    entriesByParent.set(dirnameHex, [basename]);
            }
        }
    }
    for (const [parentHex, childNames] of entriesByParent.entries()) {
        const parentBuffer = Buffer.from(parentHex, "hex");
        const parent = parentBuffer.toString("utf-8");
        const childNamesByLower = new Map();
        for (const child of childNames) {
            const lower = child.toLocaleLowerCase();
            const arr = childNamesByLower.get(lower);
            if (arr)
                arr.push(child);
            else
                childNamesByLower.set(lower, [child]);
        }
        for (const clashingNames of childNamesByLower.values()) {
            if (clashingNames.length == 1)
                continue;
            console.log(`ERROR: case clash in ${parent}: ${JSON.stringify(clashingNames)}`);
            ++errors;
        }
    }
    if (errors > 0)
        process.exit(1);
};
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
