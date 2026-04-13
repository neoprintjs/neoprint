# Changelog

## [0.3.1](https://github.com/neoprintjs/neoprint/compare/v0.3.0...v0.3.1) (2026-04-13)

### Features

* add Download JSON button in demo Raw tab ([3792757](https://github.com/neoprintjs/neoprint/commit/3792757a117384cb5acdb9bd3c0e36b8ed3226a1))

### Bug Fixes

* cross-browser ID normalization for Chrome/Edge/Firefox on Windows ([0e1c2df](https://github.com/neoprintjs/neoprint/commit/0e1c2dffeaff15885f7f6e429d2287f0b655605f))
* stabilize fingerprint IDs across scroll positions ([ce79008](https://github.com/neoprintjs/neoprint/commit/ce79008c278e8ead7bf80a6b5c483dabe46c239a))

### Documentation

* update cross-browser ID docs after speech removal and GPU normalization ([d832a7b](https://github.com/neoprintjs/neoprint/commit/d832a7b4ac140cd04037a3499755be1062821634))

## [0.3.0](https://github.com/neoprintjs/neoprint/compare/v0.2.0...v0.3.0) (2026-04-12)

### Features

* add device attestation API with integrity token ([8aedf74](https://github.com/neoprintjs/neoprint/commit/8aedf74aa10850141127a4e95671a72f6f6001f8))
* add hardware performance profiling collector ([bee39ef](https://github.com/neoprintjs/neoprint/commit/bee39ef5381529f198d1f03643fb33b7bea2c0f6))
* add per-collector docs, device attestation, Web Worker offloading ([15ffd96](https://github.com/neoprintjs/neoprint/commit/15ffd96caa996dd3050d456c932bc33e3a5b1759))
* add Web Worker offloading and device attestation ([8ff1d33](https://github.com/neoprintjs/neoprint/commit/8ff1d3340925692acf8c079eb5810af5e2f1c17c))

### Bug Fixes

* detect iPadOS correctly (iPad sends macOS-like UA since iPadOS 13) ([3b8b854](https://github.com/neoprintjs/neoprint/commit/3b8b854397554bb355362bc76de8373ddadc09ba))
* read version from package.json in docs nav ([5503656](https://github.com/neoprintjs/neoprint/commit/55036561a56d1f757eb5354a2fee11c02b8c064a))
* redesign demo UI — consistent card style, segmented control, auto-generate on load ([974c52a](https://github.com/neoprintjs/neoprint/commit/974c52a2f9be43f85f6243881c4c7b94268be35f))
* remove debug field from detectIncognito public API ([11c4ddf](https://github.com/neoprintjs/neoprint/commit/11c4ddf5e7955576262193e7e07b912efe8bc2da))
* three IDs -> four IDs in README heading ([4fb1f8c](https://github.com/neoprintjs/neoprint/commit/4fb1f8c4c2a256f98d4d0d1eb68af757f01bbf38))

### Documentation

* add llms.txt sitemap ([d77734d](https://github.com/neoprintjs/neoprint/commit/d77734d7341b01e400a58a0e408d0344593a8b49))
* add llms.txt sitemap, remove AskAI component ([d23b9b7](https://github.com/neoprintjs/neoprint/commit/d23b9b750b215a01f2cb178e1dc9f6b5cda5f699))
* add Node.js server-side validation example ([2c43717](https://github.com/neoprintjs/neoprint/commit/2c43717cb37debdf1b96d633907abd2cccf3fec5))
* add table of contents to README ([654a7bc](https://github.com/neoprintjs/neoprint/commit/654a7bc2b3e797ed5e91be0e2c12d32d317d2023))

## 0.2.0 (2026-04-12)

### Features

* initial release ([2e421dd](https://github.com/neoprintjs/neoprint/commit/2e421dd675b0c3645ca61b5127dc29c842d5e90d))
* rename package to @neoprintjs/core for scoped ecosystem ([a9ed041](https://github.com/neoprintjs/neoprint/commit/a9ed041177d46cd70d0e443340927cb73c3ba8ff))

### Bug Fixes

* cross-browser ID normalization, incognito detection, ad blocker detection ([e58196f](https://github.com/neoprintjs/neoprint/commit/e58196fec135a781f81fac8e86ee29c4d263fe5a))
* set base to / for custom domain neoprint.dev ([f6026fb](https://github.com/neoprintjs/neoprint/commit/f6026fbaf539952a120e56d9ff32a53c5e5fc581))
* use npm install instead of npm ci in docs workflow ([b4f8ead](https://github.com/neoprintjs/neoprint/commit/b4f8eadb03616e4f8c079f5b3f504fdcb62ff8a0))

### Performance

* reduce audio buffer to 5000 samples, optimize webrtc candidate gathering ([2fc713b](https://github.com/neoprintjs/neoprint/commit/2fc713b4a3d0538149142f1bdc962ecc137100c2))

### Documentation

* add VitePress documentation site with interactive demos ([5957de4](https://github.com/neoprintjs/neoprint/commit/5957de44d2ac868c53a1f6491230efb2d0c17088)), closes [#1d4ed8](https://github.com/neoprintjs/neoprint/issues/1d4ed8)
