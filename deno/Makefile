# Dev Environment Utilities
# ---

# Help
# ---
.DEFAULT_GOAL := help
.PHONY: help
help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: test
test: # Run Deno tests
	@deno test --import-map=import_map.json --unstable --allow-net --allow-env --allow-read

.PHONY: fmt
fmt: # Run Deno fmt to format all source code
	@deno fmt

.PHONY: fmt-check
fmt-check: # Check project files format
	@deno fmt --check

.PHONY: lint
lint: # Run Deno lint in all files
	@deno lint

.PHONY: bundle
bundle: # Generate Javascript bundle
	@deno bundle mod.ts drizzle.bundle.js
