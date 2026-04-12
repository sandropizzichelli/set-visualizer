export function getCardinalityLabel(n) {
  const labels = {
    3: "Tricordi",
    4: "Tetracordi",
    5: "Pentacordi",
    6: "Esacordi",
    7: "Eptacordi",
    8: "Ottacordi",
    9: "Enneacordi",
    10: "Decacordi",
    11: "Undecacordi",
    12: "Dodecacordi",
  };

  return labels[n] || `Cardinalità ${n}`;
}

export const INTERVAL_STYLES = [
  { solid: ["#0f5f5a", "#24b6a1"], soft: ["rgba(15,95,90,0.2)", "rgba(36,182,161,0.22)"] },
  { solid: ["#125e73", "#2ab8da"], soft: ["rgba(18,94,115,0.2)", "rgba(42,184,218,0.2)"] },
  { solid: ["#2150a6", "#5d88f2"], soft: ["rgba(33,80,166,0.2)", "rgba(93,136,242,0.18)"] },
  { solid: ["#5b3aa7", "#9f76ff"], soft: ["rgba(91,58,167,0.2)", "rgba(159,118,255,0.18)"] },
  { solid: ["#7f2f83", "#d96bc8"], soft: ["rgba(127,47,131,0.18)", "rgba(217,107,200,0.2)"] },
  { solid: ["#9a345a", "#f0719d"], soft: ["rgba(154,52,90,0.18)", "rgba(240,113,157,0.18)"] },
  { solid: ["#b0482a", "#ff9f5c"], soft: ["rgba(176,72,42,0.2)", "rgba(255,159,92,0.2)"] },
  { solid: ["#9f5a16", "#f7ba45"], soft: ["rgba(159,90,22,0.18)", "rgba(247,186,69,0.22)"] },
  { solid: ["#847515", "#d1cc53"], soft: ["rgba(132,117,21,0.16)", "rgba(209,204,83,0.24)"] },
  { solid: ["#5e7f1b", "#9dd84b"], soft: ["rgba(94,127,27,0.18)", "rgba(157,216,75,0.22)"] },
  { solid: ["#2d7d38", "#64d377"], soft: ["rgba(45,125,56,0.18)", "rgba(100,211,119,0.22)"] },
  { solid: ["#0d7a63", "#3ed4a7"], soft: ["rgba(13,122,99,0.18)", "rgba(62,212,167,0.2)"] },
];

export function getClassKey(item) {
  return `${item.forteName || "n.d."}|${item.primeForm.join("-")}`;
}

export function formatIntervalVector(intervalVector) {
  return `⟨${intervalVector.split("").join(",")}⟩`;
}

export function formatSemitoneLabel(value) {
  return value === 0 ? "0" : `+${value}`;
}

export function getIntervalStyle(interval) {
  const safeInterval = ((interval % INTERVAL_STYLES.length) + INTERVAL_STYLES.length) % INTERVAL_STYLES.length;
  return INTERVAL_STYLES[safeInterval];
}

export function buildIntervalMapFromOrderedPcs(orderedPcs) {
  const map = new Map();
  if (!orderedPcs?.length) return map;

  const anchor = orderedPcs[0];
  orderedPcs.forEach((pc) => {
    map.set(pc, (pc - anchor + 12) % 12);
  });

  return map;
}

export function buildIntervalLegend(orderedPcs) {
  const intervalMap = buildIntervalMapFromOrderedPcs(orderedPcs);

  return orderedPcs.map((pc) => ({
    pc,
    interval: intervalMap.get(pc) ?? 0,
    label: formatSemitoneLabel(intervalMap.get(pc) ?? 0),
  }));
}

export function buildIntervalClassBreakdown(intervalVector) {
  return intervalVector.split("").map((count, index) => ({
    ic: index + 1,
    count: Number(count),
  }));
}

export function buildIntervalClassPitchClassMap(orderedPcs) {
  const map = new Map();

  for (let intervalClass = 1; intervalClass <= 6; intervalClass += 1) {
    map.set(intervalClass, new Set());
  }

  if (!orderedPcs?.length) return map;

  for (let firstIndex = 0; firstIndex < orderedPcs.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < orderedPcs.length;
      secondIndex += 1
    ) {
      const firstPc = orderedPcs[firstIndex];
      const secondPc = orderedPcs[secondIndex];
      const distance = (secondPc - firstPc + 12) % 12;
      const intervalClass = Math.min(distance, 12 - distance);

      if (!intervalClass) continue;

      map.get(intervalClass)?.add(firstPc);
      map.get(intervalClass)?.add(secondPc);
    }
  }

  return map;
}
