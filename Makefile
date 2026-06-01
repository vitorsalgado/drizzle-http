# Help
# ---
.DEFAULT_GOAL := help
.PHONY: help
help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: test
test: # Run tests
	@npm test

.PHONY: fmt
fmt: # Format all source code
	@npm run prettier

.PHONY: fmt-check
fmt-check: # Check project files format
	@npm run prettier:ci

.PHONY: lint
lint: # Lint all files
	@npm run lint


# Dev Environment Utilities
# ---

nvm: ## Install Node.js version described on .nvmrc.
	[ -s "$$HOME/.nvm/nvm.sh" ] && . "$$HOME/.nvm/nvm.sh" && \
	nvm install $$(cat .nvmrc) && \
	nvm use
