import React from "react";
import Fretboard from "./Fretboard";
import { PC_TO_NAME } from "./setData";
import {
  buildOccurrenceSummary,
  formatIntervalVector,
  getIntervalStyle,
} from "./genericSetPageHelpers";

function ActiveIntervalLegend({ selectedIntervalClasses }) {
  if (!selectedIntervalClasses.length) return null;

  return (
    <div className="interval-connection-legend">
      {selectedIntervalClasses.map((intervalClass) => {
        const palette = getIntervalStyle(intervalClass);

        return (
          <div key={`active-ic-${intervalClass}`} className="interval-connection-legend__chip">
            <span
              className="interval-connection-legend__swatch"
              style={{
                background: `linear-gradient(135deg, ${palette.solid[0]} 0%, ${palette.solid[1]} 100%)`,
                boxShadow: `0 0 0 3px ${palette.soft[0]}`,
              }}
            />
            <strong>{`ic${intervalClass}`}</strong>
          </div>
        );
      })}
    </div>
  );
}

function IntervalLegend({
  title,
  legend,
  breakdown,
  vector,
  selectedIntervalClasses,
  onToggleIntervalClass,
  onClearIntervalClassFilter,
  notePrefix = "Riferimento 0",
}) {
  if (!legend?.length) return null;

  const hasActiveFilter = selectedIntervalClasses.length > 0;

  return (
    <div className="interval-legend-panel">
      <div className="picker-head">
        <div className="section-title">{title}</div>
        <div className="interval-legend-panel__actions">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onClearIntervalClassFilter}
              className="interval-filter-reset"
            >
              Mostra tutto
            </button>
          )}
          {vector && <span className="class-badge">{formatIntervalVector(vector)}</span>}
        </div>
      </div>

      <div className="interval-legend">
        {legend.map((item) => (
          <div key={`${item.pc}-${item.label}`} className="interval-legend__chip">
            <span>{item.label}</span>
            <strong>{PC_TO_NAME[item.pc]}</strong>
          </div>
        ))}
      </div>

      <div className="interval-breakdown interval-breakdown--compact">
        {breakdown.map((item) => (
          <button
            key={item.ic}
            type="button"
            onClick={() => onToggleIntervalClass(item.ic)}
            disabled={item.count === 0}
            className={
              selectedIntervalClasses.includes(item.ic)
                ? "interval-breakdown__chip interval-breakdown__chip--active"
                : "interval-breakdown__chip"
            }
          >
            <span>{`ic${item.ic}`}</span>
            <strong>{item.count}</strong>
          </button>
        ))}
      </div>

      <p className="helper-text helper-text--small">
        {notePrefix}: {PC_TO_NAME[legend[0].pc]}
      </p>
      <ActiveIntervalLegend selectedIntervalClasses={selectedIntervalClasses} />
      <p className="helper-text helper-text--small">
        Clicca un `ic` per isolare sul manico solo le note coinvolte in quella
        famiglia intervallare.
      </p>
    </div>
  );
}

