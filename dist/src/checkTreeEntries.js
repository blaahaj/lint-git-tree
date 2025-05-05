export const checkTreeEntries = (entries) => {
    const entriesByParent = new Map();
    const errors = [];
    for (const e of entries) {
        const lastSlash = e.name.lastIndexOf(0x2f);
        const basenameBuffer = lastSlash >= 0 ? Buffer.copyBytesFrom(e.name, lastSlash + 1) : e.name;
        const basename = basenameBuffer.toString("utf-8");
        const nameAndHex = `${basename} (${basenameBuffer.toString("hex")})`;
        if (basename.includes("\uFFFD")) {
            errors.push(`ERROR: invalid UTF-8 in name: ${nameAndHex}`);
        }
        else {
            const normalised = Buffer.from(basename.normalize(), "utf-8");
            if (!basenameBuffer.equals(normalised)) {
                errors.push(`ERROR: non-normalised UTF-8 encoding in name: ${nameAndHex}`);
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
            errors.push(`ERROR: case clash in ${parent}: ${JSON.stringify(clashingNames)}`);
        }
    }
    return { errors };
};
//# sourceMappingURL=checkTreeEntries.js.map