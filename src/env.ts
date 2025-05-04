import { homedir, userInfo } from "node:os";
import { ls } from "./ls.js";

const data = {
  env: process.env,
  cwd: process.cwd(),
  argv: process.argv,
  argv0: process.argv0,
  user: userInfo({ encoding: "utf-8" }),
  home: homedir(),
  ls: await ls("."),
};

//   console.log(JSON.stringify(data));
