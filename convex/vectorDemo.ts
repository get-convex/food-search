import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { CUISINES, EXAMPLE_DATA } from "./constants";

export type SearchResult = {
  _id: string;
  description: string;
  cuisine: string;
  score: number;
};

async function embed(text: string): Promise<number[]> {
  const key = process.env.OPENAI_KEY;
  if (!key) {
    throw new Error("OPENAI_KEY environment variable not set!");
  }
  const req = { input: text, model: "text-embedding-ada-002" };
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(req),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI API error: ${msg}`);
  }
  const json = await resp.json();
  const vector = json["data"][0]["embedding"];
  console.log(`Computed embedding of "${text}": ${vector.length} dimensions`);
  return vector;
}

export const populate = action({
  args: {},
  handler: async (ctx) => {
    for (const doc of EXAMPLE_DATA) {
      const embedding = await embed(doc.description);
      await ctx.runMutation(internal.vectorDemo.insertRow, {
        cuisine: doc.cuisine,
        description: doc.description,
        embedding,
      });
    }
  },
});

export const insert = action({
  args: { cuisine: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const embedding = await embed(args.description);
    const doc = {
      cuisine: args.cuisine,
      description: args.description,
      embedding,
    };
    await ctx.runMutation(internal.vectorDemo.insertRow, doc);
  },
});

export const insertRow = internalMutation({
  args: {
    description: v.string(),
    cuisine: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    if (!CUISINES.hasOwnProperty(args.cuisine)) {
      throw new Error(`Invalid cuisine: ${args.cuisine}`);
    }
    await ctx.db.insert("foods", args);
  },
});

export const list = query(async (ctx) => {
  const docs = await ctx.db.query("foods").order("desc").collect();
  return docs.map((doc) => {
    return { _id: doc._id, description: doc.description, cuisine: doc.cuisine };
  });
});

export const search = action({
  args: { query: v.string(), cuisines: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const embedding = await embed(args.query);
    let results;
    if (args.cuisines !== undefined) {
      results = await ctx.vectorSearch("foods", "by_embedding", {
        vectorField: "embedding",
        vector: embedding,
        limit: 16,
        filter: (q) => q.in("cuisine", args.cuisines!),
      });
    } else {
      results = await ctx.vectorSearch("foods", "by_embedding", {
        vectorField: "embedding",
        vector: embedding,
        limit: 16,
      });
    }
    const rows: SearchResult[] = await ctx.runQuery(
      internal.vectorDemo.fetchResults,
      { results }
    );
    return rows;
  },
});

export const fetchResults = internalQuery({
  args: {
    results: v.array(v.object({ _id: v.id("foods"), score: v.float64() })),
  },
  handler: async (ctx, args) => {
    const out: SearchResult[] = [];
    for (const result of args.results) {
      const doc = await ctx.db.get(result._id);
      if (!doc) {
        continue;
      }
      out.push({
        _id: doc._id,
        description: doc.description,
        cuisine: doc.cuisine,
        score: result.score,
      });
    }
    return out;
  },
});
