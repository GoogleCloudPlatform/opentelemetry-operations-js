# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Community Guidelines

This project follows [Google's Open Source Community
Guidelines](https://opensource.google/conduct/).

# Contributing A Patch

1. Submit an issue describing your proposed change to the repo in question.
1. The repo owner will respond to your issue promptly.
1. Fork the desired repo, develop and test your code changes.
1. In the directory for each of the packages that you have made changes in, run `npm run test` to run the tests and check coverage. Ensure there are no new failures after your changes. 
1. From the top level directory run `npm run check` and address any failures. This builds all of the packages and runs the linter. This ensures changes you have made do not affect any of the packages (which can happen even if you have not changed them specifically).
1. The easiest way to fix linter errors is to run `npm run fix`
1. Submit a pull request.
1. If your proposed change is accepted, and you haven't already done so, sign a Contributor License Agreement (see details above).

## Running the tests

The command `npm test` tests code the same way that our CI will test it.
This is a convenience command for a number of steps, which can run separately if needed:

- `npm run compile` compiles the code, checking for type errors.
- `npm run bootstrap` Bootstrap the packages in the current Lerna repo. Installs all of their dependencies and links any cross-dependencies.