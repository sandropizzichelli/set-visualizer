import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAX_SPAN, PC_TO_NAME } from "./setData";
import {
  parsePfString,
  transformPcs,
  transformOrderedPrimeForm,
  makeDegreeMapFromPrimeForm,
  getTransformLabel,
  complementFromPcs,
  filterByBassDegree,
  getSubsetClasses,
  getSupersetClasses,
} from "./setUtils";
import Fretboard from "./Fretboard";
import VoicingCard from "./VoicingCard";
import {
  PillButton,
  SectionTitle,
  BassButtons,
  TransformButtons,
} from "./SetControls";

export default function GenericSetPage({
  title,
  description,
  keyLabel,
  keys,
  dataMap,
  findVoicingFn,
  noteName,
  complementName,
  degreeButtonLabel,
  noteCount,
}) {
  const [selectedForte, setSelectedForte] = useState(keys[0]);
  const [maxSpan, setMaxSpan] = useState(DEFAULT_MAX_SPAN);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(true);
  const [showComplement, setShowComplement] = useState(false);
  const [excludeOpenStrings, setExcludeOpenStrings] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("voicings");
  const [supersetTargetCardinality, setSupersetTargetCardinality] = useState(
    Math.min(noteCount + 1, 8)
  );

  const [connectionFilter, setConnectionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [displayMode, setDisplayMode] = useState("notes");
  const [bassFilter, setBassFilter] = useState("all");
  const [transformMode, setTransformMode] = useState("base");
  const [transformAmount, setTransformAmount] = useState(0);

  const sortedKeys = useMemo(() => {
    return [...keys].sort((a, b) => {
      const parseKey = (key) => {
        const [cardinality, rest] = key.split("-");
        const isZ = rest.startsWith("Z");
        const number = parseInt(rest.replace("Z", ""), 10);
        return {
          cardinality: parseInt(cardinality, 10),
          isZ,
          number,
        };
      };

      const A = parseKey(a);
      const B = parseKey(b);

      if (A.cardinality !== B.cardinality) {
        return A.cardinality - B.cardinality;
      }

      if (A.number !== B.number) {
        return A.number - B.number;
      }

      if (A.isZ !== B.isZ) {
        return A.isZ ? 1 : -1;
      }

      return a.localeCompare(b);
    });
  }, [keys]);

  const supersetCardinalityOptions = useMemo(() => {
    const options = [];
    for (let n = noteCount + 1; n <= 8; n++) {
      options.push(n);
    }
    return options;
  }, [noteCount]);

  const setDataRaw = dataMap[selectedForte] || null;

  const activeSet = useMemo(() => {
    if (!setDataRaw) return null;

    const basePcs = parsePfString(setDataRaw.pf);
    const transformedPcs = transformPcs(
      basePcs,
      transformMode,
      transformAmount
    );

    const transformedPrimeForm = transformOrderedPrimeForm(
      basePcs,
      transformMode,
      transformAmount
    );

    const degreeMap = makeDegreeMapFromPrimeForm(
      basePcs,
      transformMode,
      transformAmount
    );

    return {
      basePcs,
      pcs: transformedPcs,
      primeForm: basePcs,
      transformedPrimeForm,
      degreeMap,
      forteName: selectedForte,
      pf: setDataRaw.pf,
      iv: setDataRaw.iv,
      transformLabel: getTransformLabel(transformMode, transformAmount),
    };
  }, [setDataRaw, selectedForte, transformMode, transformAmount]);

  const complementData = useMemo(() => {
    if (!activeSet) return null;
    return complementFromPcs(activeSet.pcs);
  }, [activeSet]);

  const rawVoicings = useMemo(() => {
    if (!activeSet || showComplement) return [];
    return findVoicingFn(activeSet.pcs, maxSpan).map((v) => ({
      ...v,
      primeForm: activeSet.primeForm,
      forteName: activeSet.forteName,
    }));
  }, [activeSet, maxSpan, showComplement, findVoicingFn]);

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

  const subsetClasses = useMemo(() => {
    if (!activeSet || showComplement) return [];

    return getSubsetClasses(activeSet.pcs, {
      minCardinality: 3,
      maxCardinality: activeSet.pcs.length - 1,
    });
  }, [activeSet, showComplement]);

  const supersetClasses = useMemo(() => {
    if (!activeSet || showComplement) return [];
    return getSupersetClasses(activeSet.pcs, supersetTargetCardinality);
  }, [activeSet, showComplement, supersetTargetCardinality]);

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

  useEffect(() => {
    const nextValue = Math.min(noteCount + 1, 8);
    setSupersetTargetCardinality(nextValue);
  }, [selectedForte, noteCount]);

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
          <h1 style={{ marginTop: 0 }}>{title}</h1>
          <p>{description}</p>

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
                {keyLabel}
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
                {sortedKeys.map((key) => (
                  <option key={key} value={key}>
                    {key} | PF ({dataMap[key].pf}) | IV {dataMap[key].iv}
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
              Mostra {noteName}
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
              <div style={{ marginTop: "16px" }}>
                <SectionTitle>Analisi insiemistica</SectionTitle>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <PillButton
                    active={analysisMode === "voicings"}
                    onClick={() => setAnalysisMode("voicings")}
                  >
                    Voicing
                  </PillButton>
                  <PillButton
                    active={analysisMode === "subsets"}
                    onClick={() => setAnalysisMode("subsets")}
                  >
                    Subset-class
                  </PillButton>
                  <PillButton
                    active={analysisMode === "supersets"}
                    onClick={() => setAnalysisMode("supersets")}
                  >
                    Superset-class
                  </PillButton>
                </div>
              </div>

              {analysisMode === "supersets" && (
                <div style={{ marginTop: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Cardinalità target superset
                  </label>
                  <select
                    value={supersetTargetCardinality}
                    onChange={(e) =>
                      setSupersetTargetCardinality(Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      maxWidth: "280px",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #ccc",
                      fontSize: "16px",
                      background: "white",
                    }}
                  >
                    {supersetCardinalityOptions.map((n) => (
                      <option key={n} value={n}>
                        Cardinalità {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
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
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
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
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
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
                      {degreeButtonLabel}
                    </PillButton>
                  </div>
                </div>

                <BassButtons
                  noteCount={noteCount}
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
                  Le caselle grigie appartengono al {noteName} trasformato. Le
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
              ) : analysisMode === "subsets" ? (
                <>
                  <h2>Subset-class</h2>
                  <p style={{ color: "#666" }}>
                    {subsetClasses.length} classi di sottoinsiemi trovate per il{" "}
                    {noteName} selezionato.
                  </p>

                  <div
                    style={{
                      maxHeight: "760px",
                      overflowY: "auto",
                      marginTop: "16px",
                    }}
                  >
                    {subsetClasses.map((item, i) => (
                      <div
                        key={`${selectedForte}-subset-${i}-${item.primeForm.join(
                          "-"
                        )}`}
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #ddd",
                          background: "white",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>
                          {item.forteName || "n.d."}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Prime form: [{item.primeForm.join(",")}]
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Cardinalità: {item.cardinality}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Occorrenze concrete: {item.concreteCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2>Superset-class</h2>
                  <p style={{ color: "#666" }}>
                    {supersetClasses.length} classi di soprainsiemi trovate a
                    cardinalità {supersetTargetCardinality}.
                  </p>

                  <div
                    style={{
                      maxHeight: "760px",
                      overflowY: "auto",
                      marginTop: "16px",
                    }}
                  >
                    {supersetClasses.map((item, i) => (
                      <div
                        key={`${selectedForte}-superset-${i}-${item.primeForm.join(
                          "-"
                        )}`}
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #ddd",
                          background: "white",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>
                          {item.forteName || "n.d."}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Prime form: [{item.primeForm.join(",")}]
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Cardinalità: {item.cardinality}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          Occorrenze concrete: {item.concreteCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            ) : (
              <>
                <h2>Dettagli analitici</h2>

                {activeSet && complementData && (
                  <div style={{ marginTop: "12px", lineHeight: 1.8 }}>
                    <div>
                      <strong>
                        {noteName.charAt(0).toUpperCase() + noteName.slice(1)}{" "}
                        di partenza:
                      </strong>{" "}
                      {activeSet.forteName}
                    </div>
                    <div>
                      <strong>Trasformazione attiva:</strong>{" "}
                      {activeSet.transformLabel}
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
                        <strong>{complementName}:</strong>{" "}
                        {complementData.forte}
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
                          .map((pc) => PC_TO_NAME[pc])
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
