# Releasing - For maintainers only

This document explains how to publish opentelemetry-operations-js Node modules.
Each package has [independent
versioning](https://github.com/lerna/lerna#independent-mode) as some are
unstable (pre 1.0) while others are stable. Ensure that you’re following semver
when choosing a version numbers (conventional commits helps here).

- [Example PR #139](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/pull/139)
- [Example Tag v0.4.0](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/releases/tag/v0.4.0)

## Update to latest locally

Use `git fetch` and `git checkout origin/main` to ensure you’re on the latest commit. Make sure
you have no unstaged changes. Ideally, also use `git clean -dfx` to remove all ignored and
untracked files.

## Create a new branch

Create a new branch from the current commit for the release proposal PR.

## Use Lerna to prepare each package for release

You can generally rely on lerna's [conventional
commits](https://www.conventionalcommits.org/en/v1.0.0/) support to correctly
choose the next version number for each package when releasing.

Bump the package versions based on conventional commits with:

```bash
lerna version \
  --conventional-commits \
  --no-push \
  --no-git-tag-version
```

Be sure to check the lerna's output when it prompts if everything is correct,
making sure the bumped versions are what you expected. In the event that they
are not, re-run the command without `--conventional-commits` and lerna will
interactively ask you to input the correct bumps. You may need to do this when
first releasing a 0.X package as 1.0.0.

## Run `npm install`

Don't forget this step! This will build everything and regenerate the
`src/version.ts` files in each subpackage.

## Create a new commit

Create a new commit with the title: `chore: X release proposal` where `X` is one
or more of the released package names and versions e.g. `chore: trace-exporter
1.0.0 release proposal`. Since each package is versioned independently in the
monorepo and you may be releasing more than one of them, it is hard to give
exact guidance here.

## Create a Draft GitHub Release

On [GitHub
Releases](https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/releases),
start creating a release named with the [`X`](#create-a-new-commit) portion of
the release proposal PR's name. Generate a description for the release by
clicking the "Auto-generate release notes" button (feel free to edit it with
more details).

Save it as a draft–don’t publish it yet. Set the release to create a new tag
which is snake-cased version of `X` from above. This won't create a tag until
you publish.

## Create a new PR

Push the branch to GitHub and create a new PR with that exact name. You can use
Github CLI to do this easily with `gh pr create -f`. The commit body should just
be a link to the *draft* release created
[above](#create-a-draft-github-release). Someone who can access draft notes
should approve it, looking in particular for test passing, and whether the draft
notes are satisfactory.

## Merge and pull

Once approved, merge the PR, and pull the changes locally. Ensure that `HEAD` is
pointing at the commit for the merged release proposal PR. To make sure
everything is clean for the release, once again run:

```bash
git clean -dfx
npm install
```

## Publish all packages

Publish the packages with Wombot (see internal documentation). First, get
a token:

```bash
# Run and follow instructions to get a 24h token
npm login --registry https://wombat-dressing-room.appspot.com
```

Now use lerna to publish the packages. This command will upload each package to
npm and create and create git release tags for each package on the current
commit. **Need to verify this after actually doing a release with it. I'm not
100% if this will create tags**.

```bash
lerna publish from-package
```

## Publish the GitHub Release

Publish the GitHub release, ensuring that the tag points to the newly landed
commit corresponding to release proposal.
