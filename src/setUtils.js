import {
  STRINGS,
  NOTE_TO_PC,
  PC_TO_NAME,
  FRET_COUNT,
  DEFAULT_MAX_SPAN,
  ALL_3_STRING_GROUPS,
  ALL_4_STRING_GROUPS,
  ALL_5_STRING_GROUPS,
  ALL_6_STRING_GROUPS,
  FORTE_REFERENCE,
} from "./setData";

const TRICHORD_REFERENCE = {
  "3-1": { pf: "012", iv: "210000" },
  "3-2": { pf: "013", iv: "111000" },
  "3-3": { pf: "014", iv: "101100" },
  "3-4": { pf: "015", iv: "100110" },
  "3-5": { pf: "016", iv: "100011" },
  "3-6": { pf: "024", iv: "020100" },
  "3-7": { pf: "025", iv: "011010" },
  "3-8": { pf: "026", iv: "010101" },
  "3-9": { pf: "027", iv: "010020" },
  "3-10": { pf: "036", iv: "002001" },
  "3-11": { pf: "037", iv: "001110" },
  "3-12": { pf: "048", iv: "000300" },
};

function getCombinedForteReference() {
  return {
    ...TRICHORD_REFERENCE,
    ...FORTE_REFERENCE,
  };
}

export function normalizeNote(input) {
  return input.trim().replace(/♯/g, "#").replace(/♭/g, "b");
}

export function parseNotes(text) {
  const parts = text
    .split(/[,\s]+/)
    .map(normalizeNote)
    .filter(Boolean);
  const pcs = [];
  const invalid = [];

  for (const p of parts) {
    if (NOTE_TO_PC[p] === undefined) invalid.push(p);
    else pcs.push(NOTE_TO_PC[p]);
  }

  return { pcs: [...new Set(pcs)], invalid };
}

export function combinationsOfThree(items) {
  const result = [];
  for (let i = 0; i < items.length - 2; i++) {
    for (let j = i + 1; j < items.length - 1; j++) {
      for (let k = j + 1; k < items.length; k++) {
        result.push([items[i], items[j], items[k]]);
      }
    }
  }
  return result;
}

export function rotateToStartAtZero(arr) {
  return arr.map((x) => (x - arr[0] + 12) % 12);
}

function invertSet(arr) {
  return arr.map((x) => (12 - x) % 12).sort((a, b) => a - b);
}

export function comparePackedForms(a, b) {
  for (let i = a.length - 1; i >= 1; i--) {
    const da = a[i] - a[0];
    const db = b[i] - b[0];
    if (da !== db) return da - db;
  }
  return 0;
}

export function normalOrder(set) {
  const pcs = [...new Set(set)].sort((a, b) => a - b);
  if (pcs.length <= 1) return pcs;

  const rotations = [];
  for (let i = 0; i < pcs.length; i++) {
    const rot = [];
    for (let j = 0; j < pcs.length; j++) {
      let value = pcs[(i + j) % pcs.length];
      if (i + j >= pcs.length) value += 12;
      rot.push(value);
    }
    rotations.push(rot);
  }

  rotations.sort((a, b) => {
    const spanA = a[a.length - 1] - a[0];
    const spanB = b[b.length - 1] - b[0];
    if (spanA !== spanB) return spanA - spanB;
    return comparePackedForms(a, b);
  });

  return rotations[0].map((x) => x % 12);
}

export function primeForm(set) {
  const n1 = normalOrder(set);
  const t1 = rotateToStartAtZero(n1);

  const inv = invertSet(set);
  const n2 = normalOrder(inv);
  const t2 = rotateToStartAtZero(n2);

  for (let i = t1.length - 1; i >= 1; i--) {
    if (t1[i] !== t2[i]) return t1[i] < t2[i] ? t1 : t2;
  }
  return t1;
}

export function pcsToLabel(pcs) {
  return pcs.map((pc) => PC_TO_NAME[pc]).join(" – ");
}

export function pcAt(stringIndex, fret) {
  return (STRINGS[stringIndex].openPc + fret) % 12;
}

export function absPitchAt(stringIndex, fret) {
  return STRINGS[stringIndex].openAbs + fret;
}

export function parsePfString(pf) {
  return pf.split("").map((ch) => {
    if (ch === "T") return 10;
    if (ch === "E") return 11;
    return Number(ch);
  });
}

