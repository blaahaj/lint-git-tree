import { lstat, readdir } from "node:fs/promises";

export const ls = async (dir: string) => {
  return readdir(dir, "binary").then((entries) =>
    Promise.all(
      entries.map((name) =>
        lstat(`${dir}/${name}`).then((stat) => ({
          name,
          stat,
          dir: stat.isDirectory(),
          file: stat.isFile(),
          symlink: stat.isSymbolicLink(),
        }))
      )
    )
  );
};
