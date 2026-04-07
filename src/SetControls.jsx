import React from "react";

export function PillButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: "999px",
        border: active ? "2px solid #111" : "1px solid #ccc",
        background: active ? "#e2e8f0" : "white",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{ fontWeight: "bold", marginBottom: "8px", marginTop: "4px" }}>
      {children}
    </div>
  );
}

export function BassButtons({ noteCount, value, onChange }) {
  return (
    <div>
      <SectionTitle>Rivolti / basso</SectionTitle>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <PillButton active={value === "all"} onClick={() => onChange("all")}>
          Tutti
        </PillButton>
        {Array.from({ length: noteCount }, (_, i) => (
          <PillButton
            key={i + 1}
            active={value === i + 1}
            onClick={() => onChange(i + 1)}
          >
            {i + 1} in basso
          </PillButton>
        ))}
      </div>
    </div>
  );
}

export function TransformButtons({ mode, setMode, amount, setAmount }) {
  return (
    <div>
      <SectionTitle>Inversioni / trasformazioni Tn-TnI</SectionTitle>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        <PillButton active={mode === "base"} onClick={() => setMode("base")}>
          Originale
        </PillButton>
        <PillButton active={mode === "tn"} onClick={() => setMode("tn")}>
          Tn
        </PillButton>
        <PillButton active={mode === "tni"} onClick={() => setMode("tni")}>
          TnI
        </PillButton>
      </div>

      {mode !== "base" && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <PillButton
              key={i}
              active={amount === i}
              onClick={() => setAmount(i)}
            >
              {i}
            </PillButton>
          ))}
        </div>
      )}
    </div>
  );
}