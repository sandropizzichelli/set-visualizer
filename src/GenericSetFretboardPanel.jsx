import React from "react";
import Fretboard from "./Fretboard";

export default function GenericSetFretboardPanel({
  showComplement,
  analysisMode,
  noteName,
  activeSet,
  selectedVoicing,
  filteredVoicings,
  showAll,
  displayMode,
  selectedAnalysisClass,
  selectedAnalysisMember,
  canRenderAnalysisVoicings,
  selectedAnalysisVoicing,
  analysisFilteredVoicings,
  analysisShowAllVoicings,
  analysisDegreeMap,
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
      <h2>Manico</h2>

      {!showComplement ? (
        analysisMode === "voicings" ? (
          <>
            <p style={{ color: "#666" }}>
              Le caselle grigie appartengono al {noteName} trasformato. Le
              caselle nere mostrano la forma selezionata, oppure tutte le forme
              se l’opzione è attiva.
            </p>

            {activeSet && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Trasformazione attiva: {activeSet.transformLabel}
              </div>
            )}

            {activeSet && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Prime form del {noteName}: [{activeSet.primeForm.join(",")}]
                {" | "}trasformata ordinata: [
                {activeSet.transformedPrimeForm.join(",")}]
              </div>
            )}

            {activeSet && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Nome Forte del {noteName}: {activeSet.forteName}
              </div>
            )}

            <Fretboard
              voicing={selectedVoicing}
              allTargetPcs={activeSet ? activeSet.pcs : []}
              allVoicings={filteredVoicings}
              showAll={showAll}
              displayMode={displayMode}
              degreeMap={activeSet?.degreeMap}
            />
          </>
        ) : (
          <>
            <p style={{ color: "#666" }}>
              Seleziona una classe a destra. Il manico mostrerà la singola
              occorrenza concreta selezionata e, quando possibile, i suoi
              voicing/rivolti.
            </p>

            {selectedAnalysisClass && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Classe selezionata: {selectedAnalysisClass.forteName || "n.d."}
                {" | "}PF [{selectedAnalysisClass.primeForm.join(",")}]
              </div>
            )}

            {selectedAnalysisMember && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Occorrenza concreta: [{selectedAnalysisMember.join(",")}]
              </div>
            )}

            {selectedAnalysisMember && !canRenderAnalysisVoicings && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Cardinalità {selectedAnalysisMember.length}: sul manico vengono
                mostrate le pitch classes dell’occorrenza, non un voicing
                simultaneo.
              </div>
            )}

            <Fretboard
              voicing={canRenderAnalysisVoicings ? selectedAnalysisVoicing : null}
              allTargetPcs={selectedAnalysisMember || []}
              allVoicings={
                canRenderAnalysisVoicings ? analysisFilteredVoicings : []
              }
              showAll={
                canRenderAnalysisVoicings ? analysisShowAllVoicings : false
              }
              displayMode={displayMode}
              degreeMap={analysisDegreeMap}
            />
          </>
        )
      ) : (
        <>
          <p style={{ color: "#666" }}>
            Le caselle nere mostrano il complementare della trasformazione
            attiva del {noteName}.
          </p>
          <Fretboard
            voicing={null}
            allTargetPcs={complementData ? complementData.pcs : []}
            allVoicings={[]}
            showAll={false}
            displayMode="notes"
            degreeMap={null}
            highlightAllAsActive={true}
          />
        </>
      )}
    </div>
  );
}
