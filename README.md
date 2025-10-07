# React Cosmos `rspack` plugin

Allows building / running React Cosmos using
[`rspack`](https://www.rspack.dev/).

## Installation

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
