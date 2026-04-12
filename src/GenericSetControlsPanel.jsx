import React from "react";
import {
  PillButton,
  SectionTitle,
  BassButtons,
  TransformButtons,
} from "./SetControls";
import { getCardinalityLabel } from "./genericSetPageHelpers";

function getAnalysisLabel(analysisMode) {
  if (analysisMode === "subsets") return "Subset-class";
  if (analysisMode === "supersets") return "Superset-class";
  return "Voicing";
}

function getCopyLinkLabel(copyLinkStatus) {
  if (copyLinkStatus === "copied") return "Link copiato";
  if (copyLinkStatus === "error") return "Riprova a copiare";
  return "Copia link condivisibile";
}

export default function GenericSetControlsPanel({
  title,
  description,
  keyLabel,
  copyLinkStatus,
  onCopyLink,
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
    <div className="set-panel set-panel--hero">
      <div className="set-hero">
        <div>
          <div className="eyebrow">Set-class explorer</div>
          <h1>{title}</h1>
          <p className="set-hero__description">{description}</p>
        </div>

        <div className="hero-side">
          <div className="hero-stats">
            <div className="hero-stat">
              <span>Cardinalità</span>
              <strong>{getCardinalityLabel(noteCount)}</strong>
            </div>
            <div className="hero-stat">
              <span>Vista attiva</span>
              <strong>{showComplement ? "Complementare" : noteName}</strong>
            </div>
            <div className="hero-stat">
              <span>Lettura</span>
              <strong>
                {showComplement ? "Profilo analitico" : getAnalysisLabel(analysisMode)}
              </strong>
            </div>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              onClick={onCopyLink}
              className={
                copyLinkStatus === "copied"
                  ? "secondary-button secondary-button--success"
                  : copyLinkStatus === "error"
                    ? "secondary-button secondary-button--error"
                    : "secondary-button"
              }
            >
              {getCopyLinkLabel(copyLinkStatus)}
            </button>
            <p className="hero-actions__hint">
              Il link mantiene pagina, set, trasformazioni e filtri correnti.
            </p>
          </div>
        </div>
      </div>

      <div className="control-grid">
        <div className="control-card control-card--wide">
          <label className="control-label">{keyLabel}</label>
          <select
            value={selectedForte}
            onChange={(event) => onSelectedForteChange(event.target.value)}
            className="control-select"
          >
            {sortedKeys.map((key) => (
              <option key={key} value={key}>
                {key} | PF ({dataMap[key].pf}) | IV {dataMap[key].iv}
              </option>
            ))}
          </select>
        </div>

        <div className="control-card">
          <div className="range-caption">
            <div>
              <div className="control-label">Apertura massima</div>
              <span>Regola la distanza massima tra i tasti del voicing.</span>
            </div>
            <div className="range-value">{maxSpan} tasti</div>
          </div>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={maxSpan}
            onChange={(event) => onMaxSpanChange(Number(event.target.value))}
            className="control-range"
          />
        </div>

        <div className="control-card">
          <div className="control-card__stack">
            <SectionTitle>Modalità di vista</SectionTitle>
            <div className="segmented-row">
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
          </div>
        </div>

        {!showComplement && (
          <>
            <div className="control-card control-card--wide">
              <div className="control-card__stack">
                <SectionTitle>Analisi insiemistica</SectionTitle>
                <div className="segmented-row">
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

                {analysisMode === "subsets" && subsetCardinalityOptions.length > 0 && (
                  <div>
                    <label className="control-label">Tipo di subset</label>
                    <select
                      value={subsetTargetCardinality}
                      onChange={(event) =>
                        onSubsetTargetCardinalityChange(Number(event.target.value))
                      }
                      className="control-select"
                    >
                      {subsetCardinalityOptions.map((cardinality) => (
                        <option key={cardinality} value={cardinality}>
                          {getCardinalityLabel(cardinality)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {analysisMode === "supersets" &&
                  supersetCardinalityOptions.length > 0 && (
                    <div>
                      <label className="control-label">Tipo di superset</label>
                      <select
                        value={supersetTargetCardinality}
                        onChange={(event) =>
                          onSupersetTargetCardinalityChange(Number(event.target.value))
                        }
                        className="control-select"
                      >
                        {supersetCardinalityOptions.map((cardinality) => (
                          <option key={cardinality} value={cardinality}>
                            {getCardinalityLabel(cardinality)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>
            </div>

            {analysisMode === "voicings" ? (
              <>
                <div className="control-card">
                  <div className="control-card__stack">
                    <SectionTitle>Gruppo corde</SectionTitle>
                    <div className="button-row">
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
                </div>

                <div className="control-card">
                  <div className="control-card__stack">
                    <SectionTitle>Vista</SectionTitle>
                    <div className="button-row">
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
                </div>

                <div className="control-card">
                  <BassButtons
                    noteCount={noteCount}
                    value={bassFilter}
                    onChange={onBassFilterChange}
                  />
                </div>

                <div className="control-card control-card--wide">
                  <TransformButtons
                    mode={transformMode}
                    setMode={onTransformModeChange}
                    amount={transformAmount}
                    setAmount={onTransformAmountChange}
                  />
                </div>

                <div className="control-card control-card--wide">
                  <div className="toggle-stack">
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={showAll}
                        onChange={(event) => onShowAllChange(event.target.checked)}
                      />
                      Mostra tutte le forme insieme sul manico
                    </label>

                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={excludeOpenStrings}
                        onChange={(event) =>
                          onExcludeOpenStringsChange(event.target.checked)
                        }
                      />
                      Escludi corde vuote
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="control-card">
                  <div className="control-card__stack">
                    <SectionTitle>Vista</SectionTitle>
                    <div className="button-row">
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
                </div>

                <div className="control-card control-card--wide">
                  <TransformButtons
                    mode={transformMode}
                    setMode={onTransformModeChange}
                    amount={transformAmount}
                    setAmount={onTransformAmountChange}
                  />
                </div>

                <div className="control-card control-card--wide">
                  <div className="toggle-stack">
                    <label className="toggle-row">
                      <input
                        type="checkbox"
                        checked={excludeOpenStrings}
                        onChange={(event) =>
                          onExcludeOpenStringsChange(event.target.checked)
                        }
                      />
                      Escludi corde vuote
                    </label>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
