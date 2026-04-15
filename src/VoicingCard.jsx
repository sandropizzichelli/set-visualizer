import React from "react";

export default function VoicingCard({
  voicing,
  index,
  selected,
  onSelect,
  degreeMap,
}) {
  const numericForm = voicing.positions.map((position) =>
    String(degreeMap?.get(position.pc) ?? position.pc)
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={selected ? "voicing-card voicing-card--selected" : "voicing-card"}
    >
      <div className="voicing-card__header">
        <div>
          <div className="voicing-card__eyebrow">Forma {index + 1}</div>
          <div className="voicing-card__notes">{numericForm.join(" • ")}</div>
        </div>
      </div>
    </button>
  );
}
