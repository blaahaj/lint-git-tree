import * as assert from "node:assert";
import { it, suite } from "node:test";
import { checkTreeEntries } from "../src/checkTreeEntries.js";
await suite("checkTreeEntries", async () => {
    await suite("utf-8", async () => {
        await it("0 items", () => {
            const actual = checkTreeEntries([]);
            assert.equal(actual.errors.length, 0);
        });
        await it("1 good item (ascii)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("plain ASCII", "utf-8"),
                },
            ]);
            assert.equal(actual.errors.length, 0);
        });
        await it("1 good item (utf-8)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from([0x6e, 0xc3, 0xa5, 0x72]), // "når"
                },
            ]);
            assert.equal(actual.errors.length, 0);
        });
        await it("1 bad item (corrupted utf-8)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from([0x6e, 0xc3, 0x72]),
                },
            ]);
            assert.equal(actual.errors.length, 1);
            assert.match(actual.errors[0], /ERROR: invalid UTF-8 in name:/);
        });
        await it("1 bad item (non-normalised utf-8)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from([0x6e, 0x61, 0xcc, 0x8a, 0x72]), // "når" but composing a ring onto the "a"
                },
            ]);
            assert.equal(actual.errors.length, 1);
            assert.match(actual.errors[0], /ERROR: non-normalised UTF-8 encoding in name:/);
        });
    });
    await suite("case clashes", async () => {
        await it("no clash (root)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("foo", "utf-8"),
                },
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("bar", "utf-8"),
                },
            ]);
            assert.equal(actual.errors.length, 0);
        });
        await it("clash (root)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("foo", "utf-8"),
                },
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("Foo", "utf-8"),
                },
            ]);
            assert.equal(actual.errors.length, 1);
            assert.match(actual.errors[0], /ERROR: case clash/);
            // FIXME: no checking the reporting of *what* clashed, or *where*
        });
        await it("clash (subdir)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("dir1/foo", "utf-8"),
                },
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("dir1/Foo", "utf-8"),
                },
            ]);
            assert.equal(actual.errors.length, 1);
            assert.match(actual.errors[0], /ERROR: case clash/);
            // FIXME: no checking the reporting of *what* clashed, or *where*
        });
        await it("clash (file clashes with dir)", () => {
            const actual = checkTreeEntries([
                {
                    mode: "040000",
                    type: "tree",
                    sha: "meh",
                    name: Buffer.from("FOO", "utf-8"),
                },
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("FOO/something", "utf-8"),
                },
                {
                    mode: "100644",
                    type: "blob",
                    sha: "meh",
                    name: Buffer.from("foo", "utf-8"),
                },
            ]);
            assert.equal(actual.errors.length, 1);
            assert.match(actual.errors[0], /ERROR: case clash/);
            // FIXME: no checking the reporting of *what* clashed, or *where*
        });
    });
});
//# sourceMappingURL=checkTreeEntries.js.map