function OccurrenceRelationLegend({ analysisMode, summary }) {
  if (!summary) return null;

  return (
    <div className="analysis-card analysis-card--compact">
      <div className="picker-head">
        <div className="section-title">Lettura sul manico</div>
        <span className="class-badge">{summary.typeLabel}</span>
      </div>

      <div className="occurrence-fretboard-legend">
        <div className="occurrence-fretboard-legend__chip">
          <span className="occurrence-fretboard-legend__swatch occurrence-fretboard-legend__swatch--core" />
          <div>
            <strong>Nucleo</strong>
            <span>
              {analysisMode === "subsets"
                ? "note presenti nell'occorrenza"
                : "note del set madre conservate"}
            </span>
          </div>
        </div>

        {analysisMode === "subsets" ? (
          <div className="occurrence-fretboard-legend__chip">
            <span className="occurrence-fretboard-legend__swatch occurrence-fretboard-legend__swatch--missing" />
            <div>
              <strong>Gradi mancanti</strong>
              <span>{summary.missingPcs.map((pc) => PC_TO_NAME[pc]).join(" · ") || "nessuno"}</span>
            </div>
          </div>
        ) : (
          <div className="occurrence-fretboard-legend__chip">
            <span className="occurrence-fretboard-legend__swatch occurrence-fretboard-legend__swatch--added" />
            <div>
              <strong>Note aggiunte</strong>
              <span>{summary.addedPcs.map((pc) => PC_TO_NAME[pc]).join(" · ") || "nessuna"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FretboardStage({ title, badge, children }) {
  return (
    <div className="analysis-card analysis-card--fretboard">
      <div className="picker-head">
        <div className="section-title">{title}</div>
        <span className="class-badge">{badge}</span>
      </div>
      {children}
    </div>
  );
}

export default function GenericSetFretboardPanel({
  browseMode,
  showComplement,
  hideFretboardVisual = false,
  analysisMode,
  fretboardViewMode,
  noteName,
  activeSet,
  selectedVoicing,
  filteredVoicings,
  primaryFormVoicing,
  primaryFormVoicings,
  primaryFormDegreeMap,
  primaryFormIntervalMap,
  primaryFormIntervalLegend,
  showAll,
  displayMode,
  intervalVectorFamilyClasses,
  selectedIntervalVector,
  selectedIntervalClasses,
  onToggleIntervalClass,
  onClearIntervalClassFilter,
  filteredPrimaryTargetPcs,
  filteredPrimaryFormTargetPcs,
  selectedAnalysisClass,
  selectedAnalysisMember,
  filteredAnalysisTargetPcs,
  filteredAnalysisPrimaryFormTargetPcs,
  canRenderAnalysisVoicings,
  selectedAnalysisVoicing,
  analysisFilteredVoicings,
  analysisPrimaryFormVoicing,
  analysisPrimaryFormVoicings,
  analysisPrimaryFormDegreeMap,
  analysisPrimaryFormIntervalMap,
  analysisPrimaryFormIntervalLegend,
  analysisShowAllVoicings,
  analysisDegreeMap,
  analysisIntervalMap,
  analysisIntervalLegend,
  analysisIntervalClassBreakdown,
  complementData,
}) {
  const showIntervalLegend = browseMode === "iv" || displayMode === "intervals";
  const showingPrimaryForm = fretboardViewMode === "prime";
  const canRenderAnalysisPrimaryForm =
    Boolean(selectedAnalysisClass?.primeForm?.length) &&
    Boolean(analysisPrimaryFormVoicing);
  const selectedOccurrenceSummary =
    !showingPrimaryForm && analysisMode !== "voicings"
      ? buildOccurrenceSummary(
          analysisMode,
          activeSet,
          selectedAnalysisClass,
          selectedAnalysisMember
        )
      : null;
  const analysisPcRoleMap = new Map();

  selectedOccurrenceSummary?.retainedPcs.forEach((pc) => {
    analysisPcRoleMap.set(pc, "core");
  });
  selectedOccurrenceSummary?.addedPcs.forEach((pc) => {
    analysisPcRoleMap.set(pc, "added");
  });
  selectedOccurrenceSummary?.missingPcs.forEach((pc) => {
    if (!analysisPcRoleMap.has(pc)) {
      analysisPcRoleMap.set(pc, "missing");
    }
  });

  return (
    <div className="set-panel set-panel--fretboard-panel">
      <div className="panel-header">
        <div className="panel-header__copy">
          <div className="eyebrow">
            {hideFretboardVisual ? "Lettura del set" : "Spazio sul manico"}
          </div>
          <h2>{hideFretboardVisual ? "Analisi" : "Manico"}</h2>
        </div>
        {!showComplement && activeSet && (
          <span className="class-badge">{activeSet.transformLabel}</span>
        )}
      </div>

      {!showComplement ? (
        analysisMode === "voicings" ? (
          <div className="panel-stack panel-stack--spacious">
            <p className="helper-text">
              {hideFretboardVisual
                ? showingPrimaryForm
                  ? "Il manico attivo ora e nel box alto. Qui sotto trovi i riferimenti teorici e intervallari della forma primaria."
                  : `Il manico attivo ora e nel box alto. Qui sotto trovi i riferimenti utili per leggere il ${noteName} corrente.`
                : showingPrimaryForm
                  ? "Il manico mostra la prime form come diteggiatura compatta reale: ogni nota viene collocata nella posizione piu vicina sul manico, anche cambiando corda quando questo rende la forma piu raccolta. Se attivi la spunta, vedi tutte le forme risultanti."
                  : `Le caselle attenuate appartengono al ${noteName} trasformato. Le caselle evidenziate mostrano la forma selezionata, oppure tutte le forme se l'opzione e attiva.`}
            </p>

            {activeSet && (
              <div className="analysis-card analysis-card--compact">
                <div className="panel-stack">
                  <div className="info-note">
                    Prime form del {noteName}: [{activeSet.primeForm.join(",")}] |
                    trasformata ordinata: [{activeSet.transformedPrimeForm.join(",")}]
                  </div>
                  <div className="info-note">
                    Nome Forte del {noteName}: {activeSet.forteName}
                    {browseMode === "iv" && (
                      <>
                        {" | "}
                        famiglia IV: {formatIntervalVector(selectedIntervalVector)} ({intervalVectorFamilyClasses.length} classi)
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showIntervalLegend && activeSet && (
              <IntervalLegend
                title={
                  showingPrimaryForm
                    ? "Mappa intervallare della forma primaria"
                    : "Mappa intervallare"
                }
                legend={showingPrimaryForm ? primaryFormIntervalLegend : activeSet.intervalLegend}
                breakdown={activeSet.intervalClassBreakdown}
                vector={activeSet.iv}
                selectedIntervalClasses={selectedIntervalClasses}
                onToggleIntervalClass={onToggleIntervalClass}
                onClearIntervalClassFilter={onClearIntervalClassFilter}
              />
            )}

            {selectedIntervalClasses.length > 0 && !showAll && (
              <div className="info-note info-note--accent">
                Le linee sul manico collegano le note della{" "}
                {showingPrimaryForm ? "forma primaria" : "forma selezionata"} che
                producono gli intervalli `ic{selectedIntervalClasses.join(", ic")}`.
              </div>
            )}

            {!hideFretboardVisual && (
              <FretboardStage
                title="Vista sul manico"
                badge={
                  showingPrimaryForm
                    ? "Forma primaria"
                    : showAll
                      ? "Tutte le forme"
                      : "Forma selezionata"
                }
              >
                <Fretboard
                  voicing={showingPrimaryForm ? primaryFormVoicing : selectedVoicing}
                  allTargetPcs={
                    showingPrimaryForm
                      ? filteredPrimaryFormTargetPcs
                      : filteredPrimaryTargetPcs
                  }
                  allVoicings={showingPrimaryForm ? primaryFormVoicings : filteredVoicings}
                  showAll={showAll}
                  displayMode={displayMode}
                  degreeMap={showingPrimaryForm ? primaryFormDegreeMap : activeSet?.degreeMap}
                  intervalMap={showingPrimaryForm ? primaryFormIntervalMap : activeSet?.intervalMap}
                  selectedIntervalClasses={selectedIntervalClasses}
                  showTargetMap={!showingPrimaryForm}
                  expandOccurrencesInShowAll={showingPrimaryForm}
                />
              </FretboardStage>
            )}
          </div>
        ) : (
          <div className="panel-stack panel-stack--spacious">
            <p className="helper-text">
              {hideFretboardVisual
                ? showingPrimaryForm
                  ? "Il manico attivo e nel box alto. Qui sotto trovi il profilo teorico della prime form selezionata."
                  : "Il manico attivo e nel box alto. Qui sotto trovi la lettura strutturale dell&apos;occorrenza concreta scelta."
                : showingPrimaryForm
                  ? "Seleziona una classe a destra. Il manico mostra la prime form come diteggiatura compatta reale, oppure tutte le sue forme se attivi la spunta."
                  : "Seleziona una classe a destra. Il manico mostra l&apos;occorrenza concreta scelta e, quando possibile, i suoi voicing o rivolti."}
            </p>

            {selectedAnalysisClass && (
              <div className="analysis-card analysis-card--compact">
                <div className="panel-stack">
                  <div className="info-note">
                    Classe selezionata: {selectedAnalysisClass.forteName || "n.d."} | PF
                    [{selectedAnalysisClass.primeForm.join(",")}] | IV {formatIntervalVector(selectedAnalysisClass.iv)}
                  </div>

                  {selectedAnalysisMember && (
                    <div className="info-note">
                      Occorrenza concreta: [{selectedAnalysisMember.join(",")}]
                    </div>
                  )}
                </div>
              </div>
            )}

            {showIntervalLegend && selectedAnalysisClass && (
              <IntervalLegend
                title={
                  showingPrimaryForm
                    ? "Profilo intervallare della forma primaria"
                    : "Profilo intervallare dell'occorrenza"
                }
                legend={
                  showingPrimaryForm
                    ? analysisPrimaryFormIntervalLegend
                    : analysisIntervalLegend
                }
                breakdown={analysisIntervalClassBreakdown}
                vector={selectedAnalysisClass.iv}
                selectedIntervalClasses={selectedIntervalClasses}
                onToggleIntervalClass={onToggleIntervalClass}
                onClearIntervalClassFilter={onClearIntervalClassFilter}
                notePrefix="Riferimento 0 dell'occorrenza"
              />
            )}

            <OccurrenceRelationLegend
              analysisMode={analysisMode}
              summary={selectedOccurrenceSummary}
            />

            {selectedAnalysisMember && !canRenderAnalysisVoicings && (
              <div className="info-note">
                Cardinalita {selectedAnalysisMember.length}: sul manico vengono mostrate
                le pitch classes dell&apos;occorrenza, non un voicing simultaneo.
              </div>
            )}

            {!hideFretboardVisual && (
              <FretboardStage
                title="Vista sul manico"
                badge={
                    showingPrimaryForm
                      ? analysisShowAllVoicings
                        ? "Prime form sovrapposte"
                        : "Prime form"
                    : analysisShowAllVoicings
                      ? "Posizioni sovrapposte"
                      : "Occorrenza selezionata"
                }
              >
                <Fretboard
                  voicing={
                    showingPrimaryForm
                      ? canRenderAnalysisPrimaryForm
                        ? analysisPrimaryFormVoicing
                        : null
                      : canRenderAnalysisVoicings
                        ? selectedAnalysisVoicing
                        : null
                  }
                  allTargetPcs={
                    showingPrimaryForm
                      ? filteredAnalysisPrimaryFormTargetPcs
                      : filteredAnalysisTargetPcs
                  }
                  allVoicings={
                    showingPrimaryForm
                      ? analysisPrimaryFormVoicings
                      : !canRenderAnalysisVoicings
                        ? []
                        : analysisFilteredVoicings
                  }
                  showAll={
                    showingPrimaryForm
                      ? analysisShowAllVoicings
                      : !canRenderAnalysisVoicings
                        ? false
                        : analysisShowAllVoicings
                  }
                  displayMode={displayMode}
                  degreeMap={
                    showingPrimaryForm
                      ? analysisPrimaryFormDegreeMap
                      : analysisDegreeMap
                  }
                  intervalMap={
                    showingPrimaryForm
                      ? analysisPrimaryFormIntervalMap
                      : analysisIntervalMap
                  }
                  selectedIntervalClasses={selectedIntervalClasses}
                  showTargetMap={!showingPrimaryForm}
                  extraTargetPcs={
                    showingPrimaryForm || !selectedOccurrenceSummary
                      ? []
                      : selectedOccurrenceSummary.missingPcs
                  }
                  pcRoleMap={showingPrimaryForm ? null : analysisPcRoleMap}
                  expandOccurrencesInShowAll={showingPrimaryForm}
                />
              </FretboardStage>
            )}
          </div>
        )
      ) : (
        <div className="panel-stack panel-stack--spacious">
          <p className="helper-text">
            {hideFretboardVisual
              ? `Il manico attivo nel box alto mostra il complementare della trasformazione attiva del ${noteName}.`
              : `Le caselle evidenziate mostrano il complementare della trasformazione attiva del ${noteName}.`}
          </p>

          {!hideFretboardVisual && (
            <FretboardStage title="Vista sul manico" badge="Complementare">
              <Fretboard
                voicing={null}
                allTargetPcs={complementData ? complementData.pcs : []}
                allVoicings={[]}
                showAll={false}
                displayMode="notes"
                degreeMap={null}
                intervalMap={null}
                highlightAllAsActive={true}
              />
            </FretboardStage>
          )}
        </div>
      )}
    </div>
  );
}
