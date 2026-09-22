// Creates and pushes the `v<version>` tag that triggers .github/workflows/release.yml.
//
// This is deliberately a local command rather than a CI step: a tag pushed with a
// workflow's GITHUB_TOKEN does not trigger other workflows, so an automated tag
// would never start the release. Run it after the "Version Packages" PR is merged.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const git = (...args) => execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();

const fail = (message) => {
  console.error(`release-tag: ${message}`);
  process.exit(1);
};

const manifestPath = join(repoRoot, "apps", "vscode", "package.json");
const { version } = JSON.parse(readFileSync(manifestPath, "utf8"));
const tag = `v${version}`;

if (git("status", "--porcelain") !== "") {
  fail("working tree is dirty; commit or stash first so the tag points at a clean build");
}

const branch = git("rev-parse", "--abbrev-ref", "HEAD");
if (branch !== "master") {
  fail(`expected to be on master, found "${branch}"`);
}

// A tag that already exists usually means the version bump was never merged.
const existing = git("tag", "--list", tag);
if (existing !== "") {
  fail(`${tag} already exists. Merge the "Version Packages" PR to bump the version first.`);
}

git("fetch", "origin", "master", "--tags");
const behind = git("rev-list", "--count", "HEAD..origin/master");
if (behind !== "0") {
  fail(`local master is ${behind} commit(s) behind origin/master; pull first`);
}

git("tag", "-a", tag, "-m", `Unravel Code ${tag}`);
git("push", "origin", tag);

console.log(`release-tag: pushed ${tag} — Release workflow should start shortly.`);
