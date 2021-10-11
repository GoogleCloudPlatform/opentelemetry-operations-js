// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Script to create release tags after a release. Works by running `lerna ls`
 * and creating a tag for each version. Any extra args passed to the script will
 * be added to the `lerna ls` command so you can e.g. --ignore certain packages.
 */

const child_process = require("child_process");
const readline = require("readline");

function run(
  command,
  args = [],
  options = { stdio: ["pipe", "pipe", "inherit"] }
) {
  const ret = child_process.spawnSync(command, args, options);
  if (ret.status !== 0) {
    throw new Error(`Subprocess returned with code ${ret.status}`);
  } else if (ret.error !== undefined) {
    throw ret.error;
  }
  return ret;
}

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Get list of packages from lerna
  const { stdout } = run("lerna", [
    "ls",
    "--json",
    "--no-private",
    ...process.argv.slice(2),
  ]);
  const jsonOutput = JSON.parse(stdout.toString());
  const tagNames = jsonOutput.map(
    (packageInfo) => `${packageInfo.name}@${packageInfo.version}`
  );
  if (tagNames.length === 0) {
    console.error("No tags to create!");
    process.exit(1);
  }

  rl.question(`Create tags\n${tagNames.join("\n")}\n(y/n)? `, (answer) => {
    if (answer === "y") {
      tagNames.forEach((tagName) => {
        run("git", ["tag", tagName], { stdio: ["pipe", "inherit", "inherit"] });
      });
    } else {
      process.exit(1);
    }
    rl.close();
  });
  rl.on("close", () => {
    console.log(
      `Successfully created tags. To push them to origin, run:\n\ngit push origin ${tagNames
        .map((n) => `'${n}'`)
        .join(" ")}`
    );
  });
}

main();
