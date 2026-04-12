import React from "react";
import Fretboard from "./Fretboard";
import { PC_TO_NAME } from "./setData";
import { formatIntervalVector, getIntervalStyle } from "./genericSetPageHelpers";

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

export default function GenericSetFretboardPanel({
  browseMode,
  showComplement,
  analysisMode,
  noteName,
  activeSet,
  selectedVoicing,
  filteredVoicings,
  showAll,
  displayMode,
  intervalVectorFamilyClasses,
  selectedIntervalVector,
  selectedIntervalClasses,
  onToggleIntervalClass,
  onClearIntervalClassFilter,
  filteredPrimaryTargetPcs,
  selectedAnalysisClass,
  selectedAnalysisMember,
  filteredAnalysisTargetPcs,
  canRenderAnalysisVoicings,
  selectedAnalysisVoicing,
  analysisFilteredVoicings,
  analysisShowAllVoicings,
  analysisDegreeMap,
  analysisIntervalMap,
  analysisIntervalLegend,
  analysisIntervalClassBreakdown,
  complementData,
}) {
  const showIntervalLegend = browseMode === "iv" || displayMode === "intervals";

  return (
    <div className="set-panel">
      <div className="panel-header">
        <div className="panel-header__copy">
          <div className="eyebrow">Spazio sul manico</div>
          <h2>Manico</h2>
        </div>
        {!showComplement && activeSet && (
          <span className="class-badge">{activeSet.transformLabel}</span>
        )}
      </div>

      {!showComplement ? (
        analysisMode === "voicings" ? (
          <div className="panel-stack">
            <p className="helper-text">
              Le caselle attenuate appartengono al {noteName} trasformato. Le caselle
              evidenziate mostrano la forma selezionata, oppure tutte le forme se
              l&apos;opzione e attiva.
            </p>

            {activeSet && (
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
            )}

            {showIntervalLegend && activeSet && (
              <IntervalLegend
                title="Mappa intervallare"
                legend={activeSet.intervalLegend}
                breakdown={activeSet.intervalClassBreakdown}
                vector={activeSet.iv}
                selectedIntervalClasses={selectedIntervalClasses}
                onToggleIntervalClass={onToggleIntervalClass}
                onClearIntervalClassFilter={onClearIntervalClassFilter}
              />
            )}

            {selectedIntervalClasses.length > 0 && !showAll && (
              <div className="info-note info-note--accent">
                Le linee sul manico collegano le note della forma selezionata che
                producono gli intervalli `ic{selectedIntervalClasses.join(", ic")}`.
              </div>
            )}

            <Fretboard
              voicing={selectedVoicing}
              allTargetPcs={filteredPrimaryTargetPcs}
              allVoicings={filteredVoicings}
              showAll={showAll}
              displayMode={displayMode}
              degreeMap={activeSet?.degreeMap}
              intervalMap={activeSet?.intervalMap}
              selectedIntervalClasses={selectedIntervalClasses}
            />
          </div>
        ) : (
          <div className="panel-stack">
            <p className="helper-text">
              Seleziona una classe a destra. Il manico mostra l&apos;occorrenza concreta
              scelta e, quando possibile, i suoi voicing o rivolti.
            </p>

            {selectedAnalysisClass && (
              <div className="info-note">
                Classe selezionata: {selectedAnalysisClass.forteName || "n.d."} | PF
                [{selectedAnalysisClass.primeForm.join(",")}] | IV {formatIntervalVector(selectedAnalysisClass.iv)}
              </div>
            )}

            {selectedAnalysisMember && (
              <div className="info-note">
                Occorrenza concreta: [{selectedAnalysisMember.join(",")}]
              </div>
            )}

            {showIntervalLegend && selectedAnalysisClass && (
              <IntervalLegend
                title="Profilo intervallare dell'occorrenza"
                legend={analysisIntervalLegend}
                breakdown={analysisIntervalClassBreakdown}
                vector={selectedAnalysisClass.iv}
                selectedIntervalClasses={selectedIntervalClasses}
                onToggleIntervalClass={onToggleIntervalClass}
                onClearIntervalClassFilter={onClearIntervalClassFilter}
                notePrefix="Riferimento 0 dell'occorrenza"
              />
            )}

            {selectedAnalysisMember && !canRenderAnalysisVoicings && (
              <div className="info-note">
                Cardinalita {selectedAnalysisMember.length}: sul manico vengono mostrate
                le pitch classes dell&apos;occorrenza, non un voicing simultaneo.
              </div>
            )}

            <Fretboard
              voicing={canRenderAnalysisVoicings ? selectedAnalysisVoicing : null}
              allTargetPcs={filteredAnalysisTargetPcs}
              allVoicings={canRenderAnalysisVoicings ? analysisFilteredVoicings : []}
              showAll={canRenderAnalysisVoicings ? analysisShowAllVoicings : false}
              displayMode={displayMode}
              degreeMap={analysisDegreeMap}
              intervalMap={analysisIntervalMap}
              selectedIntervalClasses={selectedIntervalClasses}
            />
          </div>
        )
      ) : (
        <div className="panel-stack">
          <p className="helper-text">
            Le caselle evidenziate mostrano il complementare della trasformazione attiva
            del {noteName}.
          </p>

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
        </div>
      )}
    </div>
  );
}
