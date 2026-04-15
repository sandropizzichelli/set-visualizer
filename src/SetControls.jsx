import React from "react";

export function PillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "pill-button pill-button--active" : "pill-button"}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children }) {
  return <div className="section-title">{children}</div>;
}

export function BassButtons({ options = [], value, onChange }) {
  return (
    <div className="control-card__stack">
      <SectionTitle>Rivolti / basso</SectionTitle>
      <div className="button-row">
        <PillButton active={value === "all"} onClick={() => onChange("all")}>
          Tutti
        </PillButton>
        {options.map((option) => (
          <PillButton
            key={option}
            active={value === option}
            onClick={() => onChange(option)}
          >
            {option} in basso
          </PillButton>
        ))}
      </div>
    </div>
  );
}

export function TransformButtons({ mode, setMode, amount, setAmount }) {
  return (
    <div className="control-card__stack">
      <SectionTitle>Inversioni / trasformazioni Tn-TnI</SectionTitle>
      <div className="button-row">
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
        <div className="button-row">
          {Array.from({ length: 12 }, (_, i) => (
            <PillButton key={i} active={amount === i} onClick={() => setAmount(i)}>
              {i}
            </PillButton>
          ))}
        </div>
      )}
    </div>
  );
}
