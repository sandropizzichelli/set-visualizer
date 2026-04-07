import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAX_SPAN, TRICHORD_FORTE_MAP } from "./setData";
import {
  transformPcs,
  getTransformLabel,
  transformOrderedPrimeForm,
  makeDegreeMapFromPrimeForm,
  complementFromPcs,
  filterByBassDegree,
  findVoicings,
} from "./setUtils";
import Fretboard from "./Fretboard";
import VoicingCard from "./VoicingCard";
import {
  PillButton,
  SectionTitle,
  BassButtons,
  TransformButtons,
} from "./SetControls";

const TRICHORD_OPTIONS = Object.entries(TRICHORD_FORTE_MAP).map(
  ([pfKey, forteName]) => {
    const primeForm = pfKey.split(",").map(Number);
    return {
      forteName,
      primeForm,
      pfLabel: `[${primeForm.join(",")}]`,
    };
  }
);

TRICHORD_OPTIONS.sort((a, b) => {
  const nA = parseInt(a.forteName.split("-")[1], 10);
  const nB = parseInt(b.forteName.split("-")[1], 10);
  return nA - nB;
});

export default function TricordPage() {
  const [selectedForte, setSelectedForte] = useState(
    TRICHORD_OPTIONS[0].forteName
  );
  const [maxSpan, setMaxSpan] = useState(DEFAULT_MAX_SPAN);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(true);
  const [showComplement, setShowComplement] = useState(false);
  const [excludeOpenStrings, setExcludeOpenStrings] = useState(false);

  const [connectionFilter, setConnectionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [displayMode, setDisplayMode] = useState("notes");
  const [bassFilter, setBassFilter] = useState("all");
  const [transformMode, setTransformMode] = useState("base");
  const [transformAmount, setTransformAmount] = useState(0);

  const baseSet = useMemo(() => {
    return (
      TRICHORD_OPTIONS.find((item) => item.forteName === selectedForte) || null
    );
  }, [selectedForte]);

  const activeSet = useMemo(() => {
    if (!baseSet) return null;

    const transformedPcs = transformPcs(
      baseSet.primeForm,
      transformMode,
      transformAmount
    );

    const transformedPrimeForm = transformOrderedPrimeForm(
      baseSet.primeForm,
      transformMode,
      transformAmount
    );

    const degreeMap = makeDegreeMapFromPrimeForm(
      baseSet.primeForm,
      transformMode,
      transformAmount
    );

    return {
      forteName: baseSet.forteName,
      primeForm: baseSet.primeForm,
      transformedPcs,
      transformedPrimeForm,
      degreeMap,
      transformLabel: getTransformLabel(transformMode, transformAmount),
    };
  }, [baseSet, transformMode, transformAmount]);

  const complementData = useMemo(() => {
    if (!activeSet) return null;
    return complementFromPcs(activeSet.transformedPcs);
  }, [activeSet]);

  const rawVoicings = useMemo(() => {
    if (!activeSet || showComplement || activeSet.transformedPcs.length !== 3) {
      return [];
    }

    return findVoicings(activeSet.transformedPcs, maxSpan).map((v) => ({
      ...v,
      primeForm: activeSet.primeForm,
      forteName: activeSet.forteName,
    }));
  }, [activeSet, maxSpan, showComplement]);

  const filteredVoicings = useMemo(() => {
    let list = [...rawVoicings];

    if (excludeOpenStrings) {
      list = list.filter((v) => v.positions.every((p) => p.fret > 0));
    }

    if (connectionFilter === "adjacent") list = list.filter((v) => !v.hasSkip);
    if (connectionFilter === "skips") list = list.filter((v) => v.hasSkip);
    if (groupFilter !== "all") {
      list = list.filter((v) => v.stringPattern === groupFilter);
    }

    list = filterByBassDegree(list, bassFilter, activeSet?.degreeMap);

    list.sort((a, b) => {
      if (a.lowestFret !== b.lowestFret) return a.lowestFret - b.lowestFret;
      if (a.span !== b.span) return a.span - b.span;
      return a.stringPattern.localeCompare(b.stringPattern);
    });

    return list;
  }, [
    rawVoicings,
    excludeOpenStrings,
    connectionFilter,
    groupFilter,
    bassFilter,
    activeSet,
  ]);

  const selectedVoicing = filteredVoicings[selected] || null;

  const availableGroupPatterns = useMemo(() => {
    const set = new Set(rawVoicings.map((v) => v.stringPattern));
    return [...set].sort();
  }, [rawVoicings]);

  useEffect(() => {
    setSelected(0);
  }, [
    selectedForte,
    maxSpan,
    excludeOpenStrings,
    connectionFilter,
    groupFilter,
    bassFilter,
    displayMode,
    transformMode,
    transformAmount,
  ]);

  useEffect(() => {
    setShowAll(true);
  }, [
    selectedForte,
    maxSpan,
    excludeOpenStrings,
    connectionFilter,
    groupFilter,
    bassFilter,
    transformMode,
    transformAmount,
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "24px",
        color: "#111",
      }}
    >
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "18px",
            marginBottom: "24px",
            border: "1px solid #ddd",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Visualizzatore tricordi su chitarra</h1>
          <p>
            Pagina uniformata alle altre: seleziona direttamente un tricordo di
            Allen Forte e visualizzane le forme sul manico.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 0.8fr",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Tricordo Forte
              </label>
              <select
                value={selectedForte}
                onChange={(e) => {
                  setSelectedForte(e.target.value);
                  setSelected(0);
                  setShowAll(true);
                  setShowComplement(false);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  background: "white",
                }}
              >
                {TRICHORD_OPTIONS.map((item) => (
                  <option key={item.forteName} value={item.forteName}>
                    {item.forteName} | PF {item.pfLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Apertura massima: {maxSpan} tasti
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={maxSpan}
                onChange={(e) => {
                  setMaxSpan(Number(e.target.value));
                  setSelected(0);
                }}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <PillButton
              active={!showComplement}
              onClick={() => setShowComplement(false)}
            >
              Mostra tricordo
            </PillButton>
            <PillButton
              active={showComplement}
              onClick={() => setShowComplement(true)}
            >
              Mostra complementare
            </PillButton>
          </div>

          {!showComplement && (
            <>
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  marginTop: "16px",
                }}
              >
                <div>
                  <SectionTitle>Filtro connessione corde</SectionTitle>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <PillButton
                      active={connectionFilter === "all"}
                      onClick={() => setConnectionFilter("all")}
                    >
                      Tutte
                    </PillButton>
                    <PillButton
                      active={connectionFilter === "adjacent"}
                      onClick={() => setConnectionFilter("adjacent")}
                    >
                      Solo adiacenti
                    </PillButton>
                    <PillButton
                      active={connectionFilter === "skips"}
                      onClick={() => setConnectionFilter("skips")}
                    >
                      Solo salti
                    </PillButton>
                  </div>
                </div>

                <div>
                  <SectionTitle>Gruppo corde</SectionTitle>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <PillButton
                      active={groupFilter === "all"}
                      onClick={() => setGroupFilter("all")}
                    >
                      Tutti
                    </PillButton>
                    {availableGroupPatterns.map((pattern) => (
                      <PillButton
                        key={pattern}
                        active={groupFilter === pattern}
                        onClick={() => setGroupFilter(pattern)}
                      >
                        {pattern}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionTitle>Vista</SectionTitle>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <PillButton
                      active={displayMode === "notes"}
                      onClick={() => setDisplayMode("notes")}
                    >
                      Note
                    </PillButton>
                    <PillButton
                      active={displayMode === "degrees"}
                      onClick={() => setDisplayMode("degrees")}
                    >
                      Gradi 1-2-3
                    </PillButton>
                  </div>
                </div>

                <BassButtons
                  noteCount={3}
                  value={bassFilter}
                  onChange={setBassFilter}
                />

                <TransformButtons
                  mode={transformMode}
                  setMode={(m) => {
                    setTransformMode(m);
                    setSelected(0);
                    setShowAll(true);
                  }}
                  amount={transformAmount}
                  setAmount={(n) => {
                    setTransformAmount(n);
                    setSelected(0);
                    setShowAll(true);
                  }}
                />
              </div>

              <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                  />
                  Mostra tutte le forme insieme sul manico
                </label>

                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={excludeOpenStrings}
                    onChange={(e) => setExcludeOpenStrings(e.target.checked)}
                  />
                  Escludi corde vuote
                </label>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
          }}
        >
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
              <>
                <p style={{ color: "#666" }}>
                  Le caselle grigie appartengono al tricordo trasformato. Le
                  caselle nere mostrano la forma selezionata, oppure tutte le
                  forme se l’opzione è attiva.
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
                    Prime form del tricordo: [{activeSet.primeForm.join(",")}]
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
                    Nome Forte del tricordo: {activeSet.forteName}
                  </div>
                )}

                <Fretboard
                  voicing={selectedVoicing}
                  allTargetPcs={activeSet ? activeSet.transformedPcs : []}
                  allVoicings={filteredVoicings}
                  showAll={showAll}
                  displayMode={displayMode}
                  degreeMap={activeSet?.degreeMap}
                />
              </>
            ) : (
              <>
                <p style={{ color: "#666" }}>
                  Le caselle nere mostrano il complementare della trasformazione
                  attiva del tricordo.
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

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #ddd",
            }}
          >
            {!showComplement ? (
              <>
                <h2>Possibilità trovate</h2>
                <p style={{ color: "#666" }}>
                  {filteredVoicings.length} forme complessive per il tricordo
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
                      selected={i === selected}
                      onSelect={() => {
                        setSelected(i);
                        if (showAll) setShowAll(false);
                      }}
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
                <h2>Dettagli analitici</h2>

                {activeSet && complementData && (
                  <div style={{ marginTop: "12px", lineHeight: 1.8 }}>
                    <div>
                      <strong>Tricordo di partenza:</strong> {activeSet.forteName}
                    </div>
                    <div>
                      <strong>Trasformazione attiva:</strong>{" "}
                      {activeSet.transformLabel}
                    </div>
                    <div>
                      <strong>Prime form:</strong> ({activeSet.primeForm.join("")})
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
                        <strong>Complementare:</strong> {complementData.forte}
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
                        {complementData.pcs
                          .map((pc) => {
                            const names = [
                              "C",
                              "C#",
                              "D",
                              "Eb",
                              "E",
                              "F",
                              "F#",
                              "G",
                              "Ab",
                              "A",
                              "Bb",
                              "B",
                            ];
                            return names[pc];
                          })
                          .join(" – ")}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}