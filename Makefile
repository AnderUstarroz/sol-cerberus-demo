.PHONY: dependencies

dependencies:
	@if ! [ -d "deps/metaplex" ]; then \
		echo "Adding submodule: Metaplex program library"; \
		git submodule add --force https://github.com/metaplex-foundation/metaplex-program-library deps/metaplex-program-library; \
	fi
	@if ! [ -d "deps/sol-cerberus" ]; then \
		echo "Adding submodule: Sol Cerberus"; \
		git submodule add --force https://github.com/AnderUstarroz/sol-cerberus deps/sol-cerberus; \
	fi
	@echo "installing npm packages"
	yarn
	@echo "installing submodules"
	git submodule update --recursive --init
	@echo "Building token-metadata program.."
	cd deps/metaplex-program-library/token-metadata/program && cargo build-bpf && cd ../../../../
	@echo "Building sol-cerberus program.."
	cd deps/sol-cerberus/programs/sol-cerberus && cargo build-bpf && cd ../../../../
