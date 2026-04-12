import React from "react";
import {
  PillButton,
  SectionTitle,
  BassButtons,
  TransformButtons,
} from "./SetControls";
import {
  formatIntervalVector,
  getCardinalityLabel,
} from "./genericSetPageHelpers";

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
  browseMode,
  copyLinkStatus,
  onCopyLink,
  onBrowseModeChange,
  sortedKeys,
  dataMap,
  selectedForte,
  onSelectedForteChange,
  selectedIntervalVector,
  onSelectedIntervalVectorChange,
  intervalVectorOptions,
  intervalVectorMatches,
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
              <span>Accesso</span>
              <strong>{browseMode === "forte" ? "Set-class" : "Interval vector"}</strong>
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
              Il link mantiene pagina, modalità, classe, trasformazioni e filtri correnti.
            </p>
          </div>
        </div>
      </div>

      <div className="control-grid">
        <div className="control-card control-card--wide">
          <div className="control-card__stack">
            <SectionTitle>Chiave di accesso</SectionTitle>
            <div className="segmented-row">
              <PillButton
                active={browseMode === "forte"}
                onClick={() => onBrowseModeChange("forte")}
              >
                Per set-class
              </PillButton>
              <PillButton
                active={browseMode === "iv"}
                onClick={() => onBrowseModeChange("iv")}
              >
                Per interval vector
              </PillButton>
            </div>
          </div>
        </div>

        {browseMode === "forte" ? (
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
        ) : (
          <>
            <div className="control-card control-card--wide">
              <label className="control-label">Interval vector</label>
              <select
                value={selectedIntervalVector}
                onChange={(event) =>
                  onSelectedIntervalVectorChange(event.target.value)
                }
                className="control-select"
              >
                {intervalVectorOptions.map((intervalVector) => (
                  <option key={intervalVector} value={intervalVector}>
                    {formatIntervalVector(intervalVector)}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-card control-card--wide">
              <div className="control-card__stack">
                <div>
                  <label className="control-label">Classe compatibile</label>
                  <select
                    value={selectedForte}
                    onChange={(event) => onSelectedForteChange(event.target.value)}
                    className="control-select"
                  >
                    {intervalVectorMatches.map((key) => (
                      <option key={key} value={key}>
                        {key} | PF ({dataMap[key].pf})
                      </option>
                    ))}
                  </select>
                </div>

                <p className="helper-text">
                  {intervalVectorMatches.length} classi condividono{" "}
                  {formatIntervalVector(selectedIntervalVector)} in questa cardinalità.
                </p>
              </div>
            </div>
          </>
        )}

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
                      <PillButton
                        active={displayMode === "intervals"}
                        onClick={() => onDisplayModeChange("intervals")}
                      >
                        Intervalli
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
                      Mostra tutte le forme uniche insieme sul manico
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
                      <PillButton
                        active={displayMode === "intervals"}
                        onClick={() => onDisplayModeChange("intervals")}
                      >
                        Intervalli
                      </PillButton>
                    </div>
                    {browseMode === "iv" && (
                      <p className="helper-text">
                        In modalita intervallare il manico colora e nomina ogni pitch class
                        secondo la sua distanza dal riferimento 0 della classe attiva.
                      </p>
                    )}
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