export function pfArrayToString(arr) {
  return arr
    .map((n) => {
      if (n === 10) return "T";
      if (n === 11) return "E";
      return String(n);
    })
    .join("");
}

export function normalizePcs(pcs) {
  return [...new Set(pcs.map((pc) => ((pc % 12) + 12) % 12))].sort(
    (a, b) => a - b
  );
}

export function transposePcs(pcs, n) {
  return normalizePcs(pcs.map((pc) => (pc + n) % 12));
}

export function invertPcsAroundZero(pcs) {
  return normalizePcs(pcs.map((pc) => (12 - pc) % 12));
}

export function transformPcs(pcs, mode, n) {
  if (mode === "base") return normalizePcs(pcs);
  if (mode === "tn") return transposePcs(pcs, n);
  if (mode === "tni") return transposePcs(invertPcsAroundZero(pcs), n);
  return normalizePcs(pcs);
}

export function getTransformLabel(mode, n) {
  if (mode === "base") return "Originale";
  if (mode === "tn") return `T${n}`;
  if (mode === "tni") return `T${n}I`;
  return "Originale";
}

export function transformOrderedPrimeForm(pf, mode, n) {
  if (mode === "base") return pf.map((pc) => ((pc % 12) + 12) % 12);

  if (mode === "tn") {
    return pf.map((pc) => (pc + n) % 12);
  }

  if (mode === "tni") {
    return pf.map((pc) => (((12 - pc) % 12) + n) % 12);
  }

  return pf.map((pc) => ((pc % 12) + 12) % 12);
}

export function makeDegreeMapFromPrimeForm(primeFormArray, mode, amount) {
  const transformed = transformOrderedPrimeForm(primeFormArray, mode, amount);
  const map = new Map();
  transformed.forEach((pc, idx) => {
    map.set(pc, idx + 1);
  });
  return map;
}

export function findForteNumberByPf(arr) {
  const key = pfArrayToString(arr);
  const reference = getCombinedForteReference();

  const match = Object.entries(reference).find(
    ([, value]) => value.pf === key
  );

  return match ? match[0] : null;
}

export function complementFromPcs(pcs) {
  const universe = Array.from({ length: 12 }, (_, i) => i);
  const comp = universe.filter((pc) => !pcs.includes(pc));
  const compPf = primeForm(comp);
  const compForte = findForteNumberByPf(compPf);

  return {
    pcs: normalizePcs(comp),
    pf: pfArrayToString(compPf),
    forte: compForte || "n.d.",
    iv: compForte ? getCombinedForteReference()[compForte]?.iv || "" : "",
  };
}

export function makeStructuralKey(voicing) {
  const orderedPcs = voicing.positions.map((p) => p.pc).join(",");
  const frets = voicing.positions.map((p) => p.fret);
  const min = Math.min(...frets);
  const normalizedFretShape = frets.map((f) => f - min).join(",");
  return `${voicing.stringPattern}|${orderedPcs}|${normalizedFretShape}`;
}

export function getBassPosition(voicing) {
  if (!voicing?.positions?.length) return null;

  let minPitch = Infinity;
  let bassPosition = null;

  voicing.positions.forEach((p) => {
    const abs = absPitchAt(p.stringIndex, p.fret);
    if (abs < minPitch) {
      minPitch = abs;
      bassPosition = p;
    }
  });

  return bassPosition;
}

export function getBassDegree(voicing, degreeMap) {
  const bassPosition = getBassPosition(voicing);
  if (!bassPosition) return null;
  return degreeMap?.get(bassPosition.pc) ?? null;
}

export function getLowestPc(voicing) {
  const bassPosition = getBassPosition(voicing);
  return bassPosition ? bassPosition.pc : null;
}

export function filterByBassDegree(voicings, bassFilter, degreeMap) {
  if (bassFilter === "all") return voicings;
  return voicings.filter(
    (v) => getBassDegree(v, degreeMap) === Number(bassFilter)
  );
}

export function compareVoicingsForDisplay(a, b) {
  const compactnessA = a.compactnessScore ?? Number.POSITIVE_INFINITY;
  const compactnessB = b.compactnessScore ?? Number.POSITIVE_INFINITY;

  if (compactnessA !== compactnessB) {
    return compactnessA - compactnessB;
  }

  if (a.lowestFret !== b.lowestFret) {
    return a.lowestFret - b.lowestFret;
  }

  if (a.span !== b.span) return a.span - b.span;

  if (a.hasSkip !== b.hasSkip) {
    return Number(a.hasSkip) - Number(b.hasSkip);
  }

  return a.stringPattern.localeCompare(b.stringPattern);
}

