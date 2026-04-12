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

export function getClassKey(item) {
  return `${item.forteName || "n.d."}|${item.primeForm.join("-")}`;
}

export function formatIntervalVector(intervalVector) {
  return `⟨${intervalVector.split("").join(",")}⟩`;
}

export function formatSemitoneLabel(value) {
  return value === 0 ? "0" : `+${value}`;
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
