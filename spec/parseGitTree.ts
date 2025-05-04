import * as assert from "node:assert";
import { it, suite } from "node:test";
import { parseGitTree } from "../src/parseGitTree.js";

await suite("parseGitTree", async () => {
  await it("parses 0", () => {
    const actual = [...parseGitTree(Buffer.of())];
    assert.equal(actual.length, 0);
  });

  await it("parses 1", () => {
    const actual = [
      ...parseGitTree(
        Buffer.from(
          "040000 tree 1a49874763efc06e3b7bdef3a2a98fa460db03fb\tsrc\0",
        ),
      ),
    ];
    assert.deepStrictEqual(actual, [
      {
        mode: "040000",
        type: "tree",
        sha: "1a49874763efc06e3b7bdef3a2a98fa460db03fb",
        name: Buffer.from("src", "utf-8"),
      },
    ]);
  });

  await it("parses 2", () => {
    const actual = [
      ...parseGitTree(
        Buffer.from(
          "040000 tree 1a49874763efc06e3b7bdef3a2a98fa460db03fb\tnew\nline\0" +
            "100644 blob 8fb357c662575e840e2786d9d3a9faa710a08f14\tCHANGELOG.md\n\0",
        ),
      ),
    ];
    assert.deepStrictEqual(actual, [
      {
        mode: "040000",
        type: "tree",
        sha: "1a49874763efc06e3b7bdef3a2a98fa460db03fb",
        name: Buffer.from("new\nline", "utf-8"),
      },
      {
        mode: "100644",
        type: "blob",
        sha: "8fb357c662575e840e2786d9d3a9faa710a08f14",
        name: Buffer.from("CHANGELOG.md\n", "utf-8"),
      },
    ]);
  });

  await it("fails on missing TAB", () => {
    const line1 =
      "040000 tree 1a49874763efc06e3b7bdef3a2a98fa460db03fb\tsrc1\0";
    const line2 = "040000 tree 1a49874763efc06e3b7bdef3a2a98fa460db03fb src2\0";

    assert.throws(
      () => {
        const _arr = [...parseGitTree(Buffer.from(line1 + line2, "utf-8"))];
      },
      new RegExp(`Error: Missing TAB after position ${line1.length}`),
    );
  });

  await it("fails on missing NUL", () => {
    const data = "040000 tree 1a49874763efc06e3b7bdef3a2a98fa460db03fb";
    const path = "src";

    assert.throws(
      () => {
        const _arr = [
          ...parseGitTree(Buffer.from(`${data}\t${path}`, "utf-8")),
        ];
      },
      new RegExp(`Error: Missing NUL after position ${data.length}`),
    );
  });
});
