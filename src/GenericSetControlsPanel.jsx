import React from "react";
import Fretboard from "./Fretboard";
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

function ControlSection({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`control-section ${className}`.trim()}>
      <div className="control-section__header">
        <div className="eyebrow">{eyebrow}</div>
        <h3 className="control-section__title">{title}</h3>
      </div>
      <div className="control-section__grid">{children}</div>
    </section>
  );
}

export default function GenericSetControlsPanel({
  keyLabel,
  browseMode,
  heroFretboardState,
  heroSummaryState,
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
  availableVoicingLayoutFilters,
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
  const selectionSection = (
    <ControlSection
      eyebrow="Selezione del set"
      title="Classe e accesso"
      className="control-section--top"
    >
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
              onChange={(event) => onSelectedIntervalVectorChange(event.target.value)}
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
                {formatIntervalVector(selectedIntervalVector)} in questa cardinalita.
              </p>
            </div>
          </div>
        </>
      )}
    </ControlSection>
  );

  return (
    <div className="set-panel set-panel--hero">
      {selectionSection}

      <div className="set-hero">
        <div className="set-hero__main">
          <div className="eyebrow">Set-class explorer</div>
          <div className="hero-fretboard-card">
            <div className="hero-fretboard-card__head">
              <div className="section-title">Manico attivo</div>
              {heroFretboardState?.badge && (
                <span className="class-badge">{heroFretboardState.badge}</span>
              )}
            </div>

            {heroFretboardState?.props ? (
              <Fretboard {...heroFretboardState.props} />
            ) : (
              <p className="helper-text">
                Seleziona una classe o un&apos;occorrenza per visualizzare il manico qui in alto.
              </p>
            )}
          </div>
        </div>

        <aside className="hero-summary-card">
          <div className="hero-summary-card__head">
            <div>
              <div className="eyebrow">Sintesi attiva</div>
              <div className="section-title">{heroSummaryState?.title || "Sintesi attiva"}</div>
            </div>
            {heroSummaryState?.badge && (
              <span className="class-badge">{heroSummaryState.badge}</span>
            )}
          </div>

          {heroSummaryState?.items?.length ? (
            <div className="hero-summary-grid">
              {heroSummaryState.items.map((item) => (
                <div key={`${item.label}-${item.value}`} className="hero-summary-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="helper-text helper-text--small">
              Seleziona una classe per vedere qui la sintesi essenziale del set attivo.
            </p>
          )}

          {heroSummaryState?.note && (
            <p className="hero-summary-note">{heroSummaryState.note}</p>
          )}
        </aside>
      </div>

      <div className="control-grid">
        {!showComplement && (
          <ControlSection
            eyebrow="Visualizzazione chitarristica"
            title="Diteggiature e filtri sul manico"
            className="control-section--collapsible"
          >
            <details className="control-section-disclosure" open>
              <summary className="control-section-disclosure__summary">
                <span>Apri / chiudi controlli del manico</span>
              </summary>

              <div className="control-section__grid control-section__grid--nested">
                <div className="control-card">
                  <div className="control-card__stack">
                    <SectionTitle>Allargamento tasti</SectionTitle>
                    <div className="range-caption">
                      <span>Distanza massima tra il primo e l&apos;ultimo tasto del voicing</span>
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
                    <SectionTitle>Manico</SectionTitle>
                    <div className="segmented-row">
                      <PillButton
                        active={fretboardViewMode === "prime"}
                        onClick={() => onFretboardViewModeChange("prime")}
                      >
                        Forma primaria
                      </PillButton>
                      <PillButton
                        active={fretboardViewMode === "voicing"}
                        onClick={() => onFretboardViewModeChange("voicing")}
                      >
                        Voicing
                      </PillButton>
                    </div>
                  </div>
                </div>

                {!analysisMode ? (
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
                          {availableVoicingLayoutFilters.includes("spread") && (
                            <PillButton
                              active={voicingLayoutFilter === "spread"}
                              onClick={() => onVoicingLayoutFilterChange("spread")}
                            >
                              Spread voicing
                            </PillButton>
                          )}
                        </div>
                        <p className="helper-text helper-text--small">
                          {availableVoicingLayoutFilters.includes("spread")
                            ? "Close: corde adiacenti. Spread: almeno un salto di corda."
                            : "Negli esacordi il filtro si concentra sulle forme piu utili: tutte oppure close voicing."}
                        </p>
                        <div className="inline-stats">
                          <span className="inline-stat">Close {closeVoicingCount}</span>
                          {availableVoicingLayoutFilters.includes("spread") && (
                            <span className="inline-stat">Spread {spreadVoicingCount}</span>
                          )}
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
                            In `Forma primaria` la spunta sovrappone tutte le posizioni utili
                            della prime form sul manico.
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
                  </>
                ) : (
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
                )}
              </div>
            </details>
          </ControlSection>
        )}

        <ControlSection
          eyebrow="Lettura del set"
          title="Come leggere il manico"
          className="control-section--collapsible"
        >
          <details className="control-section-disclosure" open>
            <summary className="control-section-disclosure__summary">
              <span>Apri / chiudi lettura del set</span>
            </summary>

            <div className="control-section__grid control-section__grid--nested">
              <div className="control-card">
                <div className="control-card__stack">
                  <SectionTitle>Modalita di vista</SectionTitle>
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
              )}
            </div>
          </details>
        </ControlSection>

        {!showComplement && (
          <ControlSection
            eyebrow="Analisi insiemistica"
            title="Relazioni tra classi e trasformazioni"
            className="control-section--collapsible"
          >
            <details className="control-section-disclosure" open>
              <summary className="control-section-disclosure__summary">
                <span>Apri / chiudi analisi insiemistica</span>
              </summary>

              <div className="control-section__grid control-section__grid--nested">
                <div className="control-card control-card--wide">
                  <div className="control-card__stack">
                    <SectionTitle>Subset e superset</SectionTitle>
                    <div className="segmented-row">
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

                    <p className="helper-text helper-text--small">
                      Clicca di nuovo sul filtro attivo per tornare al catalogo delle forme.
                    </p>

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

                <div className="control-card control-card--wide">
                  <TransformButtons
                    mode={transformMode}
                    setMode={onTransformModeChange}
                    amount={transformAmount}
                    setAmount={onTransformAmountChange}
                  />
                </div>
              </div>
            </details>
          </ControlSection>
        )}
      </div>
    </div>
  );
}
