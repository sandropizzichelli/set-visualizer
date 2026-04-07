import React from "react";
import { STRINGS, PC_TO_NAME } from "./setData";
import { getBassDegree } from "./setUtils";
export default function VoicingCard({
  voicing,
  index,
  selected,
  onSelect,
  displayMode,
  showPrimeForm,
  showForte,
  degreeMap,
}) {
  const notes = voicing.positions.map((p) =>
    displayMode === "degrees"
      ? String(degreeMap?.get(p.pc) ?? "")
      : PC_TO_NAME[p.pc]
  );
  const label = voicing.positions
    .map((p) => `${STRINGS[p.stringIndex].name}:${p.fret}`)
    .join(" · ");

  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px",
        borderRadius: "12px",
        border: selected ? "2px solid black" : "1px solid #ddd",
        background: selected ? "#f3f4f6" : "white",
        marginBottom: "10px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: "bold" }}>Forma {index + 1}</div>
      <div style={{ marginTop: "4px" }}>{notes.join(" – ")}</div>
      <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
        {label}
      </div>
      <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
        Gruppo corde: {voicing.strings.map((s) => STRINGS[s].name).join("-")}
      </div>
      <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
        Apertura: {voicing.span} tasti
      </div>
      <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
        {voicing.hasSkip ? "Con salto di corda" : "Corde adiacenti"}
      </div>
      <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
        Rivolto: {getBassDegree(voicing, degreeMap)} in basso
      </div>
      {showPrimeForm && (
        <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
          Prime form: [{voicing.primeForm.join(",")}]
        </div>
      )}
      {showForte && (
        <div style={{ marginTop: "4px", fontSize: "12px", color: "#666" }}>
          Forte: {voicing.forteName || "n.d."}
        </div>
      )}
    </button>
  );
}