export function findNNoteVoicings(targetPcs, maxSpan, groups, noteCount) {
  const results = [];

  const iterate = (lists, depth, acc, callback) => {
    if (depth === lists.length) {
      callback(acc);
      return;
    }
    for (const item of lists[depth]) {
      iterate(lists, depth + 1, [...acc, item], callback);
    }
  };

  for (const group of groups) {
    const candidates = group.map((stringIndex) => {
      const hits = [];
      for (let fret = 0; fret <= FRET_COUNT; fret++) {
        const pc = pcAt(stringIndex, fret);
        if (targetPcs.includes(pc)) {
          hits.push({ stringIndex, fret, pc });
        }
      }
      return hits;
    });

    iterate(candidates, 0, [], (positions) => {
      const pcs = positions.map((p) => p.pc);
      const unique = new Set(pcs);
      if (unique.size !== noteCount) return;

      const frets = positions.map((p) => p.fret);
      const positiveFrets = frets.filter((f) => f > 0);
      const minRef = positiveFrets.length ? Math.min(...positiveFrets) : 0;
      const span = Math.max(...frets) - minRef;
      if (span > maxSpan) return;

      const stringGaps = [];
      for (let i = 1; i < group.length; i++) {
        stringGaps.push(group[i] - group[i - 1]);
      }
      const hasSkip = stringGaps.some((gap) => gap > 1);

      results.push({
        strings: group,
        positions,
        span,
        lowestFret: Math.min(...frets),
        hasSkip,
        stringPattern: group.map((x) => STRINGS[x].name).join("-"),
      });
    });
  }

  return results;
}

export function findVoicings(targetPcs, maxSpan = DEFAULT_MAX_SPAN) {
  return findNNoteVoicings(targetPcs, maxSpan, ALL_3_STRING_GROUPS, 3);
}

export function findTetrachordVoicings(targetPcs, maxSpan = DEFAULT_MAX_SPAN) {
  return findNNoteVoicings(targetPcs, maxSpan, ALL_4_STRING_GROUPS, 4);
}

export function findPentachordVoicings(targetPcs, maxSpan = DEFAULT_MAX_SPAN) {
  return findNNoteVoicings(targetPcs, maxSpan, ALL_5_STRING_GROUPS, 5);
}

export function findHexachordVoicings(targetPcs, maxSpan = DEFAULT_MAX_SPAN) {
  return findNNoteVoicings(targetPcs, maxSpan, ALL_6_STRING_GROUPS, 6);
}

function getPitchClassPositions(targetPc) {
  const results = [];

  STRINGS.forEach((stringItem, stringIndex) => {
    for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
      if (pcAt(stringIndex, fret) !== targetPc) continue;

      results.push({
        stringIndex,
        fret,
        pc: targetPc,
      });
    }
  });

  return results;
}

function getPrimaryFormStepCost(previous, current) {
  const fretDistance = Math.abs(current.fret - previous.fret);
  const stringDistance = Math.abs(current.stringIndex - previous.stringIndex);
  const skipPenalty = stringDistance > 1 ? (stringDistance - 1) * 9 : 0;

  return fretDistance * 11 + stringDistance * 8 + skipPenalty;
}

function getPrimaryFormCompactness(positions) {
  const frets = positions.map((position) => position.fret);
  const positiveFrets = frets.filter((fret) => fret > 0);
  const minReferenceFret = positiveFrets.length ? Math.min(...positiveFrets) : 0;
  const highestFret = Math.max(...frets);
  const span = highestFret - minReferenceFret;
  const lowestFret = Math.min(...frets);
  const stringIndexes = positions.map((position) => position.stringIndex);
  const stringSpan = Math.max(...stringIndexes) - Math.min(...stringIndexes);

  let totalFretTravel = 0;
  let totalStringTravel = 0;
  let maxFretJump = 0;
  let stringSkipPenalty = 0;
  let hasSkip = false;

  for (let index = 1; index < positions.length; index += 1) {
    const previous = positions[index - 1];
    const current = positions[index];
    const fretDistance = Math.abs(current.fret - previous.fret);
    const stringDistance = Math.abs(current.stringIndex - previous.stringIndex);

    totalFretTravel += fretDistance;
    totalStringTravel += stringDistance;
    maxFretJump = Math.max(maxFretJump, fretDistance);

    if (stringDistance > 1) {
      hasSkip = true;
      stringSkipPenalty += (stringDistance - 1) * 8;
    }
  }

  const compactnessScore =
    span * 100 +
    stringSpan * 55 +
    maxFretJump * 24 +
    totalFretTravel * 12 +
    totalStringTravel * 7 +
    stringSkipPenalty +
    highestFret;

  return {
    span,
    lowestFret,
    hasSkip,
    compactnessScore,
  };
}

