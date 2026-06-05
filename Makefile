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
	@npm run fmt

.PHONY: fmt-check
fmt-check: # Check project files format
	@npm run fmt:check

.PHONY: lint
lint: # Lint all files
	@npm run lint

# Benchmarks
# ---

.PHONY: bench-build
bench-build: ## Build benchmark package
	@npm run build --workspace @drizzle-http/benchmarks

.PHONY: bench-server
bench-server: bench-build ## Run benchmark HTTP server
	@npm run server --workspace @drizzle-http/benchmarks

.PHONY: bench
bench: ## Run POST benchmark (starts server + client)
	@npm run benchmark

.PHONY: bench-streaming
bench-streaming: ## Run streaming benchmark (starts server + client)
	@npm run benchmark:streaming


# Dev Environment Utilities
# ---

nvm: ## Install Node.js version described on .nvmrc.
	[ -s "$$HOME/.nvm/nvm.sh" ] && . "$$HOME/.nvm/nvm.sh" && \
	nvm install $$(cat .nvmrc) && \
	nvm use
