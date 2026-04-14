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
  maxSpan,
  onMaxSpanChange,
  fretboardViewMode,
  onFretboardViewModeChange,
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
  voicingLayoutFilter,
  onVoicingLayoutFilterChange,
  availableGroupPatterns,
  closeVoicingCount,
  spreadVoicingCount,
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
            <SectionTitle>Allargamento tasti</SectionTitle>
            <div className="range-caption">
              <span>Distanza massima tra il primo e l'ultimo tasto del voicing</span>
              <strong className="range-value">{maxSpan} tasti</strong>
            </div>
            <input
              type="range"
              min="2"
              max="5"
              step="1"
              value={maxSpan}
              onChange={(event) => onMaxSpanChange(Number(event.target.value))}
              className="control-range"
            />
          </div>
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
            <div className="control-card">
              <div className="control-card__stack">
                <SectionTitle>Manico</SectionTitle>
                <div className="segmented-row">
                  <PillButton
                    active={fretboardViewMode === "voicing"}
                    onClick={() => onFretboardViewModeChange("voicing")}
                  >
                    Voicing
                  </PillButton>
                  <PillButton
                    active={fretboardViewMode === "prime"}
                    onClick={() => onFretboardViewModeChange("prime")}
                  >
                    Forma primaria
                  </PillButton>
                </div>
              </div>
            </div>

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
                    <SectionTitle>Tipo di voicing</SectionTitle>
                    <div className="button-row">
                      <PillButton
                        active={voicingLayoutFilter === "all"}
                        onClick={() => onVoicingLayoutFilterChange("all")}
                      >
                        Tutti
                      </PillButton>
                      <PillButton
                        active={voicingLayoutFilter === "close"}
                        onClick={() => onVoicingLayoutFilterChange("close")}
                      >
                        Close voicing
                      </PillButton>
                      <PillButton
                        active={voicingLayoutFilter === "spread"}
                        onClick={() => onVoicingLayoutFilterChange("spread")}
                      >
                        Spread voicing
                      </PillButton>
                    </div>
                    <p className="helper-text helper-text--small">
                      Close: corde adiacenti. Spread: almeno un salto di corda. Ora hai
                      un filtro musicale piu compatto, senza perdere il dettaglio tecnico.
                    </p>
                    <div className="inline-stats">
                      <span className="inline-stat">Close {closeVoicingCount}</span>
                      <span className="inline-stat">Spread {spreadVoicingCount}</span>
                    </div>
                  </div>
                </div>

                <div className="control-card control-card--wide">
                  <div className="control-card__stack">
                    <SectionTitle>Approfondisci per gruppo corde</SectionTitle>
                    <details className="disclosure-card">
                      <summary className="disclosure-card__summary">
                        Gruppo corde: {groupFilter === "all" ? "tutti" : groupFilter}
                      </summary>
                      <div className="disclosure-card__body">
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
                        <p className="helper-text helper-text--small">
                          Questo filtro resta disponibile per studiare un gruppo corde
                          specifico dentro i close o spread voicing.
                        </p>
                      </div>
                    </details>
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
                      Mostra tutte le forme sul manico
                    </label>

                    {fretboardViewMode === "prime" && (
                      <p className="helper-text">
                        In `Forma primaria` la spunta sovrappone tutte le posizioni
                        utili della prime form sul manico.
                      </p>
                    )}

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
