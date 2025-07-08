# 📦 TypeScript NPM Package Starter
A simple, fast, and modern template for anyone who wants to get up and running quickly writing TypeScript code for an npm package.

If you’re creating an npm package — this starter is for you.
It’s easy, opinionated, and comes with batteries included.

> ⚡ **Note**:  This starter uses [`pnpm`](https://pnpm.io) for package management.
> Install it globally: `npm install -g pnpm`


# 🚀 Features

✅ TypeScript already configured — no hassle.

✅ Prettier with a shared config: [@samislam/prettier-config](https://www.npmjs.com/package/@samislam/prettier-config).

✅ ESLint with sensible defaults.

✅ .gitignore with useful defaults.

✅ package.json ready with scripts and sane defaults.

✅ Jest setup for unit testing.

✅ Uses [clscripts](https://github.com/CommandLineScripts) for clean, human-readable scripts — never memorize messy CLI chains again.

# 📂 Included scripts
Your package.json already has:
```json
"scripts": {
  "test": "jest",
  "dev": "tsx ./scripts/dev.ts",
  "lint": "tsx ./scripts/lint.ts",
  "clean": "tsx ./scripts/clean.ts",
  "build": "tsx ./scripts/build.ts",
  "format": "tsx ./scripts/format.ts"
}
```
## 📜 What each script does

Build your project - Generate barrels, compile your TypeScript, and show clear output:  
```bash
pnpm build
```

Clean up `node_modules`, build output, and lockfiles:  
```bash
pnpm clean
```

Start your dev environment — runs barrels, type-checks, and transpiles fast with Nodemon + Concurrently:  
```bash
pnpm dev
```

Format all your files using Prettier (ignores barrels):  
```bash
pnpm format
```

Run type-checking and ESLint with clear status messages:  
```bash
pnpm lint
```

Run your tests with Jest:  
```bash
pnpm test
```

## ✅ Example flow

```bash
pnpm install
pnpm dev
# Make changes...
pnpm format
pnpm lint
pnpm test
pnpm build
```


# ✅ How to use
1. Clone this template or copy the setup into your project.
2. Install dependencies:
```bash
pnpm install
```
3. Run pnpm dev to start coding immediately.
4. Use pnpm build when you’re ready to publish.

# ✨ Why use this?
✔️ Zero config TypeScript
✔️ Prettier, ESLint, Jest, barrels — all wired up.
✔️ clscripts make your CLI commands readable and repeatable.
✔️ A real-world pattern you can extend — not a throwaway template.

# 📢 License
Apache-2.0 — do what you want, improve it, share it!

Happy coding! 🚀✨

---

Islam Yamor.