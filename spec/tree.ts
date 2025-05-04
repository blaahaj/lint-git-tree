import { it, suite } from "node:test";

await suite("foo", async () => {
  await it("bar", () => {});
});