export function buildPrimaryFormVoicings(orderedPcs) {
  if (!orderedPcs?.length) return [];

  const positionMap = new Map();
  const results = [];

  orderedPcs.forEach((pc) => {
    if (!positionMap.has(pc)) {
      positionMap.set(pc, getPitchClassPositions(pc));
    }
  });

  const startPositions = positionMap.get(orderedPcs[0]) || [];
  if (!startPositions.length) return [];

  const walk = (depth, positions) => {
    if (depth === orderedPcs.length) {
      const compactness = getPrimaryFormCompactness(positions);

      results.push({
        strings: positions.map((position) => position.stringIndex),
        positions,
        span: compactness.span,
        lowestFret: compactness.lowestFret,
        hasSkip: compactness.hasSkip,
        stringPattern: positions
          .map((position) => STRINGS[position.stringIndex].name)
          .join("-"),
        compactnessScore: compactness.compactnessScore,
        isPrimaryForm: true,
      });
      return;
    }

    const previousPosition = positions[positions.length - 1];
    const targetPositions = [...(positionMap.get(orderedPcs[depth]) || [])];
    if (!targetPositions.length) return;

    targetPositions.sort((first, second) => {
      const scoreDifference =
        getPrimaryFormStepCost(previousPosition, first) -
        getPrimaryFormStepCost(previousPosition, second);

      if (scoreDifference !== 0) return scoreDifference;

      if (first.fret !== second.fret) return first.fret - second.fret;
      return first.stringIndex - second.stringIndex;
    });

    targetPositions.forEach((targetPosition) => {
      walk(depth + 1, [...positions, targetPosition]);
    });
  };

  startPositions.forEach((startPosition) => {
    walk(1, [startPosition]);
  });

  return results.sort(compareVoicingsForDisplay);
}

export function buildPrimaryFormVoicing(orderedPcs) {
  return buildPrimaryFormVoicings(orderedPcs)[0] || null;
}

export function groupVoicingsByStructure(voicings) {
  const grouped = new Map();

  voicings.forEach((voicing) => {
    const key = makeStructuralKey(voicing);

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key).push(voicing);
  });

  return [...grouped.values()]
    .map((occurrences) => {
      const sortedOccurrences = [...occurrences].sort(compareVoicingsForDisplay);
      const representative = sortedOccurrences[0];
      const lowestFrets = sortedOccurrences.map((item) => item.lowestFret);

      return {
        ...representative,
        occurrenceCount: sortedOccurrences.length,
        occurrences: sortedOccurrences,
        occurrenceRange: {
          from: Math.min(...lowestFrets),
          to: Math.max(...lowestFrets),
        },
      };
    })
    .sort(compareVoicingsForDisplay);
}

function combinationsOfSize(items, size, start = 0, prefix = [], result = []) {
  if (prefix.length === size) {
    result.push([...prefix]);
    return result;
  }

  for (let i = start; i <= items.length - (size - prefix.length); i++) {
    prefix.push(items[i]);
    combinationsOfSize(items, size, i + 1, prefix, result);
    prefix.pop();
  }

  return result;
}

function comparePcArrays(a, b) {
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }

  return a.length - b.length;
}

function parseForteNameForSort(name) {
  if (!name) {
    return {
      cardinality: Infinity,
      number: Infinity,
      isZ: true,
    };
  }

  const [cardinalityPart, restPart] = name.split("-");
  const isZ = restPart.startsWith("Z");
  const number = parseInt(restPart.replace("Z", ""), 10);

  return {
    cardinality: parseInt(cardinalityPart, 10),
    number,
    isZ,
  };
}

