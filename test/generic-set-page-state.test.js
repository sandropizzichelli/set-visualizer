import test from "node:test";
import assert from "node:assert/strict";
import { loadSourceModules } from "./helpers/loadSourceModules.js";

test("buildUrlStateFromParams mantiene i filtri bass 0-based validi", async () => {
  const { genericSetPageState } = await loadSourceModules();

  const keys = ["5-1", "5-2"];
  const dataMap = {
    "5-1": { iv: "432100" },
    "5-2": { iv: "332110" },
  };
  const params = new URLSearchParams(
    "forte=5-1&bass=0&abass=7&spacing=close&iv=432100&ic=1,3,6"
  );

  const state = genericSetPageState.buildUrlStateFromParams(
    params,
    keys,
    dataMap,
    5
  );

  assert.equal(state.selectedForte, "5-1");
  assert.equal(state.bassFilter, 0);
  assert.equal(state.analysisBassFilter, 7);
  assert.equal(state.voicingLayoutFilter, "close");
  assert.deepEqual(state.selectedIntervalClasses, [1, 3, 6]);
});

test("buildUrlStateFromParams neutralizza valori URL non validi", async () => {
  const { genericSetPageState } = await loadSourceModules();

  const keys = ["6-1", "6-2"];
  const dataMap = {
    "6-1": { iv: "654321" },
    "6-2": { iv: "543210" },
  };
  const params = new URLSearchParams(
    "forte=6-2&bass=12&abass=-1&spacing=spread&iv=999999&subset=2&superset=13&ic=0,2,7,4"
  );

  const state = genericSetPageState.buildUrlStateFromParams(
    params,
    keys,
    dataMap,
    6
  );

  assert.equal(state.selectedForte, "6-2");
  assert.equal(state.selectedIntervalVector, "543210");
  assert.equal(state.bassFilter, "all");
  assert.equal(state.analysisBassFilter, "all");
  assert.equal(state.voicingLayoutFilter, "all");
  assert.equal(state.subsetTargetCardinality, 5);
  assert.equal(state.supersetTargetCardinality, 7);
  assert.deepEqual(state.selectedIntervalClasses, [2, 4]);
});

test("getAvailableVoicingLayoutFilters rimuove spread negli esacordi", async () => {
  const { genericSetPageState } = await loadSourceModules();

  assert.deepEqual(
    genericSetPageState.getAvailableVoicingLayoutFilters(5),
    ["all", "close", "spread"]
  );
  assert.deepEqual(
    genericSetPageState.getAvailableVoicingLayoutFilters(6),
    ["all", "close"]
  );
});

test("getAvailableBrowseModes aggiunge Per generi da tetracordi in su", async () => {
  const { genericSetPageState } = await loadSourceModules();

  assert.deepEqual(genericSetPageState.getAvailableBrowseModes(3), ["forte", "iv"]);
  assert.deepEqual(genericSetPageState.getAvailableBrowseModes(4), [
    "forte",
    "iv",
    "genus",
  ]);
});

test("buildUrlStateFromParams legge la chiave di accesso per generi", async () => {
  const { genericSetPageState } = await loadSourceModules();

  const keys = ["5-1", "5-2", "5-Z36"];
  const dataMap = {
    "5-1": { iv: "432100" },
    "5-2": { iv: "322110" },
    "5-Z36": { iv: "222222" },
  };
  const params = new URLSearchParams("browse=genus&genus=5&forte=5-1");

  const state = genericSetPageState.buildUrlStateFromParams(
    params,
    keys,
    dataMap,
    5
  );

  assert.equal(state.browseMode, "genus");
  assert.equal(state.selectedGenusId, "5");
  assert.equal(state.selectedForte, "5-1");
});

test("la mappa dei genera risolve correttamente anche le classi Z", async () => {
  const { setData } = await loadSourceModules();

  const pentachordGenera = setData.getForteGeneraForCardinality(5);
  const chromaticGenus = pentachordGenera.find((genus) => genus.id === "5");

  assert.ok(chromaticGenus);
  assert.ok(chromaticGenus.keys.includes("5-1"));
  assert.ok(chromaticGenus.keys.includes("5-Z36"));
});

test("le utility URL scrivono e cancellano i parametri in modo coerente", async () => {
  const { urlState } = await loadSourceModules();

  const params = new URLSearchParams();

  urlState.setSearchParam(params, "forte", "5-1");
  urlState.setSearchParam(params, "view", "");
  urlState.setBooleanSearchParam(params, "showAll", true);
  urlState.setBooleanSearchParam(params, "complement", false);

  assert.equal(params.get("forte"), "5-1");
  assert.equal(params.has("view"), false);
  assert.equal(params.get("showAll"), "1");
  assert.equal(params.has("complement"), false);
});
