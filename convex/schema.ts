import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  foods: defineTable({
    description: v.string(),
    cuisine: v.string(),
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimension: 1536,
    filterFields: ["cuisine"],
  }),
});
