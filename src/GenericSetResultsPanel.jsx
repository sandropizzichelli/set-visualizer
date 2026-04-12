import React from "react";
import { PC_TO_NAME } from "./setData";
import { BassButtons } from "./SetControls";
import VoicingCard from "./VoicingCard";
import {
  buildIntervalClassBreakdown,
  formatIntervalVector,
  getCardinalityLabel,
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

function ClassResultRow({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "class-result-row class-result-row--active" : "class-result-row"}
    >
      <div>
        <div className="class-result-row__title">{item.forteName || "n.d."}</div>
        <div className="class-result-row__meta">
          PF [{item.primeForm.join(",")}] · {getCardinalityLabel(item.cardinality)}
        </div>
      </div>

      <ClassBadge>x {item.concreteCount}</ClassBadge>
    </button>
  );
}

function FamilyClassCard({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "family-class-card family-class-card--active" : "family-class-card"}
    >
      <div className="family-class-card__top">
        <div className="family-class-card__title">{item.forteName || "n.d."}</div>
        <span className="class-badge">{formatIntervalVector(item.iv)}</span>
      </div>
      <div className="family-class-card__meta">PF [{item.primeForm.join(",")}]</div>
    </button>
  );
}

function IntervalBreakdown({ intervalVector }) {
  const breakdown = buildIntervalClassBreakdown(intervalVector);

  return (
    <div className="interval-breakdown">
      {breakdown.map((item) => (
        <div key={item.ic} className="interval-breakdown__chip">
          <span>{`ic${item.ic}`}</span>
          <strong>{item.count}</strong>
        </div>
      ))}
    </div>
  );
}

