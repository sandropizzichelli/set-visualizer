import React, { useMemo, useState } from "react";
import {
  STRINGS,
  DISPLAY_STRINGS,
  NOTE_TO_PC,
  PC_TO_NAME,
  FRET_COUNT,
  DEFAULT_MAX_SPAN,
  TRICHORD_FORTE_MAP,
  ALL_3_STRING_GROUPS,
  ALL_4_STRING_GROUPS,
  ALL_5_STRING_GROUPS,
  ALL_6_STRING_GROUPS,
  TETRACHORD_KEYS,
  PENTACHORD_KEYS,
  HEXACHORD_KEYS,
  FORTE_4_8_DATA,
  FORTE_5_7_DATA,
  FORTE_6_DATA,
  FORTE_REFERENCE,
} from "./setData";
import {
  parseNotes,
  combinationsOfThree,
  primeForm,
  pcsToLabel,
  transformPcs,
  getTransformLabel,
  transformOrderedPrimeForm,
  makeDegreeMapFromPrimeForm,
  parsePfString,
  complementFromPcs,
  makeStructuralKey,
  getBassDegree,
  filterByBassDegree,
  findVoicings,
  findTetrachordVoicings,
  findPentachordVoicings,
  findHexachordVoicings,
  pcAt,
} from "./setUtils";
import Fretboard from "./Fretboard";
import VoicingCard from "./VoicingCard";

function PillButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: "999px",
        border: active ? "2px solid #111" : "1px solid #ccc",
        background: active ? "#e2e8f0" : "white",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontWeight: "bold", marginBottom: "8px", marginTop: "4px" }}>
      {children}
    </div>
  );
}

function BassButtons({ noteCount, value, onChange }) {
  return (
    <div>
      <SectionTitle>Rivolti / basso</SectionTitle>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <PillButton active={value === "all"} onClick={() => onChange("all")}>
          Tutti
        </PillButton>
        {Array.from({ length: noteCount }, (_, i) => (
          <PillButton
            key={i + 1}
            active={value === i + 1}
            onClick={() => onChange(i + 1)}
          >
            {i + 1} in basso
          </PillButton>
        ))}
      </div>
    </div>
  );
}

function TransformButtons({ mode, setMode, amount, setAmount }) {
  return (
    <div>
      <SectionTitle>Inversioni / trasformazioni Tn-TnI</SectionTitle>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        <PillButton active={mode === "base"} onClick={() => setMode("base")}>
          Originale
        </PillButton>
        <PillButton active={mode === "tn"} onClick={() => setMode("tn")}>
          Tn
        </PillButton>
        <PillButton active={mode === "tni"} onClick={() => setMode("tni")}>
          TnI
        </PillButton>
      </div>

      {mode !== "base" && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <PillButton
              key={i}
              active={amount === i}
              onClick={() => setAmount(i)}
            >
              {i}
            </PillButton>
          ))}
        </div>
      )}
    </div>
  );
}

