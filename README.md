# 🍔 Convex food search

This example demonstrates how to use Convex vector search.

## Running the App

First, install dependencies and deploy the app to Convex.

```
npm install
npm run dev
```

Then, open up the dashboard and set the `OPENAI_KEY` variable.

```
npx convex dashboard
```

Once everything's installed, open the Vite app in your browser.

The "Dishes" view presents the current foods in the database, where each food
has a description and cuisine. You can add another food with the form at the
top of the page.

The "Search" view performs semantic search over foods' descriptions by using
a nearest neighbors query. You can also optionally filter for specific cuisines:
Use Cmd-Click to pick different cuisines to restrict the search to.
