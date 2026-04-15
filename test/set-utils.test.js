import test from "node:test";
import assert from "node:assert/strict";
import { loadSourceModules } from "./helpers/loadSourceModules.js";

test("makeDegreeMapFromPrimeForm mantiene la numerazione Forte 0-based", async () => {
  const { setUtils } = await loadSourceModules();

  const baseMap = setUtils.makeDegreeMapFromPrimeForm([0, 1, 2, 3, 4], "base", 0);
  const transposedMap = setUtils.makeDegreeMapFromPrimeForm([0, 1, 4], "tn", 3);
  const invertedMap = setUtils.makeDegreeMapFromPrimeForm([0, 1, 4], "tni", 3);

  assert.deepEqual([...baseMap.entries()], [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ]);

  assert.deepEqual([...transposedMap.entries()], [
    [3, 3],
    [4, 4],
    [7, 7],
  ]);

  assert.deepEqual([...invertedMap.entries()], [
    [3, 3],
    [2, 2],
    [11, 11],
  ]);
});

test("5-1 trova davvero voicing con 0 in basso anche in close voicing", async () => {
  const { setUtils } = await loadSourceModules();

  const target = [0, 1, 2, 3, 4];
  const degreeMap = setUtils.makeDegreeMapFromPrimeForm(target, "base", 0);
  const rawVoicings = setUtils.findPentachordVoicings(target, 5);
  const zeroBassVoicings = setUtils.filterByBassDegree(rawVoicings, 0, degreeMap);
  const closeZeroBassVoicings = zeroBassVoicings.filter((voicing) => !voicing.hasSkip);
  const groupedCloseZeroBassVoicings = setUtils.groupVoicingsByStructure(
    closeZeroBassVoicings
  );

  assert.equal(rawVoicings.length, 110);
  assert.equal(zeroBassVoicings.length, 31);
  assert.equal(groupedCloseZeroBassVoicings.length, 6);
  assert.ok(
    zeroBassVoicings.every(
      (voicing) => setUtils.getBassDegree(voicing, degreeMap) === 0
    )
  );
});

test("groupVoicingsByStructure collassa i duplicati dove esistono posizioni equivalenti", async () => {
  const { setUtils } = await loadSourceModules();

  const target = [0, 1, 2];
  const rawVoicings = setUtils.findVoicings(target, 5);
  const groupedVoicings = setUtils.groupVoicingsByStructure(rawVoicings);

  assert.equal(rawVoicings.length, 53);
  assert.equal(groupedVoicings.length, 52);
  assert.ok(groupedVoicings.every((voicing) => voicing.occurrenceCount >= 1));
  assert.ok(
    groupedVoicings.some((voicing) => voicing.occurrenceCount > 1),
    "ci aspettiamo almeno una forma con più di una posizione concreta"
  );
});

test("buildPrimaryFormVoicings genera percorsi completi e ordinati per la prime form", async () => {
  const { setUtils } = await loadSourceModules();

  const orderedPcs = [0, 1, 2, 3, 4];
  const primaryFormVoicings = setUtils.buildPrimaryFormVoicings(orderedPcs);
  const firstVoicing = primaryFormVoicings[0];

  assert.ok(primaryFormVoicings.length > 0);
  assert.deepEqual(
    firstVoicing.positions.map((position) => position.pc),
    orderedPcs
  );
  assert.equal(firstVoicing.isPrimaryForm, true);
});
