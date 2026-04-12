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
              Le caselle ambrate appartengono al {noteName} trasformato. Le caselle
              evidenziate mostrano la forma selezionata, oppure tutte le forme se
              l&apos;opzione è attiva.
            </p>

            {activeSet && (
              <div className="panel-stack">
                <div className="info-note">
                  Prime form del {noteName}: [{activeSet.primeForm.join(",")}] |
                  trasformata ordinata: [{activeSet.transformedPrimeForm.join(",")}]
                </div>
                <div className="info-note">
                  Nome Forte del {noteName}: {activeSet.forteName}
                </div>
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
                [{selectedAnalysisClass.primeForm.join(",")}]
              </div>
            )}

            {selectedAnalysisMember && (
              <div className="info-note">
                Occorrenza concreta: [{selectedAnalysisMember.join(",")}]
              </div>
            )}

            {selectedAnalysisMember && !canRenderAnalysisVoicings && (
              <div className="info-note">
                Cardinalità {selectedAnalysisMember.length}: sul manico vengono mostrate
                le pitch classes dell&apos;occorrenza, non un voicing simultaneo.
              </div>
            )}

            <Fretboard
              voicing={canRenderAnalysisVoicings ? selectedAnalysisVoicing : null}
              allTargetPcs={selectedAnalysisMember || []}
              allVoicings={canRenderAnalysisVoicings ? analysisFilteredVoicings : []}
              showAll={canRenderAnalysisVoicings ? analysisShowAllVoicings : false}
              displayMode={displayMode}
              degreeMap={analysisDegreeMap}
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
            highlightAllAsActive={true}
          />
        </div>
      )}
    </div>
  );
}
