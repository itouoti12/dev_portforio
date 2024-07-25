# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
yarn create svelte@latest

# create a new project in my-app
yarn create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `yarn install`, start a development server:

```bash
yarn run dev

# or start the server and open the app in a new browser tab
yarn run dev -- --open
```

## Building

To create a production version of your app:

```bash
yarn run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

# nodenvにバージョンが無い時
- `anyenv update`と`brew upgrade node-build`
- `nodenv install --list`
- `nodenv install xx.xx.x`
- `npm install --global yarn`