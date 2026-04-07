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
  const match = Object.entries(FORTE_REFERENCE).find(
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
    iv: compForte ? FORTE_REFERENCE[compForte].iv : "",
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