function compareForteNames(a, b) {
  if (a === b) return 0;
  if (a && !b) return -1;
  if (!a && b) return 1;

  const A = parseForteNameForSort(a);
  const B = parseForteNameForSort(b);

  if (A.cardinality !== B.cardinality) {
    return A.cardinality - B.cardinality;
  }

  if (A.number !== B.number) {
    return A.number - B.number;
  }

  if (A.isZ !== B.isZ) {
    return A.isZ ? 1 : -1;
  }

  return String(a).localeCompare(String(b));
}

function sortClassResults(classes) {
  return [...classes].sort((a, b) => {
    if (a.cardinality !== b.cardinality) {
      return b.cardinality - a.cardinality;
    }

    const forteCompare = compareForteNames(a.forteName, b.forteName);
    if (forteCompare !== 0) return forteCompare;

    return comparePcArrays(a.primeForm, b.primeForm);
  });
}

export function getConcreteSubsets(pcs, options = {}) {
  const normalized = normalizePcs(pcs);
  const defaultMax = normalized.length - 1;

  const minCardinality = Math.max(1, options.minCardinality ?? 1);
  const maxCardinality = Math.min(
    defaultMax,
    options.maxCardinality ?? defaultMax
  );

  if (normalized.length === 0) return [];
  if (minCardinality > maxCardinality) return [];

  const results = [];

  for (let k = maxCardinality; k >= minCardinality; k--) {
    const combos = combinationsOfSize(normalized, k);
    combos.forEach((combo) => {
      results.push({
        pcs: combo,
        cardinality: combo.length,
      });
    });
  }

  return results;
}

export function getSubsetClasses(pcs, options = {}) {
  const concreteSubsets = getConcreteSubsets(pcs, options);
  const grouped = new Map();

  concreteSubsets.forEach((subset) => {
    const pf = primeForm(subset.pcs);
    const key = pf.join(",");

    if (!grouped.has(key)) {
      const forteName = findForteNumberByPf(pf);
      grouped.set(key, {
        primeForm: pf,
        forteName,
        iv: forteName ? getCombinedForteReference()[forteName]?.iv || "" : "",
        cardinality: pf.length,
        concreteCount: 0,
        members: [],
      });
    }

    const entry = grouped.get(key);
    entry.concreteCount += 1;
    entry.members.push(subset.pcs);
  });

  const results = Array.from(grouped.values()).map((entry) => ({
    ...entry,
    members: [...entry.members].sort(comparePcArrays),
  }));

  return sortClassResults(results);
}

export function getConcreteSupersets(pcs, targetCardinality) {
  const normalized = normalizePcs(pcs);
  const sourceCardinality = normalized.length;

  if (sourceCardinality === 0) return [];
  if (targetCardinality <= sourceCardinality) return [];
  if (targetCardinality > 12) return [];

  const universe = Array.from({ length: 12 }, (_, i) => i);
  const missing = universe.filter((pc) => !normalized.includes(pc));
  const addCount = targetCardinality - sourceCardinality;

  if (addCount > missing.length) return [];

  const additions = combinationsOfSize(missing, addCount);

  return additions
    .map((extra) => {
      const superset = normalizePcs([...normalized, ...extra]);
      return {
        pcs: superset,
        cardinality: superset.length,
      };
    })
    .sort((a, b) => comparePcArrays(a.pcs, b.pcs));
}

export function getSupersetClasses(pcs, targetCardinality) {
  const concreteSupersets = getConcreteSupersets(pcs, targetCardinality);
  const grouped = new Map();

  concreteSupersets.forEach((superset) => {
    const pf = primeForm(superset.pcs);
    const key = pf.join(",");

    if (!grouped.has(key)) {
      const forteName = findForteNumberByPf(pf);
      grouped.set(key, {
        primeForm: pf,
        forteName,
        iv: forteName ? getCombinedForteReference()[forteName]?.iv || "" : "",
        cardinality: pf.length,
        concreteCount: 0,
        members: [],
      });
    }

    const entry = grouped.get(key);
    entry.concreteCount += 1;
    entry.members.push(superset.pcs);
  });

  const results = Array.from(grouped.values()).map((entry) => ({
    ...entry,
    members: [...entry.members].sort(comparePcArrays),
  }));

  return sortClassResults(results);
}
