# React Cosmos `rspack` plugin

Allows building / running React Cosmos using
[`rspack`](https://www.rspack.dev/).

## Installation

TODO

Install the package:

```
npm install -D react-cosmos-plugin-rspack
```

Add the plugin to your `cosmos.config.json`, e.g.:

```diff
 {
   "$schema": "http://json.schemastore.org/cosmos-config",
+  "plugins": ["react-cosmos-plugin-rspack"],
   "dom": {
     "containerQuerySelector": "#container"
   }
 }
```

## Developing

The easiest way to develop is using [`yalc`](https://github.com/wclr/yalc).

Install it globally and then from this repo do:

```
yarn build
yalc publish
```

Then in your project that is using React Cosmos run:

```
yalc add react-cosmos-plugin-rspack
```
