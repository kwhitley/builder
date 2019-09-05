# @supergeneric/builder
----

# Requirements
- [Node (current, v10+)](https://nodejs.org/en/download/current/)
- [Yarn](https://yarnpkg.com/lang/en/docs/install/#mac-stable)

# Get Started (from within a new project folder)
```bash
git init
npm init
yarn add -D @supergeneric/builder
yarn generate
yarn dev

# code stuff in src/client/components/App.jsx and hit save!
```

# Exposed Commands
- `yarn generate` - generates the initial scaffolding.  Use this only once to setup a project.
- `yarn dev` - runs the dev server.  Use this for most development work.
- `yarn build` - builds the project into the `/dist` folder. This is a deployable distribution.
