export type ListingEntry<T> = {
  mode: string;
  type: string;
  sha: string;
  name: T;
};

export function* parseGitTree(
  listing: Buffer,
): Generator<ListingEntry<Buffer>> {
  let index = 0;

  while (index < listing.length) {
    const tabIndex = listing.indexOf(9, index);
    if (tabIndex <= 0) throw new Error(`Missing TAB after position ${index}`);

    const zeroIndex = listing.indexOf(0, tabIndex);
    if (zeroIndex <= 0)
      throw new Error(`Missing NUL after position ${tabIndex}`);

    const [mode, type, sha] = listing
      .toString("ascii", index, tabIndex)
      .split(" ");
    const name = Buffer.copyBytesFrom(
      listing,
      tabIndex + 1,
      zeroIndex - (tabIndex + 1),
    );

    yield {
      mode,
      type,
      sha,
      name,
    };

    index = zeroIndex + 1;
  }
}