function TricordPage() {
  const [input, setInput] = useState("C Eb G B");
  const [maxSpan, setMaxSpan] = useState(DEFAULT_MAX_SPAN);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(true);
  const [selectedSubset, setSelectedSubset] = useState(0);

  const [connectionFilter, setConnectionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [displayMode, setDisplayMode] = useState("notes");
  const [showPrimeForm, setShowPrimeForm] = useState(true);
  const [showForte, setShowForte] = useState(true);
  const [dedupe, setDedupe] = useState(false);
  const [groupEquivalents, setGroupEquivalents] = useState(false);
  const [bassFilter, setBassFilter] = useState("all");
  const [transformMode, setTransformMode] = useState("base");
  const [transformAmount, setTransformAmount] = useState(0);

  const parsed = useMemo(() => parseNotes(input), [input]);

  const subsets = useMemo(() => {
    if (parsed.pcs.length < 3) return [];
    return combinationsOfThree(parsed.pcs).map((subset) => {
      const pf = primeForm(subset);
      const key = pf.join(",");
      return {
        pcs: subset,
        primeForm: pf,
        forteName: TRICHORD_FORTE_MAP[key] || "n.d.",
        label: pcsToLabel(subset),
      };
    });
  }, [parsed]);

  const baseSubset = subsets[selectedSubset] || null;

  const activeSubset = useMemo(() => {
    if (!baseSubset) return null;

    const transformed = transformPcs(
      baseSubset.pcs,
      transformMode,
      transformAmount
    );

    const transformedPrimeForm = transformOrderedPrimeForm(
      baseSubset.primeForm,
      transformMode,
      transformAmount
    );

    const degreeMap = makeDegreeMapFromPrimeForm(
      baseSubset.primeForm,
      transformMode,
      transformAmount
    );

    return {
      ...baseSubset,
      transformedPcs: transformed,
      transformedPrimeForm,
      degreeMap,
      transformLabel: getTransformLabel(transformMode, transformAmount),
    };
  }, [baseSubset, transformMode, transformAmount]);

  const rawVoicings = useMemo(() => {
    if (!activeSubset || activeSubset.transformedPcs.length !== 3) return [];
    const pf = activeSubset.primeForm;
    const forteName = activeSubset.forteName;
    return findVoicings(activeSubset.transformedPcs, maxSpan).map((v) => ({
      ...v,
      primeForm: pf,
      forteName,
    }));
  }, [activeSubset, maxSpan]);

  const filteredVoicings = useMemo(() => {
    let list = [...rawVoicings];

    if (connectionFilter === "adjacent") list = list.filter((v) => !v.hasSkip);
    if (connectionFilter === "skips") list = list.filter((v) => v.hasSkip);
    if (groupFilter !== "all")
      list = list.filter((v) => v.stringPattern === groupFilter);

    list = filterByBassDegree(list, bassFilter, activeSubset?.degreeMap);

    if (dedupe) {
      const seen = new Set();
      list = list.filter((v) => {
        const key = makeStructuralKey(v);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    if (groupEquivalents) {
      const seen = new Set();
      list = list.filter((v) => {
        const key = `${v.stringPattern}|${v.positions
          .map((p) => p.pc)
          .join(",")}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

   list.sort((a, b) => {
  if (a.lowestFret !== b.lowestFret) return a.lowestFret - b.lowestFret;
  if (a.span !== b.span) return a.span - b.span;
  return a.stringPattern.localeCompare(b.stringPattern);
});

    return list;
  },[
  rawVoicings,
  connectionFilter,
  groupFilter,
  bassFilter,
  dedupe,
  groupEquivalents,
  activeSubset,
]);

  const selectedVoicing = filteredVoicings[selected] || null;
  const availableGroupPatterns = useMemo(() => {
    const set = new Set(rawVoicings.map((v) => v.stringPattern));
    return [...set].sort();
  }, [rawVoicings]);

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
           Versione completa: inserisci 3 o più note, scegli il sottoinsieme di 3, filtra le forme e separa rivolti da trasformazioni Tn/TnI.
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
                Note inserite
              </label>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSelected(0);
                  setSelectedSubset(0);
                  setShowAll(true);
                }}
                placeholder="Es. C Eb G B"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                }}
              />
              <div
                style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}
              >
                Formati accettati: C C# Db D Eb E F F# Gb G Ab A Bb B
              </div>
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

          <div style={{ marginTop: "16px" }}>
            {subsets.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Sottoinsieme di 3 note
                </label>
                <select
                  value={selectedSubset}
                  onChange={(e) => {
                    setSelectedSubset(Number(e.target.value));
                    setSelected(0);
                    setShowAll(true);
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
                  {subsets.map((subset, idx) => (
                    <option key={idx} value={idx}>
                      {subset.label} | PF [{subset.primeForm.join(",")}] |{" "}
                      {subset.forteName}
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
                  checked={showPrimeForm}
                  onChange={(e) => setShowPrimeForm(e.target.checked)}
                />
                Mostra prime form
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={showForte}
                  onChange={(e) => setShowForte(e.target.checked)}
                />
                Mostra nome Forte
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={dedupe}
                  onChange={(e) => setDedupe(e.target.checked)}
                />
                Elimina doppioni strutturali
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={groupEquivalents}
                  onChange={(e) => setGroupEquivalents(e.target.checked)}
                />
                Raggruppa equivalenti per ordine di pitch classes sulle stesse
                corde
              </label>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            {parsed.invalid.length > 0 && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                }}
              >
                Note non riconosciute: {parsed.invalid.join(", ")}
              </div>
            )}

            {parsed.invalid.length === 0 && parsed.pcs.length < 3 && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                }}
              >
                Inserisci almeno 3 note diverse.
              </div>
            )}
          </div>
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
            <p style={{ color: "#666" }}>
              Le caselle grigie appartengono al sottoinsieme trasformato. Le
              caselle nere mostrano la forma selezionata, oppure tutte le forme
              se l’opzione è attiva.
            </p>

            {activeSubset && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Trasformazione attiva: {activeSubset.transformLabel}
              </div>
            )}

            {activeSubset && showPrimeForm && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Prime form del sottoinsieme: [{activeSubset.primeForm.join(",")}]
                {" | "}
                trasformata ordinata: [{activeSubset.transformedPrimeForm.join(",")}]
              </div>
            )}

            {activeSubset && showForte && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Nome Forte del sottoinsieme: {activeSubset.forteName}
              </div>
            )}

            <Fretboard
              voicing={selectedVoicing}
              allTargetPcs={activeSubset ? activeSubset.transformedPcs : []}
              allVoicings={filteredVoicings}
              showAll={showAll}
              displayMode={displayMode}
              degreeMap={activeSubset?.degreeMap}
            />
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #ddd",
            }}
          >
            <h2>Possibilità trovate</h2>
            <p style={{ color: "#666" }}>
              {filteredVoicings.length} forme complessive per il sottoinsieme
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
                  key={`${selectedSubset}-${i}-${v.positions
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
                  showPrimeForm={showPrimeForm}
                  showForte={showForte}
                  degreeMap={activeSubset?.degreeMap}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericSetPage({
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

  const [connectionFilter, setConnectionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [displayMode, setDisplayMode] = useState("notes");
  const [showPrimeForm, setShowPrimeForm] = useState(true);
  const [showForte, setShowForte] = useState(true);
  const [dedupe, setDedupe] = useState(false);
  const [groupEquivalents, setGroupEquivalents] = useState(false);
  const [hideEmptyStrings, setHideEmptyStrings] = useState(false);
  const [bassFilter, setBassFilter] = useState("all");
  const [transformMode, setTransformMode] = useState("base");
  const [transformAmount, setTransformAmount] = useState(0);

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

    if (connectionFilter === "adjacent") list = list.filter((v) => !v.hasSkip);
    if (connectionFilter === "skips") list = list.filter((v) => v.hasSkip);
    if (groupFilter !== "all")
      list = list.filter((v) => v.stringPattern === groupFilter);

    list = filterByBassDegree(list, bassFilter, activeSet?.degreeMap);

    if (dedupe) {
      const seen = new Set();
      list = list.filter((v) => {
        const key = makeStructuralKey(v);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    if (groupEquivalents) {
      const seen = new Set();
      list = list.filter((v) => {
        const key = `${v.stringPattern}|${v.positions
          .map((p) => p.pc)
          .join(",")}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
list.sort((a, b) => {
  if (a.lowestFret !== b.lowestFret) return a.lowestFret - b.lowestFret;
  if (a.span !== b.span) return a.span - b.span;
  return a.stringPattern.localeCompare(b.stringPattern);
});
    return list;
  }, [
  rawVoicings,
  connectionFilter,
  groupFilter,
  bassFilter,
  dedupe,
  groupEquivalents,
  activeSet,
]);

  const selectedVoicing = filteredVoicings[selected] || null;
  const availableGroupPatterns = useMemo(() => {
    const set = new Set(rawVoicings.map((v) => v.stringPattern));
    return [...set].sort();
  }, [rawVoicings]);

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
                {keys.map((key) => (
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
                    checked={showPrimeForm}
                    onChange={(e) => setShowPrimeForm(e.target.checked)}
                  />
                  Mostra prime form
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={showForte}
                    onChange={(e) => setShowForte(e.target.checked)}
                  />
                  Mostra nome Forte
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={dedupe}
                    onChange={(e) => setDedupe(e.target.checked)}
                  />
                  Elimina doppioni strutturali
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={groupEquivalents}
                    onChange={(e) => setGroupEquivalents(e.target.checked)}
                  />
                  Raggruppa equivalenti per ordine di pitch classes sulle stesse
                  corde
                </label>
              </div>
            </>
          )}

          <div style={{ marginTop: "16px" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={hideEmptyStrings}
                onChange={(e) => setHideEmptyStrings(e.target.checked)}
              />
              Nascondi corde vuote
            </label>
          </div>
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

                {activeSet && showPrimeForm && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#555",
                      marginBottom: "10px",
                    }}
                  >
                    Prime form del {noteName}: [{activeSet.primeForm.join(",")}]
                    {" | "}
                    trasformata ordinata: [{activeSet.transformedPrimeForm.join(",")}]
                  </div>
                )}

                {activeSet && showForte && (
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
                  hideEmptyStrings={hideEmptyStrings}
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
                  hideEmptyStrings={hideEmptyStrings}
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
                      showPrimeForm={showPrimeForm}
                      showForte={showForte}
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

function TetrachordPage() {
  return (
    <GenericSetPage
      title="Visualizzatore tetracordi su chitarra"
      description="Pagina separata dai tricordi. Qui lavori solo con i set a 4 note di Allen Forte."
      keyLabel="Tetracordo Forte"
      keys={TETRACHORD_KEYS}
      dataMap={FORTE_4_8_DATA}
      findVoicingFn={findTetrachordVoicings}
      noteName="tetracordo"
      complementName="Complementare"
      degreeButtonLabel="Gradi 1-2-3-4"
      noteCount={4}
    />
  );
}

function PentachordPage() {
  return (
    <GenericSetPage
      title="Visualizzatore pentacordi su chitarra"
      description="Pagina separata dai tricordi e dai tetracordi. Qui lavori solo con i set a 5 note di Allen Forte."
      keyLabel="Pentacordo Forte"
      keys={PENTACHORD_KEYS}
      dataMap={FORTE_5_7_DATA}
      findVoicingFn={findPentachordVoicings}
      noteName="pentacordo"
      complementName="Complementare"
      degreeButtonLabel="Gradi 1-2-3-4-5"
      noteCount={5}
    />
  );
}

function HexachordPage() {
  return (
    <GenericSetPage
      title="Visualizzatore esacordi su chitarra"
      description="Pagina separata dai tricordi, tetracordi e pentacordi. Qui lavori solo con i set a 6 note di Allen Forte."
      keyLabel="Esacordo Forte"
      keys={HEXACHORD_KEYS}
      dataMap={FORTE_6_DATA}
      findVoicingFn={findHexachordVoicings}
      noteName="esacordo"
      complementName="Complementare"
      degreeButtonLabel="Gradi 1-2-3-4-5-6"
      noteCount={6}
    />
  );
}

function PageSwitcher({ page, setPage }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        gap: "8px",
        background: "rgba(255,255,255,0.95)",
        padding: "8px",
        borderRadius: "14px",
        border: "1px solid #ddd",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        flexWrap: "wrap",
        maxWidth: "90vw",
      }}
    >
      <PillButton
        active={page === "tricordi"}
        onClick={() => setPage("tricordi")}
      >
        Pagina tricordi
      </PillButton>
      <PillButton
        active={page === "tetracordi"}
        onClick={() => setPage("tetracordi")}
      >
        Pagina tetracordi
      </PillButton>
      <PillButton
        active={page === "pentacordi"}
        onClick={() => setPage("pentacordi")}
      >
        Pagina pentacordi
      </PillButton>
      <PillButton
        active={page === "esacordi"}
        onClick={() => setPage("esacordi")}
      >
        Pagina esacordi
      </PillButton>
    </div>
  );
}

export default function SetVisualizer() {
  const [page, setPage] = useState("tricordi");

  return (
    <>
      <PageSwitcher page={page} setPage={setPage} />
      {page === "tricordi" && <TricordPage />}
      {page === "tetracordi" && <TetrachordPage />}
      {page === "pentacordi" && <PentachordPage />}
      {page === "esacordi" && <HexachordPage />}
    </>
  );
}
