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
  primeForm,
  findVoicings,
  findTetrachordVoicings,
  findPentachordVoicings,
  findHexachordVoicings,
} from "./setUtils";
import Fretboard from "./Fretboard";
import VoicingCard from "./VoicingCard";
import {
  PillButton,
  SectionTitle,
  BassButtons,
  TransformButtons,
} from "./SetControls";

function getCardinalityLabel(n) {
  const labels = {
    3: "Tricordi",
    4: "Tetracordi",
    5: "Pentacordi",
    6: "Esacordi",
    7: "Eptacordi",
    8: "Ottacordi",
    9: "Enneacordi",
    10: "Decacordi",
    11: "Undecacordi",
    12: "Dodecacordi",
  };

  return labels[n] || `Cardinalità ${n}`;
}

function getClassKey(item) {
  return `${item.forteName || "n.d."}|${item.primeForm.join("-")}`;
}

function arePcArraysEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function getVoicingFinderByCardinality(cardinality) {
  if (cardinality === 3) return findVoicings;
  if (cardinality === 4) return findTetrachordVoicings;
  if (cardinality === 5) return findPentachordVoicings;
  if (cardinality === 6) return findHexachordVoicings;
  return null;
}

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
  const [showAll, setShowAll] = useState(false);
  const [showComplement, setShowComplement] = useState(false);
  const [excludeOpenStrings, setExcludeOpenStrings] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("voicings");

  const [subsetTargetCardinality, setSubsetTargetCardinality] = useState(
    noteCount > 3 ? noteCount - 1 : 3
  );
  const [supersetTargetCardinality, setSupersetTargetCardinality] = useState(
    noteCount < 12 ? noteCount + 1 : 12
  );

  const [groupFilter, setGroupFilter] = useState("all");
  const [displayMode, setDisplayMode] = useState("notes");
  const [bassFilter, setBassFilter] = useState("all");
  const [transformMode, setTransformMode] = useState("base");
  const [transformAmount, setTransformAmount] = useState(0);

  const [selectedAnalysisClassKey, setSelectedAnalysisClassKey] =
    useState(null);
  const [selectedAnalysisMemberIndex, setSelectedAnalysisMemberIndex] =
    useState(0);
  const [selectedAnalysisVoicingIndex, setSelectedAnalysisVoicingIndex] =
    useState(0);
  const [analysisShowAllVoicings, setAnalysisShowAllVoicings] = useState(false);
  const [analysisBassFilter, setAnalysisBassFilter] = useState("all");

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

  const subsetCardinalityOptions = useMemo(() => {
    const options = [];
    for (let n = 3; n <= noteCount - 1; n++) {
      options.push(n);
    }
    return options;
  }, [noteCount]);

  const supersetCardinalityOptions = useMemo(() => {
    const options = [];
    for (let n = noteCount + 1; n <= 12; n++) {
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
  }, [rawVoicings, excludeOpenStrings, groupFilter, bassFilter, activeSet]);

  const subsetClasses = useMemo(() => {
    if (!activeSet || showComplement) return [];
    if (activeSet.pcs.length <= 3) return [];
    if (!subsetCardinalityOptions.includes(subsetTargetCardinality)) return [];

    return getSubsetClasses(activeSet.pcs, {
      minCardinality: subsetTargetCardinality,
      maxCardinality: subsetTargetCardinality,
    });
  }, [
    activeSet,
    showComplement,
    subsetTargetCardinality,
    subsetCardinalityOptions,
  ]);

  const supersetClasses = useMemo(() => {
    if (!activeSet || showComplement) return [];
    if (activeSet.pcs.length >= 12) return [];
    if (!supersetCardinalityOptions.includes(supersetTargetCardinality)) {
      return [];
    }

    return getSupersetClasses(activeSet.pcs, supersetTargetCardinality);
  }, [
    activeSet,
    showComplement,
    supersetTargetCardinality,
    supersetCardinalityOptions,
  ]);

  const analysisClasses = useMemo(() => {
    if (analysisMode === "subsets") return subsetClasses;
    if (analysisMode === "supersets") return supersetClasses;
    return [];
  }, [analysisMode, subsetClasses, supersetClasses]);

  const selectedAnalysisClass = useMemo(() => {
    if (!analysisClasses.length) return null;
    return (
      analysisClasses.find(
        (item) => getClassKey(item) === selectedAnalysisClassKey
      ) || analysisClasses[0]
    );
  }, [analysisClasses, selectedAnalysisClassKey]);

  const analysisMembers = selectedAnalysisClass?.members || [];
  const selectedAnalysisMember =
    analysisMembers[selectedAnalysisMemberIndex] || null;

  const selectedAnalysisMemberPrimeForm = useMemo(() => {
    if (!selectedAnalysisMember) return [];
    return primeForm(selectedAnalysisMember);
  }, [selectedAnalysisMember]);

  const analysisDegreeMap = useMemo(() => {
    if (!selectedAnalysisMember) return null;

    const map = new Map();
    selectedAnalysisMember.forEach((pc, idx) => {
      map.set(pc, idx + 1);
    });

    return map;
  }, [selectedAnalysisMember]);

  const analysisVoicingFinder = useMemo(() => {
    if (!selectedAnalysisMember) return null;
    return getVoicingFinderByCardinality(selectedAnalysisMember.length);
  }, [selectedAnalysisMember]);

  const analysisRawVoicings = useMemo(() => {
    if (!selectedAnalysisMember || !analysisVoicingFinder) return [];

    return analysisVoicingFinder(selectedAnalysisMember, maxSpan).map((v) => ({
      ...v,
      primeForm: selectedAnalysisMemberPrimeForm,
      forteName: selectedAnalysisClass?.forteName || null,
    }));
  }, [
    selectedAnalysisMember,
    analysisVoicingFinder,
    maxSpan,
    selectedAnalysisMemberPrimeForm,
    selectedAnalysisClass,
  ]);

  const analysisFilteredVoicings = useMemo(() => {
    let list = [...analysisRawVoicings];

    if (excludeOpenStrings) {
      list = list.filter((v) => v.positions.every((p) => p.fret > 0));
    }

    list = filterByBassDegree(list, analysisBassFilter, analysisDegreeMap);

    list.sort((a, b) => {
      if (a.lowestFret !== b.lowestFret) return a.lowestFret - b.lowestFret;
      if (a.span !== b.span) return a.span - b.span;
      return a.stringPattern.localeCompare(b.stringPattern);
    });

    return list;
  }, [
    analysisRawVoicings,
    excludeOpenStrings,
    analysisBassFilter,
    analysisDegreeMap,
  ]);

  const selectedAnalysisVoicing =
    analysisFilteredVoicings[selectedAnalysisVoicingIndex] || null;

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
    groupFilter,
    bassFilter,
    displayMode,
    transformMode,
    transformAmount,
  ]);

  useEffect(() => {
    setSubsetTargetCardinality(noteCount > 3 ? noteCount - 1 : 3);
    setSupersetTargetCardinality(noteCount < 12 ? noteCount + 1 : 12);
  }, [selectedForte, noteCount]);

  useEffect(() => {
    if (analysisMode === "voicings" || !analysisClasses.length) {
      setSelectedAnalysisClassKey(null);
      return;
    }

    const exists = analysisClasses.some(
      (item) => getClassKey(item) === selectedAnalysisClassKey
    );

    if (!exists) {
      setSelectedAnalysisClassKey(getClassKey(analysisClasses[0]));
    }
  }, [analysisMode, analysisClasses, selectedAnalysisClassKey]);

  useEffect(() => {
    if (!selectedAnalysisClass || !analysisMembers.length) {
      setSelectedAnalysisMemberIndex(0);
      setSelectedAnalysisVoicingIndex(0);
      setAnalysisShowAllVoicings(false);
      setAnalysisBassFilter("all");
      return;
    }

    const transformedTarget = transformPcs(
      selectedAnalysisClass.primeForm,
      transformMode,
      transformAmount
    );

    const matchingIndex = analysisMembers.findIndex((member) =>
      arePcArraysEqual(member, transformedTarget)
    );

    setSelectedAnalysisMemberIndex(matchingIndex >= 0 ? matchingIndex : 0);
    setSelectedAnalysisVoicingIndex(0);
    setAnalysisShowAllVoicings(false);
    setAnalysisBassFilter("all");
  }, [
    selectedAnalysisClass,
    analysisMembers,
    transformMode,
    transformAmount,
  ]);

  useEffect(() => {
    setSelectedAnalysisVoicingIndex(0);
    setAnalysisShowAllVoicings(false);
  }, [selectedAnalysisMemberIndex]);

  useEffect(() => {
    setSelectedAnalysisVoicingIndex(0);
  }, [maxSpan, excludeOpenStrings, analysisBassFilter]);

  const canRenderAnalysisVoicings =
    !!selectedAnalysisMember &&
    selectedAnalysisMember.length >= 3 &&
    selectedAnalysisMember.length <= 6 &&
    !!analysisVoicingFinder;

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
                  setShowAll(false);
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

              {analysisMode === "subsets" &&
                subsetCardinalityOptions.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Tipo di subset
                    </label>
                    <select
                      value={subsetTargetCardinality}
                      onChange={(e) =>
                        setSubsetTargetCardinality(Number(e.target.value))
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
                      {subsetCardinalityOptions.map((n) => (
                        <option key={n} value={n}>
                          {getCardinalityLabel(n)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {analysisMode === "supersets" &&
                supersetCardinalityOptions.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Tipo di superset
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
                          {getCardinalityLabel(n)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {analysisMode === "voicings" ? (
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
                        setShowAll(false);
                      }}
                      amount={transformAmount}
                      setAmount={(n) => {
                        setTransformAmount(n);
                        setSelected(0);
                        setShowAll(false);
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
              ) : (
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
                          {degreeButtonLabel}
                        </PillButton>
                      </div>
                    </div>

                    <TransformButtons
                      mode={transformMode}
                      setMode={(m) => {
                        setTransformMode(m);
                        setSelected(0);
                        setShowAll(false);
                      }}
                      amount={transformAmount}
                      setAmount={(n) => {
                        setTransformAmount(n);
                        setSelected(0);
                        setShowAll(false);
                      }}
                    />
                  </div>

                  <div style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
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
              analysisMode === "voicings" ? (
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
                      Cardinalità {selectedAnalysisMember.length}: sul manico
                      vengono mostrate le pitch classes dell’occorrenza, non un
                      voicing simultaneo.
                    </div>
                  )}

                  <Fretboard
                    voicing={
                      canRenderAnalysisVoicings ? selectedAnalysisVoicing : null
                    }
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
              ) : (
                <>
                  <h2>
                    {analysisMode === "subsets" ? "Subset-class" : "Superset-class"}
                  </h2>

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
                          getClassKey(item) ===
                          getClassKey(selectedAnalysisClass || item)
                        }
                        onClick={() => setSelectedAnalysisClassKey(getClassKey(item))}
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
                              {selectedAnalysisMemberIndex + 1} / {analysisMembers.length}
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
                                setSelectedAnalysisMemberIndex((prev) =>
                                  Math.max(0, prev - 1)
                                )
                              }
                              disabled={selectedAnalysisMemberIndex === 0}
                              style={{
                                padding: "10px 12px",
                                borderRadius: "10px",
                                border: "1px solid #ccc",
                                background:
                                  selectedAnalysisMemberIndex === 0 ? "#f8fafc" : "white",
                                cursor:
                                  selectedAnalysisMemberIndex === 0
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              ←
                            </button>

                            <select
                              value={selectedAnalysisMemberIndex}
                              onChange={(e) =>
                                setSelectedAnalysisMemberIndex(Number(e.target.value))
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
                                setSelectedAnalysisMemberIndex((prev) =>
                                  Math.min(analysisMembers.length - 1, prev + 1)
                                )
                              }
                              disabled={
                                selectedAnalysisMemberIndex === analysisMembers.length - 1
                              }
                              style={{
                                padding: "10px 12px",
                                borderRadius: "10px",
                                border: "1px solid #ccc",
                                background:
                                  selectedAnalysisMemberIndex === analysisMembers.length - 1
                                    ? "#f8fafc"
                                    : "white",
                                cursor:
                                  selectedAnalysisMemberIndex === analysisMembers.length - 1
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
                              onChange={setAnalysisBassFilter}
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
                                  setAnalysisShowAllVoicings(e.target.checked)
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
                                  )}-${selectedAnalysisMemberIndex}-${i}-${v.positions
                                    .map((p) => `${p.stringIndex}-${p.fret}`)
                                    .join("-")}`}
                                  voicing={v}
                                  index={i}
                                  selected={i === selectedAnalysisVoicingIndex}
                                  onSelect={() => {
                                    setSelectedAnalysisVoicingIndex(i);
                                    if (analysisShowAllVoicings) {
                                      setAnalysisShowAllVoicings(false);
                                    }
                                  }}
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
