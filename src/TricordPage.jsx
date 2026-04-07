import React, { useMemo, useState } from "react";
import {
  DEFAULT_MAX_SPAN,
  TRICHORD_FORTE_MAP,
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
  makeStructuralKey,
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
export default function TricordPage() {
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
