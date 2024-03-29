# Development

## Requirements
- [Install Rust](https://www.rust-lang.org/tools/install).
- [Install Yarn](https://yarnpkg.com/getting-started/install).
- [Install Solana CLI](https://docs.solana.com/es/cli/install-solana-cli-tools).
- [Install Anchor](https://book.anchor-lang.com/getting_started/installation.html#anchor).
- [Install Node v16.19.0](https://www.npmjs.com/package/n).


### Build/update Solana dependencies
The program requires Metaplex program library for testing NFT access. To build/update the dependencies execute the `./Makefile`  by running the following command within the root directory:
```
make
```
## Testing
The tests are executed using the **cluster** and **wallet** defined within the `./Anchor.toml` file.


## Update dependencies
To update a dependency to his latest version hosted in github, we need to cd into the folder,
for instance for the sol-cerberus dependency:

- `cd deps/sol-cerberus`

Then we fetch the latest version:
```
git fetch
git reset --hard origin/main
```
and update our repository to reflect this:
```
cd ../..  
git add -A
git ci -m "Updated project dependencies"
```

### Run tests
To run the tests execute the following command at the root folder of the project:

```
anchor test
```
