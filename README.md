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

Once everything's installed, open the Vite app in your browser. This app demonstrates semantic
search with Convex's vector database, where each row is a description of some type of food, tagged by
its cuisine. You can add new rows with the second section or click the "Populate test data" button to
fill in some initial test data. Then, you can search for foods, optionally specifying cuisines to filter
by, which will use Convex's vector indexing to perform nearest neighbors search.
