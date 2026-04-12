import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_MAX_SPAN } from "./setData";
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
import GenericSetControlsPanel from "./GenericSetControlsPanel";
import GenericSetFretboardPanel from "./GenericSetFretboardPanel";
import GenericSetResultsPanel from "./GenericSetResultsPanel";
import { getClassKey } from "./genericSetPageHelpers";
import {
  getCurrentSearchParams,
  readBooleanParam,
  readEnumParam,
  readIntegerParam,
  readStringParam,
  replaceSearchParams,
  setBooleanSearchParam,
  setSearchParam,
} from "./urlState";

const ANALYSIS_MODES = ["voicings", "subsets", "supersets"];
const DISPLAY_MODES = ["notes", "degrees"];
const TRANSFORM_MODES = ["base", "tn", "tni"];

function readBassFilter(params, name, noteCount) {
  const value = params.get(name);
  if (!value || value === "all") return "all";

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > noteCount) {
    return "all";
  }

  return parsed;
}

function buildInitialUrlState(keys, noteCount) {
  const params = getCurrentSearchParams();

  return {
    selectedForte: readStringParam(params, "forte", keys[0], keys),
    maxSpan: readIntegerParam(params, "span", DEFAULT_MAX_SPAN, {
      min: 2,
      max: 8,
    }),
    selected: readIntegerParam(params, "voicing", 0, { min: 0 }),
    showAll: readBooleanParam(params, "showAll", false),
    showComplement: readBooleanParam(params, "complement", false),
    excludeOpenStrings: readBooleanParam(params, "excludeOpen", false),
    analysisMode: readEnumParam(params, "analysis", ANALYSIS_MODES, "voicings"),
    subsetTargetCardinality: readIntegerParam(
      params,
      "subset",
      noteCount > 3 ? noteCount - 1 : 3,
      { min: 3, max: Math.max(3, noteCount - 1) }
    ),
    supersetTargetCardinality: readIntegerParam(
      params,
      "superset",
      noteCount < 12 ? noteCount + 1 : 12,
      { min: Math.min(noteCount + 1, 12), max: 12 }
    ),
    groupFilter: readStringParam(params, "group", "all"),
    displayMode: readEnumParam(params, "view", DISPLAY_MODES, "notes"),
    bassFilter: readBassFilter(params, "bass", noteCount),
    transformMode: readEnumParam(params, "transform", TRANSFORM_MODES, "base"),
    transformAmount: readIntegerParam(params, "amount", 0, {
      min: 0,
      max: 11,
    }),
    selectedAnalysisClassKey: readStringParam(params, "aclass", null),
    selectedAnalysisMemberIndex: readIntegerParam(params, "amember", 0, {
      min: 0,
    }),
    selectedAnalysisVoicingIndex: readIntegerParam(params, "avoicing", 0, {
      min: 0,
    }),
    analysisShowAllVoicings: readBooleanParam(params, "aShowAll", false),
    analysisBassFilter: readBassFilter(params, "abass", noteCount),
  };
}

