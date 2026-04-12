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
