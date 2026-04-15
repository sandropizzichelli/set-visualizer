import test from "node:test";
import assert from "node:assert/strict";
import { loadSourceModules } from "./helpers/loadSourceModules.js";

test("formatIntervalVector gestisce anche valori mancanti", async () => {
  const { helpers } = await loadSourceModules();

  assert.equal(helpers.formatIntervalVector(undefined), "n.d.");
  assert.equal(helpers.formatIntervalVector("432100"), "⟨4,3,2,1,0,0⟩");
});

test("buildOccurrenceSummary riconosce un segmento contiguo usando orderMap", async () => {
  const { helpers } = await loadSourceModules();

  const activeSet = {
    pcs: [0, 1, 2, 5],
    degreeMap: new Map([
      [0, 0],
      [1, 1],
      [2, 2],
      [5, 5],
    ]),
    orderMap: new Map([
      [0, 0],
      [1, 1],
      [2, 2],
      [5, 3],
    ]),
  };

  const selectedAnalysisClass = {
    primeForm: [0, 1, 2],
  };

  const summary = helpers.buildOccurrenceSummary(
    "subsets",
    activeSet,
    selectedAnalysisClass,
    [0, 1, 2]
  );

  assert.equal(summary.typeLabel, "segmento contiguo");
  assert.deepEqual(summary.retainedDegrees, [0, 1, 2]);
  assert.deepEqual(summary.missingDegrees, [5]);
});

test("buildOccurrenceSummary riconosce una selezione discontinua", async () => {
  const { helpers } = await loadSourceModules();

  const activeSet = {
    pcs: [0, 1, 2, 4, 7],
    degreeMap: new Map([
      [0, 0],
      [1, 1],
      [2, 2],
      [4, 4],
      [7, 7],
    ]),
    orderMap: new Map([
      [0, 0],
      [1, 1],
      [2, 2],
      [4, 3],
      [7, 4],
    ]),
  };

  const selectedAnalysisClass = {
    primeForm: [0, 2, 7],
  };

  const summary = helpers.buildOccurrenceSummary(
    "subsets",
    activeSet,
    selectedAnalysisClass,
    [0, 2, 7]
  );

  assert.equal(summary.typeLabel, "selezione discontinua");
  assert.deepEqual(summary.retainedDegrees, [0, 2, 7]);
  assert.deepEqual(summary.missingDegrees, [1, 4]);
});