function getVoicingFinderByCardinality(cardinality) {
  if (cardinality === 3) return findVoicings;
  if (cardinality === 4) return findTetrachordVoicings;
  if (cardinality === 5) return findPentachordVoicings;
  if (cardinality === 6) return findHexachordVoicings;
  return null;
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
  const initialUrlState = buildInitialUrlState(keys, noteCount);

  const [selectedForte, setSelectedForte] = useState(initialUrlState.selectedForte);
  const [maxSpan, setMaxSpan] = useState(initialUrlState.maxSpan);
  const [selected, setSelected] = useState(initialUrlState.selected);
  const [showAll, setShowAll] = useState(initialUrlState.showAll);
  const [showComplement, setShowComplement] = useState(
    initialUrlState.showComplement
  );
  const [excludeOpenStrings, setExcludeOpenStrings] = useState(
    initialUrlState.excludeOpenStrings
  );
  const [analysisMode, setAnalysisMode] = useState(initialUrlState.analysisMode);

  const [subsetTargetCardinality, setSubsetTargetCardinality] = useState(
    initialUrlState.subsetTargetCardinality
  );
  const [supersetTargetCardinality, setSupersetTargetCardinality] = useState(
    initialUrlState.supersetTargetCardinality
  );

  const [groupFilter, setGroupFilter] = useState(initialUrlState.groupFilter);
  const [displayMode, setDisplayMode] = useState(initialUrlState.displayMode);
  const [bassFilter, setBassFilter] = useState(initialUrlState.bassFilter);
  const [transformMode, setTransformMode] = useState(
    initialUrlState.transformMode
  );
  const [transformAmount, setTransformAmount] = useState(
    initialUrlState.transformAmount
  );

  const [selectedAnalysisClassKey, setSelectedAnalysisClassKey] = useState(
    initialUrlState.selectedAnalysisClassKey
  );
  const [selectedAnalysisMemberIndex, setSelectedAnalysisMemberIndex] =
    useState(initialUrlState.selectedAnalysisMemberIndex);
  const [selectedAnalysisVoicingIndex, setSelectedAnalysisVoicingIndex] =
    useState(initialUrlState.selectedAnalysisVoicingIndex);
  const [analysisShowAllVoicings, setAnalysisShowAllVoicings] = useState(
    initialUrlState.analysisShowAllVoicings
  );
  const [analysisBassFilter, setAnalysisBassFilter] = useState(
    initialUrlState.analysisBassFilter
  );

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
    if (analysisMode === "voicings" || !analysisClasses.length) return null;
    return (
      analysisClasses.find(
        (item) => getClassKey(item) === selectedAnalysisClassKey
      ) || analysisClasses[0]
    );
  }, [analysisMode, analysisClasses, selectedAnalysisClassKey]);

  const analysisMembers = useMemo(
    () => selectedAnalysisClass?.members || [],
    [selectedAnalysisClass]
  );

  const activeSelectedAnalysisMemberIndex = useMemo(() => {
    if (!analysisMembers.length) return 0;
    return Math.min(selectedAnalysisMemberIndex, analysisMembers.length - 1);
  }, [analysisMembers, selectedAnalysisMemberIndex]);

  const selectedAnalysisMember =
    analysisMembers[activeSelectedAnalysisMemberIndex] || null;

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

  const activeSelectedAnalysisVoicingIndex = useMemo(() => {
    if (!analysisFilteredVoicings.length) return 0;
    return Math.min(
      selectedAnalysisVoicingIndex,
      analysisFilteredVoicings.length - 1
    );
  }, [analysisFilteredVoicings, selectedAnalysisVoicingIndex]);

  const selectedAnalysisVoicing =
    analysisFilteredVoicings[activeSelectedAnalysisVoicingIndex] || null;

  const activeSelectedVoicingIndex = useMemo(() => {
    if (!filteredVoicings.length) return 0;
    return Math.min(selected, filteredVoicings.length - 1);
  }, [filteredVoicings, selected]);

  const selectedVoicing = filteredVoicings[activeSelectedVoicingIndex] || null;

  const availableGroupPatterns = useMemo(() => {
    const set = new Set(rawVoicings.map((v) => v.stringPattern));
    return [...set].sort();
  }, [rawVoicings]);

  const resetPrimaryVoicingSelection = ({ hideAll = true } = {}) => {
    setSelected(0);
    if (hideAll) {
      setShowAll(false);
    }
  };

  const resetAnalysisVoicingSelection = ({ hideAll = true } = {}) => {
    setSelectedAnalysisVoicingIndex(0);
    if (hideAll) {
      setAnalysisShowAllVoicings(false);
    }
  };

  const resetAnalysisClassSelection = ({
    clearClass = false,
    resetBass = true,
    hideAll = true,
  } = {}) => {
    if (clearClass) {
      setSelectedAnalysisClassKey(null);
    }
    setSelectedAnalysisMemberIndex(0);
    if (resetBass) {
      setAnalysisBassFilter("all");
    }
    resetAnalysisVoicingSelection({ hideAll });
  };

  const handleTransformModeChange = (mode) => {
    setTransformMode(mode);
    resetPrimaryVoicingSelection();
    resetAnalysisClassSelection();
  };

  const handleTransformAmountChange = (amount) => {
    setTransformAmount(amount);
    resetPrimaryVoicingSelection();
    resetAnalysisClassSelection();
  };

  const handleSelectedForteChange = (forte) => {
    setSelectedForte(forte);
    resetPrimaryVoicingSelection();
    setShowComplement(false);
    resetAnalysisClassSelection({ clearClass: true });
  };

  const handleMaxSpanChange = (span) => {
    setMaxSpan(span);
    setSelected(0);
    setSelectedAnalysisVoicingIndex(0);
  };

  const handleAnalysisModeChange = (mode) => {
    setAnalysisMode(mode);
    resetAnalysisClassSelection({ clearClass: true });
  };

  const handleSubsetTargetCardinalityChange = (cardinality) => {
    setSubsetTargetCardinality(cardinality);
    resetAnalysisClassSelection({ clearClass: true });
  };

  const handleSupersetTargetCardinalityChange = (cardinality) => {
    setSupersetTargetCardinality(cardinality);
    resetAnalysisClassSelection({ clearClass: true });
  };

  const handleGroupFilterChange = (pattern) => {
    setGroupFilter(pattern);
    setSelected(0);
  };

  const handleExcludeOpenStringsChange = (checked) => {
    setExcludeOpenStrings(checked);
    setSelected(0);
    setSelectedAnalysisVoicingIndex(0);
  };

  const handleSelectVoicing = (index) => {
    setSelected(index);
    if (showAll) {
      setShowAll(false);
    }
  };

  const handleSelectAnalysisClass = (classKey) => {
    setSelectedAnalysisClassKey(classKey);
    setSelectedAnalysisMemberIndex(0);
    setAnalysisBassFilter("all");
    resetAnalysisVoicingSelection();
  };

  const handleAnalysisMemberIndexChange = (index) => {
    setSelectedAnalysisMemberIndex(index);
    resetAnalysisVoicingSelection();
  };

  const handleAnalysisBassFilterChange = (value) => {
    setAnalysisBassFilter(value);
    setSelectedAnalysisVoicingIndex(0);
  };

  const handleSelectAnalysisVoicing = (index) => {
    setSelectedAnalysisVoicingIndex(index);
    if (analysisShowAllVoicings) {
      setAnalysisShowAllVoicings(false);
    }
  };

  const canRenderAnalysisVoicings =
    !!selectedAnalysisMember &&
    selectedAnalysisMember.length >= 3 &&
    selectedAnalysisMember.length <= 6 &&
    !!analysisVoicingFinder;

  useEffect(() => {
    replaceSearchParams((params) => {
      setSearchParam(params, "forte", selectedForte);
      setSearchParam(params, "span", maxSpan);
      setSearchParam(params, "analysis", analysisMode);

      setBooleanSearchParam(params, "showAll", showAll);
      setBooleanSearchParam(params, "complement", showComplement);
      setBooleanSearchParam(params, "excludeOpen", excludeOpenStrings);

      setSearchParam(params, "subset", subsetTargetCardinality);
      setSearchParam(params, "superset", supersetTargetCardinality);
      setSearchParam(
        params,
        "group",
        groupFilter === "all" ? null : groupFilter
      );
      setSearchParam(
        params,
        "view",
        displayMode === "notes" ? null : displayMode
      );
      setSearchParam(params, "bass", bassFilter === "all" ? null : bassFilter);

      setSearchParam(
        params,
        "transform",
        transformMode === "base" ? null : transformMode
      );
      setSearchParam(
        params,
        "amount",
        transformMode === "base" ? null : transformAmount
      );
      setSearchParam(params, "voicing", activeSelectedVoicingIndex || null);

      if (analysisMode === "voicings") {
        params.delete("aclass");
        params.delete("amember");
        params.delete("abass");
        params.delete("aShowAll");
        params.delete("avoicing");
        return;
      }

      setSearchParam(
        params,
        "aclass",
        selectedAnalysisClass ? getClassKey(selectedAnalysisClass) : null
      );
      setSearchParam(
        params,
        "amember",
        activeSelectedAnalysisMemberIndex || null
      );
      setSearchParam(
        params,
        "abass",
        analysisBassFilter === "all" ? null : analysisBassFilter
      );
      setBooleanSearchParam(params, "aShowAll", analysisShowAllVoicings);
      setSearchParam(
        params,
        "avoicing",
        activeSelectedAnalysisVoicingIndex || null
      );
    });
  }, [
    selectedForte,
    maxSpan,
    analysisMode,
    showAll,
    showComplement,
    excludeOpenStrings,
    subsetTargetCardinality,
    supersetTargetCardinality,
    groupFilter,
    displayMode,
    bassFilter,
    transformMode,
    transformAmount,
    activeSelectedVoicingIndex,
    selectedAnalysisClass,
    activeSelectedAnalysisMemberIndex,
    analysisBassFilter,
    analysisShowAllVoicings,
    activeSelectedAnalysisVoicingIndex,
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
        <GenericSetControlsPanel
          title={title}
          description={description}
          keyLabel={keyLabel}
          sortedKeys={sortedKeys}
          dataMap={dataMap}
          selectedForte={selectedForte}
          onSelectedForteChange={handleSelectedForteChange}
          maxSpan={maxSpan}
          onMaxSpanChange={handleMaxSpanChange}
          showComplement={showComplement}
          noteName={noteName}
          onShowComplementChange={setShowComplement}
          analysisMode={analysisMode}
          onAnalysisModeChange={handleAnalysisModeChange}
          subsetCardinalityOptions={subsetCardinalityOptions}
          subsetTargetCardinality={subsetTargetCardinality}
          onSubsetTargetCardinalityChange={handleSubsetTargetCardinalityChange}
          supersetCardinalityOptions={supersetCardinalityOptions}
          supersetTargetCardinality={supersetTargetCardinality}
          onSupersetTargetCardinalityChange={handleSupersetTargetCardinalityChange}
          groupFilter={groupFilter}
          availableGroupPatterns={availableGroupPatterns}
          onGroupFilterChange={handleGroupFilterChange}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          degreeButtonLabel={degreeButtonLabel}
          noteCount={noteCount}
          bassFilter={bassFilter}
          onBassFilterChange={setBassFilter}
          transformMode={transformMode}
          transformAmount={transformAmount}
          onTransformModeChange={handleTransformModeChange}
          onTransformAmountChange={handleTransformAmountChange}
          showAll={showAll}
          onShowAllChange={setShowAll}
          excludeOpenStrings={excludeOpenStrings}
          onExcludeOpenStringsChange={handleExcludeOpenStringsChange}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
          }}
        >
          <GenericSetFretboardPanel
            showComplement={showComplement}
            analysisMode={analysisMode}
            noteName={noteName}
            activeSet={activeSet}
            selectedVoicing={selectedVoicing}
            filteredVoicings={filteredVoicings}
            showAll={showAll}
            displayMode={displayMode}
            selectedAnalysisClass={selectedAnalysisClass}
            selectedAnalysisMember={selectedAnalysisMember}
            canRenderAnalysisVoicings={canRenderAnalysisVoicings}
            selectedAnalysisVoicing={selectedAnalysisVoicing}
            analysisFilteredVoicings={analysisFilteredVoicings}
            analysisShowAllVoicings={analysisShowAllVoicings}
            analysisDegreeMap={analysisDegreeMap}
            complementData={complementData}
          />

          <GenericSetResultsPanel
            showComplement={showComplement}
            analysisMode={analysisMode}
            filteredVoicings={filteredVoicings}
            noteName={noteName}
            selectedForte={selectedForte}
            activeSelectedVoicingIndex={activeSelectedVoicingIndex}
            onSelectVoicing={handleSelectVoicing}
            displayMode={displayMode}
            activeSet={activeSet}
            analysisClasses={analysisClasses}
            subsetTargetCardinality={subsetTargetCardinality}
            supersetTargetCardinality={supersetTargetCardinality}
            selectedAnalysisClass={selectedAnalysisClass}
            onSelectAnalysisClass={handleSelectAnalysisClass}
            analysisMembers={analysisMembers}
            activeSelectedAnalysisMemberIndex={activeSelectedAnalysisMemberIndex}
            onAnalysisMemberIndexChange={handleAnalysisMemberIndexChange}
            canRenderAnalysisVoicings={canRenderAnalysisVoicings}
            selectedAnalysisMember={selectedAnalysisMember}
            analysisBassFilter={analysisBassFilter}
            onAnalysisBassFilterChange={handleAnalysisBassFilterChange}
            analysisShowAllVoicings={analysisShowAllVoicings}
            onAnalysisShowAllVoicingsChange={setAnalysisShowAllVoicings}
            analysisFilteredVoicings={analysisFilteredVoicings}
            activeSelectedAnalysisVoicingIndex={
              activeSelectedAnalysisVoicingIndex
            }
            onSelectAnalysisVoicing={handleSelectAnalysisVoicing}
            analysisDegreeMap={analysisDegreeMap}
            complementName={complementName}
            complementData={complementData}
          />
        </div>
      </div>
    </div>
  );
}
