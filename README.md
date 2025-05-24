# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Running the Project (After downloading from GitHub)

To get the project up and running after downloading from GitHub, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/[username]/DormManagementSustem.git
   cd DormManagementSustem
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   npm run dev -- --open  # to open in a new browser tab
   ```

4. The application should now be running at `http://localhost:5173`

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
"# DormManagementSustem" 
