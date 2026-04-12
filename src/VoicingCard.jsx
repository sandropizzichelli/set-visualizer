import React from "react";
import { STRINGS, PC_TO_NAME } from "./setData";
import { getBassDegree } from "./setUtils";
import { formatSemitoneLabel } from "./genericSetPageHelpers";

function MetaChip({ label, value }) {
  return (
    <div className="meta-chip">
      <div className="meta-chip__label">{label}</div>
      <div className="meta-chip__value">{value}</div>
    </div>
  );
}

export default function VoicingCard({
  voicing,
  index,
  selected,
  onSelect,
  displayMode,
  showPrimeForm,
  showForte,
  degreeMap,
  intervalMap,
}) {
  const notes = voicing.positions.map((position) =>
    displayMode === "degrees"
      ? String(degreeMap?.get(position.pc) ?? "")
      : displayMode === "intervals"
        ? formatSemitoneLabel(intervalMap?.get(position.pc) ?? 0)
        : PC_TO_NAME[position.pc]
  );

  const label = voicing.positions
    .map((position) => `${STRINGS[position.stringIndex].name}:${position.fret}`)
    .join(" · ");
  const occurrenceRangeLabel =
    voicing.occurrenceRange && voicing.occurrenceRange.from !== voicing.occurrenceRange.to
      ? `${voicing.occurrenceRange.from}-${voicing.occurrenceRange.to}`
      : String(voicing.occurrenceRange?.from ?? voicing.lowestFret);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={selected ? "voicing-card voicing-card--selected" : "voicing-card"}
    >
      <div className="voicing-card__header">
        <div>
          <div className="voicing-card__eyebrow">Forma {index + 1}</div>
          <div className="voicing-card__notes">{notes.join(" • ")}</div>
        </div>
        <span className="class-badge">{voicing.span} tasti</span>
      </div>

      <div className="voicing-card__location">{label}</div>

      <div className="voicing-card__meta">
        <MetaChip
          label="Gruppo corde"
          value={voicing.strings.map((stringIndex) => STRINGS[stringIndex].name).join("-")}
        />
        <MetaChip
          label="Connessione"
          value={voicing.hasSkip ? "Con salto di corda" : "Corde adiacenti"}
        />
        <MetaChip
          label="Rivolto"
          value={`${getBassDegree(voicing, degreeMap)} in basso`}
        />
        <MetaChip
          label="Occorrenze"
          value={`${voicing.occurrenceCount || 1} posizioni`}
        />
        <MetaChip
          label="Area"
          value={`tasti ${occurrenceRangeLabel}`}
        />
        {showPrimeForm && (
          <MetaChip label="Prime form" value={`[${voicing.primeForm.join(",")}]`} />
        )}
        {showForte && <MetaChip label="Forte" value={voicing.forteName || "n.d."} />}
      </div>
    </button>
  );
}
