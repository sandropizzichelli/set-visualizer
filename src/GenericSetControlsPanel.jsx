import React from "react";
import {
  PillButton,
  SectionTitle,
  BassButtons,
  TransformButtons,
} from "./SetControls";
import { getCardinalityLabel } from "./genericSetPageHelpers";

export default function GenericSetControlsPanel({
  title,
  description,
  keyLabel,
  sortedKeys,
  dataMap,
  selectedForte,
  onSelectedForteChange,
  maxSpan,
  onMaxSpanChange,
  showComplement,
  noteName,
  onShowComplementChange,
  analysisMode,
  onAnalysisModeChange,
  subsetCardinalityOptions,
  subsetTargetCardinality,
  onSubsetTargetCardinalityChange,
  supersetCardinalityOptions,
  supersetTargetCardinality,
  onSupersetTargetCardinalityChange,
  groupFilter,
  availableGroupPatterns,
  onGroupFilterChange,
  displayMode,
  onDisplayModeChange,
  degreeButtonLabel,
  noteCount,
  bassFilter,
  onBassFilterChange,
  transformMode,
  transformAmount,
  onTransformModeChange,
  onTransformAmountChange,
  showAll,
  onShowAllChange,
  excludeOpenStrings,
  onExcludeOpenStringsChange,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "18px",
        marginBottom: "24px",
        border: "1px solid #ddd",
      }}
    >
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p>{description}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 0.8fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            {keyLabel}
          </label>
          <select
            value={selectedForte}
            onChange={(e) => onSelectedForteChange(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              fontSize: "16px",
              background: "white",
            }}
          >
            {sortedKeys.map((key) => (
              <option key={key} value={key}>
                {key} | PF ({dataMap[key].pf}) | IV {dataMap[key].iv}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Apertura massima: {maxSpan} tasti
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={maxSpan}
            onChange={(e) => onMaxSpanChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <PillButton
          active={!showComplement}
          onClick={() => onShowComplementChange(false)}
        >
          Mostra {noteName}
        </PillButton>
        <PillButton
          active={showComplement}
          onClick={() => onShowComplementChange(true)}
        >
          Mostra complementare
        </PillButton>
      </div>

      {!showComplement && (
        <>
          <div style={{ marginTop: "16px" }}>
            <SectionTitle>Analisi insiemistica</SectionTitle>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <PillButton
                active={analysisMode === "voicings"}
                onClick={() => onAnalysisModeChange("voicings")}
              >
                Voicing
              </PillButton>
              <PillButton
                active={analysisMode === "subsets"}
                onClick={() => onAnalysisModeChange("subsets")}
              >
                Subset-class
              </PillButton>
              <PillButton
                active={analysisMode === "supersets"}
                onClick={() => onAnalysisModeChange("supersets")}
              >
                Superset-class
              </PillButton>
            </div>
          </div>

          {analysisMode === "subsets" && subsetCardinalityOptions.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Tipo di subset
              </label>
              <select
                value={subsetTargetCardinality}
                onChange={(e) =>
                  onSubsetTargetCardinalityChange(Number(e.target.value))
                }
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  background: "white",
                }}
              >
                {subsetCardinalityOptions.map((n) => (
                  <option key={n} value={n}>
                    {getCardinalityLabel(n)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {analysisMode === "supersets" &&
            supersetCardinalityOptions.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Tipo di superset
                </label>
                <select
                  value={supersetTargetCardinality}
                  onChange={(e) =>
                    onSupersetTargetCardinalityChange(Number(e.target.value))
                  }
                  style={{
                    width: "100%",
                    maxWidth: "280px",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    background: "white",
                  }}
                >
                  {supersetCardinalityOptions.map((n) => (
                    <option key={n} value={n}>
                      {getCardinalityLabel(n)}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {analysisMode === "voicings" ? (
            <>
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  marginTop: "16px",
                }}
              >
                <div>
                  <SectionTitle>Gruppo corde</SectionTitle>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <PillButton
                      active={groupFilter === "all"}
                      onClick={() => onGroupFilterChange("all")}
                    >
                      Tutti
                    </PillButton>
                    {availableGroupPatterns.map((pattern) => (
                      <PillButton
                        key={pattern}
                        active={groupFilter === pattern}
                        onClick={() => onGroupFilterChange(pattern)}
                      >
                        {pattern}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionTitle>Vista</SectionTitle>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <PillButton
                      active={displayMode === "notes"}
                      onClick={() => onDisplayModeChange("notes")}
                    >
                      Note
                    </PillButton>
                    <PillButton
                      active={displayMode === "degrees"}
                      onClick={() => onDisplayModeChange("degrees")}
                    >
                      {degreeButtonLabel}
                    </PillButton>
                  </div>
                </div>

                <BassButtons
                  noteCount={noteCount}
                  value={bassFilter}
                  onChange={onBassFilterChange}
                />

                <TransformButtons
                  mode={transformMode}
                  setMode={onTransformModeChange}
                  amount={transformAmount}
                  setAmount={onTransformAmountChange}
                />
              </div>

              <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={(e) => onShowAllChange(e.target.checked)}
                  />
                  Mostra tutte le forme insieme sul manico
                </label>

                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={excludeOpenStrings}
                    onChange={(e) =>
                      onExcludeOpenStringsChange(e.target.checked)
                    }
                  />
                  Escludi corde vuote
                </label>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  marginTop: "16px",
                }}
              >
                <div>
                  <SectionTitle>Vista</SectionTitle>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <PillButton
                      active={displayMode === "notes"}
                      onClick={() => onDisplayModeChange("notes")}
                    >
                      Note
                    </PillButton>
                    <PillButton
                      active={displayMode === "degrees"}
                      onClick={() => onDisplayModeChange("degrees")}
                    >
                      {degreeButtonLabel}
                    </PillButton>
                  </div>
                </div>

                <TransformButtons
                  mode={transformMode}
                  setMode={onTransformModeChange}
                  amount={transformAmount}
                  setAmount={onTransformAmountChange}
                />
              </div>

              <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={excludeOpenStrings}
                    onChange={(e) =>
                      onExcludeOpenStringsChange(e.target.checked)
                    }
                  />
                  Escludi corde vuote
                </label>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
