/**
 * Smoke tests
 * Run: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY, findById, filterByTag } from "./registry.js";

describe("Registry", () => {
  it("has at least 5 models", () => {
    assert.ok(REGISTRY.length >= 5, `Expected >= 5 models, got ${REGISTRY.length}`);
  });

  it("every model has required fields", () => {
    for (const m of REGISTRY) {
      assert.ok(m.id,          `Missing 'id' in ${JSON.stringify(m)}`);
      assert.ok(m.name,        `${m.id}: missing 'name'`);
      assert.ok(m.model,       `${m.id}: missing 'model'`);
      assert.ok(m.provider,    `${m.id}: missing 'provider'`);
      assert.ok(m.description, `${m.id}: missing 'description'`);
      assert.ok(Array.isArray(m.tags), `${m.id}: 'tags' must be an array`);
      assert.ok(m.model.includes("/"), `${m.id}: model ID must be 'provider/name', got '${m.model}'`);
      assert.ok(typeof m.inputCost === "number",  `${m.id}: inputCost must be a number`);
      assert.ok(typeof m.outputCost === "number", `${m.id}: outputCost must be a number`);
      assert.ok(typeof m.context === "number",    `${m.id}: context must be a number`);
    }
  });

  it("has no duplicate ids", () => {
    const ids = REGISTRY.map((m) => m.id);
    const unique = new Set(ids);
    assert.equal(ids.length, unique.size, `Duplicate ids found: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
  });

  it("has no duplicate OpenRouter model strings", () => {
    const models = REGISTRY.map((m) => m.model);
    const unique = new Set(models);
    assert.equal(models.length, unique.size, `Duplicate model strings found`);
  });

  it("findById returns correct entry", () => {
    const first = REGISTRY[0];
    assert.deepEqual(findById(first.id), first);
  });

  it("findById returns null for unknown id", () => {
    assert.equal(findById("does-not-exist"), null);
  });

  it("filterByTag returns only matching models", () => {
    const coding = filterByTag("coding");
    assert.ok(coding.length > 0, "Expected at least one 'coding' model");
    assert.ok(coding.every((m) => m.tags.includes("coding")));
  });

  it("all costs are positive", () => {
    for (const m of REGISTRY) {
      assert.ok(m.inputCost > 0,  `${m.id}: inputCost must be > 0`);
      assert.ok(m.outputCost > 0, `${m.id}: outputCost must be > 0`);
    }
  });
});
