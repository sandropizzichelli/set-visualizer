import test from "node:test";
import assert from "node:assert/strict";
import { loadSourceModules } from "./helpers/loadSourceModules.js";

test("buildSetPresentationDefaults riporta la UI alla vista base corretta", async () => {
  const { genericSetPageTransitions } = await loadSourceModules();

  assert.deepEqual(genericSetPageTransitions.buildSetPresentationDefaults(), {
    fretboardViewMode: "prime",
    displayMode: "degrees",
    analysisMode: null,
    selectedIntervalClasses: [],
    showComplement: false,
    showAll: false,
    analysisShowAllVoicings: false,
    selected: 0,
    selectedAnalysisClassKey: null,
    selectedAnalysisMemberIndex: 0,
    selectedAnalysisVoicingIndex: 0,
    bassFilter: "all",
    analysisBassFilter: "all",
  });
});

test("buildForteSelectionState azzera la presentazione e torna a Forma primaria", async () => {
  const { genericSetPageTransitions } = await loadSourceModules();

  const dataMap = {
    "5-1": { iv: "432100" },
  };

  const state = genericSetPageTransitions.buildForteSelectionState("5-1", dataMap);

  assert.equal(state.selectedForte, "5-1");
  assert.equal(state.selectedIntervalVector, "432100");
  assert.equal(state.fretboardViewMode, "prime");
  assert.equal(state.displayMode, "degrees");
  assert.equal(state.analysisMode, null);
  assert.equal(state.showAll, false);
  assert.equal(state.bassFilter, "all");
});

test("buildIntervalVectorSelectionState azzera la presentazione e sceglie la prima classe compatibile", async () => {
  const { genericSetPageTransitions } = await loadSourceModules();

  const intervalVectorMap = new Map([["432100", ["5-1", "5-2"]]]);

  const state = genericSetPageTransitions.buildIntervalVectorSelectionState(
    "432100",
    intervalVectorMap
  );

  assert.equal(state.selectedIntervalVector, "432100");
  assert.equal(state.selectedForte, "5-1");
  assert.equal(state.fretboardViewMode, "prime");
  assert.equal(state.displayMode, "degrees");
  assert.equal(state.showComplement, false);
  assert.deepEqual(state.selectedIntervalClasses, []);
});

test("getDisplayModeAfterBrowseModeChange forza Intervalli solo entrando in IV mode da Note", async () => {
  const { genericSetPageTransitions } = await loadSourceModules();

  assert.equal(
    genericSetPageTransitions.getDisplayModeAfterBrowseModeChange("iv", "notes"),
    "intervals"
  );
  assert.equal(
    genericSetPageTransitions.getDisplayModeAfterBrowseModeChange("iv", "degrees"),
    "degrees"
  );
  assert.equal(
    genericSetPageTransitions.getDisplayModeAfterBrowseModeChange("forte", "notes"),
    "notes"
  );
});
