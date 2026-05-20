# @dnb/browserslist-config

Custom [browserslist](https://browsersl.ist/) configuration for DNB services and web applications.

## Usage

Install:

```bash
pnpm add -D @dnb/browserslist-config
yarn add -D @dnb/browserslist-config
npm install -D @dnb/browserslist-config
```

In your `package.json` file:

```json
{
  "browserslist": ["extends @dnb/browserslist-config"]
}
```

## Displaying a list of supported browsers for humans

You can display a list (table) readable for humans:

```ts
import supportedBrowsers from '@dnb/browserslist-config/supportedBrowsers.mjs'

// Will output an array with an object for each browser, containing "name" and "minimumVersion".
```

## Build targets for Vite, esbuild, and other tools

Tools like Vite and esbuild do not read browserslist configuration. This package provides pre-built target strings compatible with these tools:

```ts
import buildTargets from '@dnb/browserslist-config/buildTargets.mjs'

// Returns e.g. ['chrome106', 'edge109', 'firefox115', 'ios13.1', 'opera95', 'safari13.1']
```

Use with Vite:

```ts
import buildTargets from '@dnb/browserslist-config/buildTargets.mjs'

export default defineConfig({
  build: {
    target: buildTargets,
  },
})
```

Use with esbuild:

```ts
import buildTargets from '@dnb/browserslist-config/buildTargets.mjs'

await esbuild.build({
  target: buildTargets,
  // ...
})
```

> **Note:** Samsung Browser is excluded from build targets as it has no esbuild equivalent. Families that share an engine are merged — e.g. Chrome and Chrome Android produce a single `chrome` target using the lower version.

## Development

### Use git commit message descriptions

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to generate our changelogs. Please use the following format for your commit messages:

```txt
feat: add new feature
fix: fix bug
docs: update documentation
refactor: refactor code
perf: improve performance
test: add or update tests
ci: update ci configuration
chore: something else
```

### Squash commits

When you merge a pull request, choose to squash the commits into one commit.

### Release

When a pull request is merged, a new release will be created automatically. The release will be tagged with the version number from the commit message.

## Update Browserslist

**Stay Updated:** Regularly update your caniuse-lite database to ensure Browserslist has the most recent data. You can do this by running:

```bash
yarn dlx update-browserslist-db@latest
```

## Browserslist CLI

**Use the Browserslist CLI for Quick Checks:** You can quickly see which browsers are selected by your current configuration by running:

```bash
yarn browserslist
```
