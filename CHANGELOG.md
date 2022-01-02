# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/vitorsalgado/drizzle-http/compare/v2.2.0...v3.0.0) (2022-01-02)


* refactor!: upgrade pino + change interceptor public interface ([6a8c1fe](https://github.com/vitorsalgado/drizzle-http/commit/6a8c1fe6aef5d97741dce8d52d918f200b216826))
* feat!: remove HttpBody and Response classes ([257f6f1](https://github.com/vitorsalgado/drizzle-http/commit/257f6f128c1ce1dcbb700f91fa09a2ef12dc3c3a))
* refactor!: remove Request class ([81310de](https://github.com/vitorsalgado/drizzle-http/commit/81310deb307e50864ffed05068fc4c59dc0e48fe))


### Features

* add circuit breaker adapter + major refactor of core components ([f0dbbbc](https://github.com/vitorsalgado/drizzle-http/commit/f0dbbbc26bc428bf1d42d222c2ded4ac4411a9f6))
* add Deno version ([9dfee28](https://github.com/vitorsalgado/drizzle-http/commit/9dfee2874ce94642be704d8b998587ccd188536e))
* add more http methods to HttpMethod constants ([ce7fd6e](https://github.com/vitorsalgado/drizzle-http/commit/ce7fd6ee2f8d32272e65028ca975a5e5276c39af))
* add response mapper adapter package ([469ca47](https://github.com/vitorsalgado/drizzle-http/commit/469ca479952c5aa71d02f8b085339ceb53fcde74))
* add ResponseHandler + no longer returns error by default + simplify core components type system ([21740fa](https://github.com/vitorsalgado/drizzle-http/commit/21740fa533c8d2a0ca63c94fcef5e27fe01e5f00))
* **circuit-breaker:** add possibility to combine adapters ([6b2ed71](https://github.com/vitorsalgado/drizzle-http/commit/6b2ed71f151c3123c68aa9a0e43f1dbab46de978))
* **core:** add configurer function to builder ([88cf142](https://github.com/vitorsalgado/drizzle-http/commit/88cf142014b3e23383e7c8ff9a4044d85bb657f1))
* **core:** add hasConfig to RequestFactory ([9fc2aa4](https://github.com/vitorsalgado/drizzle-http/commit/9fc2aa43118f8f20df326b862588b4aa013d1145))
* **core:** add option to ignore response handler on request factory ([2c47836](https://github.com/vitorsalgado/drizzle-http/commit/2c478365061ac3ce8ceddc7522ba424f800d882f))
* **core:** add retry interceptor ([0363ab7](https://github.com/vitorsalgado/drizzle-http/commit/0363ab78697c80fabb53ac2fc8a6a5ab7b7b6847))
* **deno:** improve Deno version and ci for Deno ([6a1c857](https://github.com/vitorsalgado/drizzle-http/commit/6a1c8577c785103a44d5e7124b3936ce940e8cbc))
* **example-nestjs:** add NestJS example ([e162c74](https://github.com/vitorsalgado/drizzle-http/commit/e162c74a70187ef3023cc04916cd5bfa4f9fe024))
* **example-nestjs:** add NestJS example ([fc1f0f4](https://github.com/vitorsalgado/drizzle-http/commit/fc1f0f42c2c172b85fb628136cbd1999539c9556))
* **examples:** add nodejs es modules example ([d8a5126](https://github.com/vitorsalgado/drizzle-http/commit/d8a5126404df6d49ea2baec6504bc8c0f6ad0d06))
* **examples:** re-add javascript backend example ([077d5c0](https://github.com/vitorsalgado/drizzle-http/commit/077d5c02f7fb260b725564cfeefd7fec781559ea))
* expose undici pool from call factory ([ec1b223](https://github.com/vitorsalgado/drizzle-http/commit/ec1b223dc43e5c956f6a27da8ec2782e7c003938))
* **fetch:** use fetch only + simplify module + upgrade deps ([514631f](https://github.com/vitorsalgado/drizzle-http/commit/514631fdbb0cec31c9ed5b64199dca9ceca35f3f))
* **logging:** add logging interceptor optimized for browser ([c745d73](https://github.com/vitorsalgado/drizzle-http/commit/c745d73489f1bfe0ef07b293a338f53885a34d9e))
* **mapper:** add possibility to combine adapters ([5fc4d75](https://github.com/vitorsalgado/drizzle-http/commit/5fc4d757c03ac4b669527aabf238a4bf39689c92))
* multipart + req and res identifiers + core components refactor ([ba53066](https://github.com/vitorsalgado/drizzle-http/commit/ba530663210eb0f06b8782de28aa1bb4a0cfd2d2))
* request model arg parameter handler ([e138039](https://github.com/vitorsalgado/drizzle-http/commit/e138039f07b55c4370c2c61ee6eb2e300795476e))
* request model args + refactor parameter handler components WIP ([1cba0f4](https://github.com/vitorsalgado/drizzle-http/commit/1cba0f4a1b2310e3f047e13904699adb8eb798f2))
* use npm + improve test and lint configuration + upgrade deps ([4b27404](https://github.com/vitorsalgado/drizzle-http/commit/4b27404f723594ac1cdd3c70184dfacd5e2cee62))


### BREAKING CHANGES

* change the order of the parameters in the interceptor constructor
* removed HttpBody and Response. Now using the simpler DzResponse. Clients must implement the methods to consume and parse response data.
* remove Request class to use DzRequest which is simpler and just hold values. Clients should do all required validations and conversions.





# [2.2.0](https://github.com/vitorsalgado/drizzle-http/compare/v2.1.0...v2.2.0) (2021-06-14)


### Bug Fixes

* **core:** remove response converter from callers and add the possibility to ignore it ([564ea5d](https://github.com/vitorsalgado/drizzle-http/commit/564ea5d01d91a42515b91459e9a24b5e13974d1d))
* **lint:** apply prettier fixes ([4c50502](https://github.com/vitorsalgado/drizzle-http/commit/4c505027341f69e10b8ec6e80ee1df10d531d078))





# [2.1.0](https://github.com/vitorsalgado/drizzle-http/compare/v2.0.0...v2.1.0) (2021-03-20)


### Features

* **logger:** expose level and add setLevel method ([56ae69b](https://github.com/vitorsalgado/drizzle-http/commit/56ae69b21e0b19cc78c350af27841fed97c51b76))





# [2.0.0](https://github.com/vitorsalgado/drizzle-http/compare/v1.0.1...v2.0.0) (2021-03-07)


### Bug Fixes

* **logger-interceptor:** fix response log entries + fix browser support ([4217938](https://github.com/vitorsalgado/drizzle-http/commit/42179387c7a6584087bb2f28d5162baf10d63830))


### Features

* **fetch:** add support for timeout on fetch client ([9195c9b](https://github.com/vitorsalgado/drizzle-http/commit/9195c9be9026e09fc774519c211af5e627e628f6))
* add better support for Node-Fetch ([2838660](https://github.com/vitorsalgado/drizzle-http/commit/2838660103e9f1c976c6bb33057270cab9c457ee))
* add decorators to cover Node-Fetch options ([638e127](https://github.com/vitorsalgado/drizzle-http/commit/638e127f16e573bc199af52c9ce36a06be54da9a))
* add missing symbols + improve headers ([41cddeb](https://github.com/vitorsalgado/drizzle-http/commit/41cddeb856aad2559561447e358248567e1db26d))
* **fetch:** handle errors on catch + add Node-Fetch ([6129e41](https://github.com/vitorsalgado/drizzle-http/commit/6129e41cdb3d2debd9ca401ef94fd80fe21ec6e4))





## [1.0.1](https://github.com/vitorsalgado/drizzle-http/compare/v1.0.0...v1.0.1) (2021-03-03)


### Bug Fixes

* filter package.json before publish to avoid install problems ([fd5ff05](https://github.com/vitorsalgado/drizzle-http/commit/fd5ff058f7214524187861e2a03a4447cdff787f))





# [1.0.0](https://github.com/vitorsalgado/drizzle-http/compare/v0.0.1-alpha.0...v1.0.0) (2021-03-03)


### Bug Fixes

* fetch package test build ([1ef0aa6](https://github.com/vitorsalgado/drizzle-http/commit/1ef0aa64d9a8970ece2c791ed394a10451ef9dcd))
* **dependabot:** fix wrong setup ([5e9b8e0](https://github.com/vitorsalgado/drizzle-http/commit/5e9b8e02236d85d2cda0be99562d34718db5e962))
* apply fixes to versions and release script ([c5e0fe2](https://github.com/vitorsalgado/drizzle-http/commit/c5e0fe2ee6056e42d2866a7fc9ebe229ba446bc0))





## 0.0.1-alpha.0 (2021-03-01)


### Bug Fixes

* add examples to eslint ignore list ([a199932](https://github.com/vitorsalgado/drizzle-http/commit/a19993206082334369021fbe38f94283e93e9d85))
* build scripts ([d3200bc](https://github.com/vitorsalgado/drizzle-http/commit/d3200bc3b879ace2dde75b29200cc0702415ca0d))
* ignore additional folders to avoid lint problems after build ([5c67f7d](https://github.com/vitorsalgado/drizzle-http/commit/5c67f7d76c4c4121c19a088a733a9ba1bc17f132))
* lint problems + fetch pkg ts config + main ts ignores ([42661b4](https://github.com/vitorsalgado/drizzle-http/commit/42661b4bb493e0bfb1fdbfc12895f0140ec08b16))
* name in next val script ([7d4a3ac](https://github.com/vitorsalgado/drizzle-http/commit/7d4a3accacb1f29ba9a447b7abea933bae3539d5))
* prettier config ([88f8a83](https://github.com/vitorsalgado/drizzle-http/commit/88f8a83bb5a294b0c92c2ee517863038ec212649))
* prettier config + fetch tests ([ade8c76](https://github.com/vitorsalgado/drizzle-http/commit/ade8c76ef915d32cf2940cab121d435b46151642))
* **example:** apply fixes to react js sample ([30807a2](https://github.com/vitorsalgado/drizzle-http/commit/30807a28ba92ca0ca2e214b807973d0cda281932))
* **examples:** remove use-strict from ts example ([ea9bcc7](https://github.com/vitorsalgado/drizzle-http/commit/ea9bcc7c38793dd22b8810c7916f1d3ddb510ba4))


### Features

* add drizzle-http initial version ([cd40706](https://github.com/vitorsalgado/drizzle-http/commit/cd4070698f62b45931a7e01805fc4e3f3f59b393))
* add package for nodejs basic imports ([997fbbd](https://github.com/vitorsalgado/drizzle-http/commit/997fbbd2f39f0a1169dc2e6d781d9006b01f62d0))
* update nodejs basic package and add browser basic package ([8147b8a](https://github.com/vitorsalgado/drizzle-http/commit/8147b8ad955c5fd09b834ea731031a623b9f925e))