export default function GenericSetResultsPanel({
  browseMode,
  showComplement,
  analysisMode,
  filteredVoicings,
  filteredVoicingOccurrenceCount,
  noteName,
  selectedForte,
  activeSelectedVoicingIndex,
  onSelectVoicing,
  displayMode,
  activeSet,
  intervalVectorFamilyClasses,
  selectedIntervalVector,
  onSelectFamilyClass,
  analysisClasses,
  subsetTargetCardinality,
  supersetTargetCardinality,
  selectedAnalysisClass,
  onSelectAnalysisClass,
  analysisMembers,
  activeSelectedAnalysisMemberIndex,
  onAnalysisMemberIndexChange,
  canRenderAnalysisVoicings,
  selectedAnalysisMember,
  analysisBassFilter,
  onAnalysisBassFilterChange,
  analysisShowAllVoicings,
  onAnalysisShowAllVoicingsChange,
  analysisFilteredVoicings,
  analysisVoicingOccurrenceCount,
  activeSelectedAnalysisVoicingIndex,
  onSelectAnalysisVoicing,
  analysisDegreeMap,
  analysisIntervalMap,
  complementName,
  complementData,
}) {
  const analysisLabel = analysisMode === "subsets" ? "Subset-class" : "Superset-class";
  const analysisTargetLabel = getCardinalityLabel(
    analysisMode === "subsets" ? subsetTargetCardinality : supersetTargetCardinality
  ).toLowerCase();

  return (
    <div className="set-panel">
      {!showComplement ? (
        analysisMode === "voicings" ? (
          <>
            <div className="panel-header">
              <div className="panel-header__copy">
                <div className="eyebrow">Catalogo delle forme</div>
                <h2>Forme uniche</h2>
              </div>
              <ClassBadge>{filteredVoicings.length}</ClassBadge>
            </div>

            <p className="helper-text">
              {filteredVoicings.length} forme uniche e {filteredVoicingOccurrenceCount}{" "}
              occorrenze complessive per il {noteName} selezionato.
            </p>
            <p className="helper-text helper-text--small">
              Le posizioni duplicate sul manico vengono raggruppate nella stessa forma.
            </p>

            {browseMode === "iv" && activeSet && (
              <div className="analysis-card">
                <div className="panel-stack">
                  <div className="picker-head">
                    <div className="section-title">Famiglia interval vector</div>
                    <ClassBadge>{intervalVectorFamilyClasses.length}</ClassBadge>
                  </div>

                  <div className="detail-grid">
                    <DetailChip
                      label="IV condiviso"
                      value={formatIntervalVector(selectedIntervalVector)}
                    />
                    <DetailChip label="Classe attiva" value={activeSet.forteName || "n.d."} />
                    <DetailChip label="Prime form" value={`[${activeSet.primeForm.join(",")}]`} />
                  </div>

                  <IntervalBreakdown intervalVector={selectedIntervalVector} />

                  <div className="family-class-grid">
                    {intervalVectorFamilyClasses.map((item) => (
                      <FamilyClassCard
                        key={`family-${item.forteName}`}
                        item={item}
                        active={item.forteName === activeSet.forteName}
                        onClick={() => onSelectFamilyClass(item.forteName)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="results-scroll">
              {filteredVoicings.map((voicing, index) => (
                <VoicingCard
                  key={`${selectedForte}-${index}-${voicing.positions
                    .map((position) => `${position.stringIndex}-${position.fret}`)
                    .join("-")}`}
                  voicing={voicing}
                  index={index}
                  selected={index === activeSelectedVoicingIndex}
                  onSelect={() => onSelectVoicing(index)}
                  displayMode={displayMode}
                  showPrimeForm={true}
                  showForte={true}
                  degreeMap={activeSet?.degreeMap}
                  intervalMap={activeSet?.intervalMap}
                />
              ))}

              {filteredVoicings.length === 0 && (
                <p className="empty-note">Nessuna forma disponibile con i filtri correnti.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="panel-header">
              <div className="panel-header__copy">
                <div className="eyebrow">Analisi comparata</div>
                <h2>{analysisLabel}</h2>
              </div>
              <ClassBadge>{analysisClasses.length}</ClassBadge>
            </div>

            <p className="helper-text">
              {analysisClasses.length} classi trovate in {analysisTargetLabel}.
            </p>

            <div className="results-scroll results-scroll--short">
              {analysisClasses.map((item) => (
                <ClassResultRow
                  key={`${analysisMode}-${getClassKey(item)}`}
                  item={item}
                  active={getClassKey(item) === getClassKey(selectedAnalysisClass || item)}
                  onClick={() => onSelectAnalysisClass(getClassKey(item))}
                />
              ))}

              {analysisClasses.length === 0 && (
                <p className="empty-note">Nessuna classe trovata per i filtri attivi.</p>
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
                      label="Occorrenze"
                      value={String(selectedAnalysisClass.concreteCount)}
                    />
                  </div>

                  {analysisMembers.length > 0 && (
                    <div className="panel-stack">
                      <div className="picker-head">
                        <label className="section-title">Occorrenza concreta</label>
                        <ClassBadge>
                          {activeSelectedAnalysisMemberIndex + 1} / {analysisMembers.length}
                        </ClassBadge>
                      </div>

                      <div className="picker-row">
                        <button
                          type="button"
                          onClick={() =>
                            onAnalysisMemberIndexChange(
                              Math.max(0, activeSelectedAnalysisMemberIndex - 1)
                            )
                          }
                          disabled={activeSelectedAnalysisMemberIndex === 0}
                          className="nav-button"
                        >
                          ←
                        </button>

                        <select
                          value={activeSelectedAnalysisMemberIndex}
                          onChange={(event) =>
                            onAnalysisMemberIndexChange(Number(event.target.value))
                          }
                          className="control-select"
                        >
                          {analysisMembers.map((member, index) => (
                            <option
                              key={`${getClassKey(selectedAnalysisClass)}-${index}`}
                              value={index}
                            >
                              Occorrenza {index + 1} - [{member.join(",")}]
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            onAnalysisMemberIndexChange(
                              Math.min(
                                analysisMembers.length - 1,
                                activeSelectedAnalysisMemberIndex + 1
                              )
                            )
                          }
                          disabled={
                            activeSelectedAnalysisMemberIndex === analysisMembers.length - 1
                          }
                          className="nav-button"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  )}

                  {canRenderAnalysisVoicings ? (
                    <>
                      <div className="control-card__stack">
                        <BassButtons
                          noteCount={selectedAnalysisMember.length}
                          value={analysisBassFilter}
                          onChange={onAnalysisBassFilterChange}
                        />
                      </div>

                      <div className="toggle-stack">
                        <label className="toggle-row">
                          <input
                            type="checkbox"
                            checked={analysisShowAllVoicings}
                            onChange={(event) =>
                              onAnalysisShowAllVoicingsChange(event.target.checked)
                            }
                          />
                          Mostra tutte le forme uniche di questa occorrenza sul manico
                        </label>
                      </div>

                      <div className="panel-stack">
                        <div className="picker-head">
                          <div className="section-title">Forme / rivolti</div>
                          <ClassBadge>{analysisFilteredVoicings.length}</ClassBadge>
                        </div>

                        <p className="helper-text helper-text--small">
                          {analysisFilteredVoicings.length} forme uniche e{" "}
                          {analysisVoicingOccurrenceCount} occorrenze per questa
                          occorrenza concreta.
                        </p>
                        <p className="helper-text helper-text--small">
                          Anche qui le posizioni strutturalmente identiche vengono raggruppate.
                        </p>

                        <div className="results-scroll results-scroll--compact">
                          {analysisFilteredVoicings.map((voicing, index) => (
                            <VoicingCard
                              key={`${analysisMode}-${getClassKey(
                                selectedAnalysisClass
                              )}-${activeSelectedAnalysisMemberIndex}-${index}-${voicing.positions
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
        )
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
