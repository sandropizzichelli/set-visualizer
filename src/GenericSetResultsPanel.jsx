import React from "react";
import { PC_TO_NAME } from "./setData";
import { BassButtons } from "./SetControls";
import VoicingCard from "./VoicingCard";
import {
  buildOccurrenceSummary,
  formatDegreeList,
  formatIntervalVector,
  formatPitchClassList,
  getClassKey,
} from "./genericSetPageHelpers";

function ClassBadge({ children }) {
  return <span className="class-badge">{children}</span>;
}

function DetailChip({ label, value }) {
  return (
    <div className="detail-chip">
      <div className="detail-chip__label">{label}</div>
      <div className="detail-chip__value">{value}</div>
    </div>
  );
}

export default function GenericSetResultsPanel({
  showComplement,
  analysisMode,
  fretboardViewMode,
  noteName,
  displayMode,
  activeSet,
  selectedAnalysisClass,
  analysisMembers,
  canRenderAnalysisVoicings,
  selectedAnalysisMember,
  analysisBassFilter,
  analysisBassOptions,
  onAnalysisBassFilterChange,
  analysisShowAllVoicings,
  onAnalysisShowAllVoicingsChange,
  analysisShowAllMembers,
  analysisFilteredVoicings,
  analysisPrimaryFormVoicings,
  activeSelectedAnalysisVoicingIndex,
  onSelectAnalysisVoicing,
  analysisDegreeMap,
  analysisIntervalMap,
  complementName,
  complementData,
}) {
  const showingPrimaryForm = fretboardViewMode === "prime";
  const selectedOccurrenceSummary = buildOccurrenceSummary(
    analysisMode,
    activeSet,
    selectedAnalysisClass,
    selectedAnalysisMember
  );

  if (!showComplement && !analysisMode) {
    return null;
  }

  return (
    <div className="set-panel">
      {!showComplement ? (
        analysisMode ? (
          <>
            <div className="panel-header">
              <div className="panel-header__copy">
                <div className="eyebrow">Analisi comparata</div>
                <h2>Dettaglio classe</h2>
              </div>
              {selectedAnalysisClass && (
                <ClassBadge>{selectedAnalysisClass.forteName || "n.d."}</ClassBadge>
              )}
            </div>

            {selectedAnalysisClass && (
              <div className="analysis-card">
                <div className="panel-stack">
                  <div className="picker-head">
                    <div className="section-title">Dettaglio classe</div>
                    <ClassBadge>{selectedAnalysisClass.forteName || "n.d."}</ClassBadge>
                  </div>

                  <div className="detail-grid">
                    <DetailChip
                      label="Classe"
                      value={selectedAnalysisClass.forteName || "n.d."}
                    />
                    <DetailChip
                      label="Prime form"
                      value={`[${selectedAnalysisClass.primeForm.join(",")}]`}
                    />
                    <DetailChip
                      label="Istanze"
                      value={String(selectedAnalysisClass.concreteCount)}
                    />
                  </div>

                  {selectedAnalysisMember && selectedOccurrenceSummary && (
                    <div className="panel-stack">
                      <div className="picker-head">
                        <div className="section-title">Profilo dell'occorrenza</div>
                        <ClassBadge>{selectedOccurrenceSummary.typeLabel}</ClassBadge>
                      </div>

                      <div className="detail-grid">
                        <DetailChip
                          label="Relazione alla classe"
                          value={selectedOccurrenceSummary.classTransform}
                        />
                        {analysisMode === "subsets" ? (
                          <>
                            <DetailChip
                              label="Gradi presenti"
                              value={formatDegreeList(
                                selectedOccurrenceSummary.retainedDegrees
                              )}
                            />
                            <DetailChip
                              label="Gradi mancanti"
                              value={formatDegreeList(
                                selectedOccurrenceSummary.missingDegrees
                              )}
                            />
                          </>
                        ) : (
                          <>
                            <DetailChip
                              label="Nucleo originale"
                              value={formatDegreeList(
                                selectedOccurrenceSummary.retainedDegrees
                              )}
                            />
                            <DetailChip
                              label="Note aggiunte"
                              value={formatPitchClassList(
                                selectedOccurrenceSummary.addedPcs
                              )}
                            />
                          </>
                        )}
                      </div>

                      <p className="helper-text helper-text--small">
                        Occorrenza concreta: [{selectedAnalysisMember.join(",")}]
                      </p>
                    </div>
                  )}

                  {canRenderAnalysisVoicings || showingPrimaryForm ? (
                    <>
                      {!showingPrimaryForm && (
                        <>
                          {!analysisShowAllMembers && (
                            <div className="control-card__stack">
                              <BassButtons
                                options={analysisBassOptions}
                                value={analysisBassFilter}
                                onChange={onAnalysisBassFilterChange}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {!analysisShowAllMembers && (
                        <div className="toggle-stack">
                          <label className="toggle-row">
                            <input
                              type="checkbox"
                              checked={analysisShowAllVoicings}
                              onChange={(event) =>
                                onAnalysisShowAllVoicingsChange(event.target.checked)
                              }
                            />
                            Mostra tutte le forme di questa occorrenza sul manico
                          </label>
                        </div>
                      )}

                      {showingPrimaryForm ? (
                        <p className="helper-text helper-text--small">
                          {analysisPrimaryFormVoicings.length} posizioni utili della
                          forma primaria disponibili per questa classe.
                        </p>
                      ) : analysisShowAllMembers ? (
                        <p className="helper-text helper-text--small">
                          {analysisMembers.length} istanze concrete della classe sono
                          mostrate sul manico con un voicing rappresentativo per ciascuna.
                        </p>
                      ) : (
                        <div className="panel-stack">
                          <div className="picker-head">
                            <div className="section-title">Forme / rivolti</div>
                            <ClassBadge>{analysisFilteredVoicings.length}</ClassBadge>
                          </div>

                          <p className="helper-text helper-text--small">
                            {analysisFilteredVoicings.length} forme trovate per questa
                            occorrenza concreta.
                          </p>

                          <div className="results-scroll results-scroll--compact">
                            {analysisFilteredVoicings.map((voicing, index) => (
                              <VoicingCard
                                key={`${analysisMode}-${getClassKey(
                                  selectedAnalysisClass
                                )}-${selectedAnalysisMember?.join("-") || "member"}-${index}-${voicing.positions
                                  .map((position) => `${position.stringIndex}-${position.fret}`)
                                  .join("-")}`}
                                voicing={voicing}
                                index={index}
                                selected={index === activeSelectedAnalysisVoicingIndex}
                                onSelect={() => onSelectAnalysisVoicing(index)}
                                displayMode={displayMode}
                                showPrimeForm={true}
                                showForte={true}
                                degreeMap={analysisDegreeMap}
                                intervalMap={analysisIntervalMap}
                              />
                            ))}

                            {analysisFilteredVoicings.length === 0 && (
                              <p className="empty-note">
                                Nessun voicing disponibile con i filtri correnti.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="empty-note">
                      Per questa occorrenza non vengono mostrati voicing simultanei.
                      Sul manico vedi comunque l&apos;insieme delle pitch classes.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null
      ) : (
        <>
          <div className="panel-header">
            <div className="panel-header__copy">
              <div className="eyebrow">Analisi complementare</div>
              <h2>Dettagli analitici</h2>
            </div>
          </div>

          {activeSet && complementData && (
            <div className="data-list">
              <div>
                <strong>{noteName.charAt(0).toUpperCase() + noteName.slice(1)} di partenza:</strong>{" "}
                {activeSet.forteName}
              </div>
              <div>
                <strong>Trasformazione attiva:</strong> {activeSet.transformLabel}
              </div>
              <div>
                <strong>Prime form:</strong> ({activeSet.pf})
              </div>
              <div>
                <strong>Vettore intervallare:</strong> {formatIntervalVector(activeSet.iv)}
              </div>

              <div className="complement-card">
                <div>
                  <strong>{complementName}:</strong> {complementData.forte}
                </div>
                <div>
                  <strong>Prime form:</strong> ({complementData.pf})
                </div>
                <div>
                  <strong>Vettore intervallare:</strong> {formatIntervalVector(complementData.iv)}
                </div>
                <div>
                  <strong>Pitch classes:</strong>{" "}
                  {complementData.pcs.map((pc) => PC_TO_NAME[pc]).join(" - ")}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
