import React from "react";
import { PC_TO_NAME } from "./setData";
import { BassButtons } from "./SetControls";
import VoicingCard from "./VoicingCard";
import { getCardinalityLabel, getClassKey } from "./genericSetPageHelpers";

function ClassBadge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: "999px",
        background: "#e2e8f0",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#111",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function DetailChip({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "12px",
        background: "white",
        border: "1px solid #dbe3ee",
      }}
    >
      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#111" }}>
        {value}
      </div>
    </div>
  );
}

function ClassResultRow({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "12px",
        border: active ? "2px solid #111" : "1px solid #ddd",
        background: active ? "#e2e8f0" : "white",
        marginBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div>
        <div style={{ fontWeight: "bold", fontSize: "15px" }}>
          {item.forteName || "n.d."}
        </div>
        <div
          style={{
            marginTop: "4px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          PF [{item.primeForm.join(",")}] · {getCardinalityLabel(item.cardinality)}
        </div>
      </div>

      <ClassBadge>× {item.concreteCount}</ClassBadge>
    </button>
  );
}

export default function GenericSetResultsPanel({
  showComplement,
  analysisMode,
  filteredVoicings,
  noteName,
  selectedForte,
  activeSelectedVoicingIndex,
  onSelectVoicing,
  displayMode,
  activeSet,
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
  activeSelectedAnalysisVoicingIndex,
  onSelectAnalysisVoicing,
  analysisDegreeMap,
  complementName,
  complementData,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "18px",
        border: "1px solid #ddd",
      }}
    >
      {!showComplement ? (
        analysisMode === "voicings" ? (
          <>
            <h2>Possibilità trovate</h2>
            <p style={{ color: "#666" }}>
              {filteredVoicings.length} forme complessive per il {noteName}{" "}
              selezionato.
            </p>

            <div
              style={{
                maxHeight: "760px",
                overflowY: "auto",
                marginTop: "16px",
              }}
            >
              {filteredVoicings.map((v, i) => (
                <VoicingCard
                  key={`${selectedForte}-${i}-${v.positions
                    .map((p) => `${p.stringIndex}-${p.fret}`)
                    .join("-")}`}
                  voicing={v}
                  index={i}
                  selected={i === activeSelectedVoicingIndex}
                  onSelect={() => onSelectVoicing(i)}
                  displayMode={displayMode}
                  showPrimeForm={true}
                  showForte={true}
                  degreeMap={activeSet?.degreeMap}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>{analysisMode === "subsets" ? "Subset-class" : "Superset-class"}</h2>

            <p style={{ color: "#666" }}>
              {analysisClasses.length} classi trovate in{" "}
              {getCardinalityLabel(
                analysisMode === "subsets"
                  ? subsetTargetCardinality
                  : supersetTargetCardinality
              ).toLowerCase()}
              .
            </p>

            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
                marginTop: "16px",
              }}
            >
              {analysisClasses.map((item) => (
                <ClassResultRow
                  key={`${analysisMode}-${getClassKey(item)}`}
                  item={item}
                  active={
                    getClassKey(item) === getClassKey(selectedAnalysisClass || item)
                  }
                  onClick={() => onSelectAnalysisClass(getClassKey(item))}
                />
              ))}
            </div>

            {selectedAnalysisClass && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "12px" }}>
                  Dettaglio classe
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
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
                  <div style={{ marginTop: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <label style={{ fontWeight: "bold" }}>
                        Occorrenza concreta
                      </label>
                      <ClassBadge>
                        {activeSelectedAnalysisMemberIndex + 1} / {analysisMembers.length}
                      </ClassBadge>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() =>
                          onAnalysisMemberIndexChange(
                            Math.max(0, activeSelectedAnalysisMemberIndex - 1)
                          )
                        }
                        disabled={activeSelectedAnalysisMemberIndex === 0}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                          background:
                            activeSelectedAnalysisMemberIndex === 0
                              ? "#f8fafc"
                              : "white",
                          cursor:
                            activeSelectedAnalysisMemberIndex === 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        ←
                      </button>

                      <select
                        value={activeSelectedAnalysisMemberIndex}
                        onChange={(e) =>
                          onAnalysisMemberIndexChange(Number(e.target.value))
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #ccc",
                          fontSize: "15px",
                          background: "white",
                        }}
                      >
                        {analysisMembers.map((member, i) => (
                          <option
                            key={`${getClassKey(selectedAnalysisClass)}-${i}`}
                            value={i}
                          >
                            Occorrenza {i + 1} — [{member.join(",")}]
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() =>
                          onAnalysisMemberIndexChange(
                            Math.min(
                              analysisMembers.length - 1,
                              activeSelectedAnalysisMemberIndex + 1
                            )
                          )
                        }
                        disabled={
                          activeSelectedAnalysisMemberIndex ===
                          analysisMembers.length - 1
                        }
                        style={{
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #ccc",
                          background:
                            activeSelectedAnalysisMemberIndex ===
                            analysisMembers.length - 1
                              ? "#f8fafc"
                              : "white",
                          cursor:
                            activeSelectedAnalysisMemberIndex ===
                            analysisMembers.length - 1
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}

                {canRenderAnalysisVoicings ? (
                  <>
                    <div style={{ marginTop: "16px" }}>
                      <BassButtons
                        noteCount={selectedAnalysisMember.length}
                        value={analysisBassFilter}
                        onChange={onAnalysisBassFilterChange}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={analysisShowAllVoicings}
                          onChange={(e) =>
                            onAnalysisShowAllVoicingsChange(e.target.checked)
                          }
                        />
                        Mostra tutte le forme di questa occorrenza sul manico
                      </label>
                    </div>

                    <div style={{ marginTop: "14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>
                          Voicing / rivolti dell’occorrenza
                        </div>
                        <ClassBadge>{analysisFilteredVoicings.length}</ClassBadge>
                      </div>

                      <div
                        style={{
                          maxHeight: "260px",
                          overflowY: "auto",
                        }}
                      >
                        {analysisFilteredVoicings.map((v, i) => (
                          <VoicingCard
                            key={`${analysisMode}-${getClassKey(
                              selectedAnalysisClass
                            )}-${activeSelectedAnalysisMemberIndex}-${i}-${v.positions
                              .map((p) => `${p.stringIndex}-${p.fret}`)
                              .join("-")}`}
                            voicing={v}
                            index={i}
                            selected={i === activeSelectedAnalysisVoicingIndex}
                            onSelect={() => onSelectAnalysisVoicing(i)}
                            displayMode={displayMode}
                            showPrimeForm={true}
                            showForte={true}
                            degreeMap={analysisDegreeMap}
                          />
                        ))}

                        {analysisFilteredVoicings.length === 0 && (
                          <p style={{ color: "#666", marginTop: "8px" }}>
                            Nessun voicing disponibile con i filtri correnti.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ color: "#666", marginTop: "14px" }}>
                    Per questa occorrenza non vengono mostrati rivolti/voicing
                    simultanei. Sul manico vedi comunque l’insieme delle pitch
                    classes dell’occorrenza selezionata.
                  </p>
                )}
              </div>
            )}
          </>
        )
      ) : (
        <>
          <h2>Dettagli analitici</h2>

          {activeSet && complementData && (
            <div style={{ marginTop: "12px", lineHeight: 1.8 }}>
              <div>
                <strong>
                  {noteName.charAt(0).toUpperCase() + noteName.slice(1)} di
                  partenza:
                </strong>{" "}
                {activeSet.forteName}
              </div>
              <div>
                <strong>Trasformazione attiva:</strong> {activeSet.transformLabel}
              </div>
              <div>
                <strong>Prime form:</strong> ({activeSet.pf})
              </div>
              <div>
                <strong>Vettore intervallare:</strong> ⟨
                {activeSet.iv.split("").join(",")}⟩
              </div>

              <div
                style={{
                  marginTop: "18px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <strong>{complementName}:</strong> {complementData.forte}
                </div>
                <div>
                  <strong>Prime form:</strong> ({complementData.pf})
                </div>
                <div>
                  <strong>Vettore intervallare:</strong> ⟨
                  {complementData.iv.split("").join(",")}⟩
                </div>
                <div>
                  <strong>Pitch classes:</strong>{" "}
                  {complementData.pcs.map((pc) => PC_TO_NAME[pc]).join(" – ")}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
