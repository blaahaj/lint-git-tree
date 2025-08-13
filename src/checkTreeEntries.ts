import { inspect } from "node:util";
import type { ListingEntry } from "./parseGitTree.js";

const encoding = "utf-8";

export type CheckResult = { readonly errors: readonly string[] };

const showBuffer = (b: Buffer): string =>
  `${inspect(b.toString(encoding))} ${inspect(b)}`;

export const checkTreeEntries = (
  entries: readonly ListingEntry<Buffer>[],
): CheckResult => {
  const entriesByParent = new Map<string, string[]>();

  const errors: string[] = [];

  for (const e of entries) {
    const lastSlash = e.name.lastIndexOf(0x2f);
    const basenameBuffer =
      lastSlash >= 0 ? Buffer.copyBytesFrom(e.name, lastSlash + 1) : e.name;

    const basename = basenameBuffer.toString(encoding);

    if (basename.includes("\uFFFD")) {
      errors.push(
        `ERROR: invalid ${encoding} in ${showBuffer(basenameBuffer)} (full path: ${inspect(e.name.toString(encoding))})`,
      );
    } else {
      const normalised = Buffer.from(basename.normalize(), encoding);
      if (!basenameBuffer.equals(normalised)) {
        errors.push(
          `ERROR: non-normalised ${encoding} encoding in ${showBuffer(basenameBuffer)} (full path: ${inspect(e.name.toString(encoding))})`,
        );
      } else {
        const dirnameBuffer =
          lastSlash >= 0
            ? Buffer.copyBytesFrom(e.name, 0, lastSlash)
            : Buffer.of();
        const dirnameHex = dirnameBuffer.toString("hex");
        const arr = entriesByParent.get(dirnameHex);
        if (arr) arr.push(basename);
        else entriesByParent.set(dirnameHex, [basename]);
      }
    }
  }

  for (const [parentHex, childNames] of entriesByParent.entries()) {
    const parentBuffer = Buffer.from(parentHex, "hex");
    const parent = parentBuffer.toString(encoding);

    const childNamesByLower = new Map<string, string[]>();
    for (const child of childNames) {
      const lower = child.toLocaleLowerCase();
      const arr = childNamesByLower.get(lower);
      if (arr) arr.push(child);
      else childNamesByLower.set(lower, [child]);
    }

    for (const clashingNames of childNamesByLower.values()) {
      if (clashingNames.length == 1) continue;

      errors.push(
        `ERROR: case clash between ${clashingNames.map((s) => inspect(s)).join(" and ")} under directory ${inspect(parent)}`,
      );
    }
  }

  return { errors };
};
