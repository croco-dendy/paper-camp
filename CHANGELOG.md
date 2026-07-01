# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0](https://github.com/adooone/paper-camp/compare/v0.2.1...v0.3.0) (2026-07-01)


### Features

* **23:** Resolve open questions from Docs ([7a8179b](https://github.com/adooone/paper-camp/commit/7a8179b9183aa8f729ed72b3f30f26d023637244))
* **24:** Add push button to commit panel ([a1867ed](https://github.com/adooone/paper-camp/commit/a1867ed01b6bb7c05d27235e1d6e8d3f107654d3))
* **24:** Archive FEAT-24 and close IDEA-20 as done ([1520ab2](https://github.com/adooone/paper-camp/commit/1520ab27d314e7ea2b1d86c5ede5375ff94370a3))
* **24:** Make commit-suggestion agent configurable ([57cc445](https://github.com/adooone/paper-camp/commit/57cc445377e6e20df6ab5c580c8410710cb52129))
* **24:** Plan storage architecture ([3c3f849](https://github.com/adooone/paper-camp/commit/3c3f849650a4aee47f18906ab6c1b77091285a3e))
* **24:** Track commit-suggest as a visible agent task ([071219a](https://github.com/adooone/paper-camp/commit/071219ae93c632d470be8686c67af6ece2d19993))
* **cli:** updates ([201fe09](https://github.com/adooone/paper-camp/commit/201fe094ef2409832725d582c973bb1c103afe70))
* **plans:** Complete FEAT-25 batch audit — all phases done, status → review ([17a8f66](https://github.com/adooone/paper-camp/commit/17a8f6666bcc547026bd9fb9ffc72e47714ed532))
* **stack:** Use subsystem-area scopes and move plan id to Refs footer ([da665b7](https://github.com/adooone/paper-camp/commit/da665b7cba34dc833f2da2e6c1745c8bcac544ab))


### Bug Fixes

* **23:** Validate before writing in resolve-open-question handler ([b4481e4](https://github.com/adooone/paper-camp/commit/b4481e4259508726d569da78831ba54b0c57e8c7))
* **24:** Move push button to empty-changes state, drop Refs checkbox ([e6ec4d7](https://github.com/adooone/paper-camp/commit/e6ec4d78bb718647f992fe435cc6bddcca6830d9))
* **24:** Prevent stdin EPIPE crash and skip symlinks in untracked diffs ([ef47bb2](https://github.com/adooone/paper-camp/commit/ef47bb208e9d783615f6099d731786c0a1ef2ead))
* **24:** Read archived plan files and sync ideas/plans status to done ([70de972](https://github.com/adooone/paper-camp/commit/70de972f64f487ea66027e345f1da416b4511994))
* **24:** Use merged plan/idea readers and harden push, diff, and migration ([a0f7964](https://github.com/adooone/paper-camp/commit/a0f7964ee90ee80ce908686ebdb1106e897f45a1))
* **24:** Use merged plan/idea readers and harden push, diff, and migration ([a590a21](https://github.com/adooone/paper-camp/commit/a590a2108d4acb994e994ce98e4690551f2a07ce))
* **agent:** Harden batch audit — drain stderr, archived plans, branch guard ([20821be](https://github.com/adooone/paper-camp/commit/20821bea89d60be9502ccad7b535f7393221549b))


### Code Refactoring

* **feat-24:** Adapt prompts and activity to per-file plan storage ([a127f74](https://github.com/adooone/paper-camp/commit/a127f7482346f0828fe449754bd1cd54345d6e65))
* **feat-24:** Pass commit-suggest prompt via stdin for all agents ([290124c](https://github.com/adooone/paper-camp/commit/290124c846f98400b5ffb8c4a4465edef7163cdf))


### Documentation

* **docs:** Actualize about.md for per-file plan/idea storage ([f4663ef](https://github.com/adooone/paper-camp/commit/f4663efb4646504a32a893ae4f2e0c9c5660d054))
* **plans:** Archive completed plan and mark done in index ([15123ba](https://github.com/adooone/paper-camp/commit/15123bab2c09c6542a429f43024ece738d948812))
* **repo:** Remove CODE_STYLE.md and UX_PRINCIPLES.md from repo root ([f87993c](https://github.com/adooone/paper-camp/commit/f87993c505767ecd77ee1250c32df2ce6e02c43a))
* **repo:** Restructure repo-root docs ([f1076ed](https://github.com/adooone/paper-camp/commit/f1076ed30cad2e16ea5fdcb2d6b7076d5b9cc198))
* **repo:** Switch commit scope to subsystem areas and update per-file plan references ([5155b07](https://github.com/adooone/paper-camp/commit/5155b0707a16bcfde73bc7d3a5ae94e49bdeeb50))
* **repo:** Update papercamp config ([92ec60b](https://github.com/adooone/paper-camp/commit/92ec60b3ecf7a64a226008fe718abe7fd12fba46))

## [0.2.1](https://github.com/adooone/paper-camp/compare/v0.2.0...v0.2.1) (2026-06-28)


### Bug Fixes

* **22:** skip draft PR creation if one already exists in any state ([b8c26cc](https://github.com/adooone/paper-camp/commit/b8c26ccce9341028978c07f36201811774e503f9))

## [0.2.0](https://github.com/adooone/paper-camp/compare/v0.1.0...v0.2.0) (2026-06-28)


### Features

* **22:** fix paper-ui link and ci ([8d4b781](https://github.com/adooone/paper-camp/commit/8d4b78141bad70756b49ca20f0c3b7ad381f8da3))
* **22:** GitHub CI/CD automation ([b26e89d](https://github.com/adooone/paper-camp/commit/b26e89d53b979b4617ebb26f2e88316081873268))
* **22:** GitHub CI/CD automation ([7353d41](https://github.com/adooone/paper-camp/commit/7353d4176f67590f109e355c02bf18054ae09b40))
* **22:** Triage CodeRabbit's first review and harden branch checkout ([2385b54](https://github.com/adooone/paper-camp/commit/2385b54e8dfa4668c481ca59f844f843e9b22a9b))
* **22:** update api ([c56e51f](https://github.com/adooone/paper-camp/commit/c56e51f0c195700acdc07bb5ada6c44046f3ab1c))
* **22:** update ci ([b8fc547](https://github.com/adooone/paper-camp/commit/b8fc54798efb3c4ba33570108ab4c29c93cd3841))
* **22:** update npm flow ([7b09e7f](https://github.com/adooone/paper-camp/commit/7b09e7f4bb48c43fa921ca33ba0f6f6084e1e046))
* Add opencode agent support ([b372bc4](https://github.com/adooone/paper-camp/commit/b372bc41e488add670f6d9275a54fb1f49721652))
* Agent-drafted plans ([07d2dbb](https://github.com/adooone/paper-camp/commit/07d2dbb33de0ce8152c6c162d8a41950710f8069))
* Phase convergence audit ([c4ecdab](https://github.com/adooone/paper-camp/commit/c4ecdabc0a270f64639eb75f7d38d1b767acf445))
* Plan clarification pass ([07b0ad9](https://github.com/adooone/paper-camp/commit/07b0ad95de8c7fa77fdb6641eac1f4b2650b7ec4))
* Plan/decision consistency check ([eb6eb0c](https://github.com/adooone/paper-camp/commit/eb6eb0c975759fd4e65a6e0a9f27468c917198cc))
* Polish Ideas and Stack UX ([201ff20](https://github.com/adooone/paper-camp/commit/201ff20916525c3f338c74a299d530556250e4c6))
* Project settings and config views ([bd3ca00](https://github.com/adooone/paper-camp/commit/bd3ca0003c237939c421c61ab1a0793a60e37588))
* Repo health status ([d9cf2a2](https://github.com/adooone/paper-camp/commit/d9cf2a2349223e654eac107d8c5a6ca690a99e6a))
* Settings config workspace ([661ecc7](https://github.com/adooone/paper-camp/commit/661ecc76564f8f0ab28df86fb85858d3698345eb))


### Bug Fixes

* **22:** align publish.yml checkout with repo convention ([920e3c8](https://github.com/adooone/paper-camp/commit/920e3c83f57430cd99ed8795dccf5eb0aa48392f))
* **22:** scope Scout app token to least privilege ([b65bfff](https://github.com/adooone/paper-camp/commit/b65bfffef3193fad4648be1a426a5d68656c3b5c))

## [0.1.0] - 2024-XX-XX

### Added
- Initial MVP release
- CLI commands: `init`, `dev`, `add`
- Admin dashboard with 5 pages:
  - Dashboard with project health gauges
  - Projects management
  - Plans browser with task tracking
  - Focus mode for AI-assisted work
  - Settings configuration
- Local-first data storage
- Analog gauge visualizations
- Integration with `paperplan/` planning system
