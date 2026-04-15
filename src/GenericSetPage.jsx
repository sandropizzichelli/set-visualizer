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
  buildPrimaryFormVoicings,
  buildPrimaryFormVoicing,
  groupVoicingsByStructure,
} from "./setUtils";
import GenericSetControlsPanel from "./GenericSetControlsPanel";
import GenericSetFretboardPanel from "./GenericSetFretboardPanel";
import GenericSetResultsPanel from "./GenericSetResultsPanel";
import {
  buildOccurrenceSummary,
  buildIntervalClassBreakdown,
  buildIntervalClassPitchClassMap,
  buildIntervalLegend,
  buildIntervalMapFromOrderedPcs,
  formatDegreeList,
  formatIntervalVector,
  formatPitchClassList,
  getClassKey,
} from "./genericSetPageHelpers";
import {
  getCurrentSearchParams,
  replaceSearchParams,
  setBooleanSearchParam,
  setSearchParam,
} from "./urlState";
import {
  buildIntervalVectorOptions,
  buildUrlStateFromParams,
  getAvailableVoicingLayoutFilters,
} from "./genericSetPageState";
import {
  buildForteSelectionState,
  buildIntervalVectorSelectionState,
  getDisplayModeAfterBrowseModeChange,
} from "./genericSetPageTransitions";

const ANALYSIS_MODES = ["subsets", "supersets"];
const DISPLAY_MODES = ["notes", "degrees", "intervals"];
const TRANSFORM_MODES = ["base", "tn", "tni"];
const DEFAULT_DISPLAY_MODE = "degrees";
const DEFAULT_FRETBOARD_VIEW_MODE = "prime";

function buildFilteredPitchClasses(intervalClassPitchClassMap, selectedIntervalClasses) {
  if (!selectedIntervalClasses.length) return null;

  const filtered = new Set();
  selectedIntervalClasses.forEach((intervalClass) => {
    intervalClassPitchClassMap?.get(intervalClass)?.forEach((pc) => filtered.add(pc));
  });

  return [...filtered];
}

function buildInitialUrlState(keys, dataMap, noteCount) {
  return buildUrlStateFromParams(getCurrentSearchParams(), keys, dataMap, noteCount);
}

function getVoicingFinderByCardinality(cardinality) {
  if (cardinality === 3) return findVoicings;
  if (cardinality === 4) return findTetrachordVoicings;
  if (cardinality === 5) return findPentachordVoicings;
  if (cardinality === 6) return findHexachordVoicings;
  return null;
}

function getDisplayModeLabel(displayMode) {
  if (displayMode === "notes") return "Note";
  if (displayMode === "degrees") return "Gradi";
  return "Intervalli";
}

export default function GenericSetPage({
  keyLabel,
  keys,
  dataMap,
  findVoicingFn,
  noteName,
  complementName,
  degreeButtonLabel,
  noteCount,
}) {
  const initialUrlState = buildInitialUrlState(keys, dataMap, noteCount);

  const [browseMode, setBrowseMode] = useState(initialUrlState.browseMode);
  const [selectedForte, setSelectedForte] = useState(initialUrlState.selectedForte);
  const [selectedIntervalVector, setSelectedIntervalVector] = useState(
    initialUrlState.selectedIntervalVector
  );
  const [selected, setSelected] = useState(initialUrlState.selected);
  const [maxSpan, setMaxSpan] = useState(initialUrlState.maxSpan);
  const [fretboardViewMode, setFretboardViewMode] = useState(
    initialUrlState.fretboardViewMode
  );
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
  const [voicingLayoutFilter, setVoicingLayoutFilter] = useState(
    initialUrlState.voicingLayoutFilter
  );
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
  const [selectedIntervalClasses, setSelectedIntervalClasses] = useState(
    initialUrlState.selectedIntervalClasses
  );

  const availableVoicingLayoutFilters = useMemo(
    () => getAvailableVoicingLayoutFilters(noteCount),
    [noteCount]
  );

  const activeVoicingLayoutFilter = useMemo(
    () =>
      availableVoicingLayoutFilters.includes(voicingLayoutFilter)
        ? voicingLayoutFilter
        : "all",
    [availableVoicingLayoutFilters, voicingLayoutFilter]
  );

  const sortedKeys = useMemo(() => {
    return [...keys].sort((a, b) => {
      const parseKey = (key) => {
        const [cardinality, rest] = key.split("-");
        const isZ = rest.startsWith("Z");
        const number = Number.parseInt(rest.replace("Z", ""), 10);
        return {
          cardinality: Number.parseInt(cardinality, 10),
          isZ,
          number,
        };
      };

      const first = parseKey(a);
      const second = parseKey(b);

      if (first.cardinality !== second.cardinality) {
        return first.cardinality - second.cardinality;
      }

      if (first.number !== second.number) {
        return first.number - second.number;
      }

      if (first.isZ !== second.isZ) {
        return first.isZ ? 1 : -1;
      }

      return a.localeCompare(b);
    });
  }, [keys]);

  const intervalVectorOptions = useMemo(
    () => buildIntervalVectorOptions(sortedKeys, dataMap),
    [sortedKeys, dataMap]
  );

  const intervalVectorMap = useMemo(() => {
    const map = new Map();

    sortedKeys.forEach((key) => {
      const intervalVector = dataMap[key]?.iv;
      if (!intervalVector) return;

      if (!map.has(intervalVector)) {
        map.set(intervalVector, []);
      }

      map.get(intervalVector).push(key);
    });

    return map;
  }, [sortedKeys, dataMap]);

  const intervalVectorMatches = useMemo(
    () => intervalVectorMap.get(selectedIntervalVector) || [],
    [intervalVectorMap, selectedIntervalVector]
  );

  const intervalVectorFamilyClasses = useMemo(
    () =>
      intervalVectorMatches.map((key) => ({
        forteName: key,
        primeForm: parsePfString(dataMap[key].pf),
        iv: dataMap[key].iv,
        cardinality: noteCount,
      })),
    [intervalVectorMatches, dataMap, noteCount]
  );

  const activeSelectedForte = useMemo(() => {
    if (browseMode === "iv") {
      if (intervalVectorMatches.includes(selectedForte)) {
        return selectedForte;
      }

      return intervalVectorMatches[0] || selectedForte || sortedKeys[0];
    }

    return selectedForte;
  }, [browseMode, intervalVectorMatches, selectedForte, sortedKeys]);

  const subsetCardinalityOptions = useMemo(() => {
    const options = [];
    for (let cardinality = 3; cardinality <= noteCount - 1; cardinality += 1) {
      options.push(cardinality);
    }
    return options;
  }, [noteCount]);

  const supersetCardinalityOptions = useMemo(() => {
    const options = [];
    for (let cardinality = noteCount + 1; cardinality <= 12; cardinality += 1) {
      options.push(cardinality);
    }
    return options;
  }, [noteCount]);

  const setDataRaw = dataMap[activeSelectedForte] || null;

  const activeSet = useMemo(() => {
    if (!setDataRaw) return null;

    const basePcs = parsePfString(setDataRaw.pf);
    const transformedPcs = transformPcs(basePcs, transformMode, transformAmount);
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
    const intervalMap = buildIntervalMapFromOrderedPcs(transformedPrimeForm);
    const intervalLegend = buildIntervalLegend(transformedPrimeForm);
    const intervalClassPitchClassMap =
      buildIntervalClassPitchClassMap(transformedPrimeForm);
    const orderMap = new Map();
    transformedPrimeForm.forEach((pc, index) => {
      orderMap.set(pc, index);
    });

    return {
      basePcs,
      pcs: transformedPcs,
      primeForm: basePcs,
      transformedPrimeForm,
      degreeMap,
      orderMap,
      intervalMap,
      intervalLegend,
      intervalClassBreakdown: buildIntervalClassBreakdown(setDataRaw.iv),
      intervalClassPitchClassMap,
      forteName: activeSelectedForte,
      pf: setDataRaw.pf,
      iv: setDataRaw.iv,
      transformLabel: getTransformLabel(transformMode, transformAmount),
    };
  }, [setDataRaw, activeSelectedForte, transformMode, transformAmount]);

  const complementData = useMemo(() => {
    if (!activeSet) return null;
    return complementFromPcs(activeSet.pcs);
  }, [activeSet]);

  const rawVoicings = useMemo(() => {
    if (!activeSet || showComplement) return [];
    return findVoicingFn(activeSet.pcs, maxSpan).map((voicing) => ({
      ...voicing,
      primeForm: activeSet.primeForm,
      forteName: activeSet.forteName,
    }));
  }, [activeSet, showComplement, findVoicingFn, maxSpan]);

  const layoutFilteredVoicingOccurrences = useMemo(() => {
    let list = [...rawVoicings];

    if (excludeOpenStrings) {
      list = list.filter((voicing) => voicing.positions.every((position) => position.fret > 0));
    }

    if (activeVoicingLayoutFilter === "close") {
      list = list.filter((voicing) => !voicing.hasSkip);
    }

    if (activeVoicingLayoutFilter === "spread") {
      list = list.filter((voicing) => voicing.hasSkip);
    }

    return list;
  }, [rawVoicings, excludeOpenStrings, activeVoicingLayoutFilter]);

  const availableGroupPatterns = useMemo(() => {
    const patterns = new Set(
      layoutFilteredVoicingOccurrences.map((voicing) => voicing.stringPattern)
    );
    return [...patterns].sort();
  }, [layoutFilteredVoicingOccurrences]);

  const activeGroupFilter = useMemo(() => {
    if (groupFilter === "all") return "all";
    return availableGroupPatterns.includes(groupFilter) ? groupFilter : "all";
  }, [groupFilter, availableGroupPatterns]);

  const bassOptions = useMemo(
    () => [...new Set(activeSet?.transformedPrimeForm || [])],
    [activeSet]
  );

  const activeBassFilter = useMemo(() => {
    if (bassFilter === "all") return "all";
    return bassOptions.includes(bassFilter) ? bassFilter : "all";
  }, [bassFilter, bassOptions]);

  const filteredVoicingOccurrences = useMemo(() => {
    let list = [...layoutFilteredVoicingOccurrences];

    if (activeGroupFilter !== "all") {
      list = list.filter((voicing) => voicing.stringPattern === activeGroupFilter);
    }

    list = filterByBassDegree(list, activeBassFilter, activeSet?.degreeMap);

    return list;
  }, [
    layoutFilteredVoicingOccurrences,
    activeGroupFilter,
    activeBassFilter,
    activeSet,
  ]);

  const filteredVoicings = useMemo(
    () => groupVoicingsByStructure(filteredVoicingOccurrences),
    [filteredVoicingOccurrences]
  );

  const primaryFormVoicing = useMemo(
    () => buildPrimaryFormVoicing(activeSet?.primeForm || []),
    [activeSet]
  );

  const primaryFormVoicings = useMemo(
    () => groupVoicingsByStructure(buildPrimaryFormVoicings(activeSet?.primeForm || [])),
    [activeSet]
  );

  const primaryFormDegreeMap = useMemo(() => {
    if (!activeSet?.primeForm?.length) return null;

    const map = new Map();
    activeSet.primeForm.forEach((pc) => {
      map.set(pc, pc);
    });
    return map;
  }, [activeSet]);

  const primaryFormIntervalMap = useMemo(
    () => buildIntervalMapFromOrderedPcs(activeSet?.primeForm || []),
    [activeSet]
  );

  const primaryFormIntervalLegend = useMemo(
    () => buildIntervalLegend(activeSet?.primeForm || []),
    [activeSet]
  );

  const primaryFormIntervalClassPitchClassMap = useMemo(
    () => buildIntervalClassPitchClassMap(activeSet?.primeForm || []),
    [activeSet]
  );

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
    if (!analysisMode || !analysisClasses.length) return null;
    return (
      analysisClasses.find((item) => getClassKey(item) === selectedAnalysisClassKey) ||
      analysisClasses[0]
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
    selectedAnalysisMember.forEach((pc) => {
      map.set(pc, pc);
    });

    return map;
  }, [selectedAnalysisMember]);

  const analysisBassOptions = useMemo(
    () => [...new Set(selectedAnalysisMember || [])],
    [selectedAnalysisMember]
  );

  const activeAnalysisBassFilter = useMemo(() => {
    if (analysisBassFilter === "all") return "all";
    return analysisBassOptions.includes(analysisBassFilter) ? analysisBassFilter : "all";
  }, [analysisBassFilter, analysisBassOptions]);

  const analysisIntervalMap = useMemo(
    () => buildIntervalMapFromOrderedPcs(selectedAnalysisMember || []),
    [selectedAnalysisMember]
  );

  const analysisIntervalLegend = useMemo(
    () => buildIntervalLegend(selectedAnalysisMember || []),
    [selectedAnalysisMember]
  );

  const analysisIntervalClassBreakdown = useMemo(() => {
    if (!selectedAnalysisClass?.iv) return [];
    return buildIntervalClassBreakdown(selectedAnalysisClass.iv);
  }, [selectedAnalysisClass]);

  const analysisIntervalClassPitchClassMap = useMemo(
    () => buildIntervalClassPitchClassMap(selectedAnalysisMember || []),
    [selectedAnalysisMember]
  );

  const activeSelectedIntervalClasses = useMemo(() => {
    const availableIntervalClasses =
      !analysisMode
        ? activeSet?.intervalClassBreakdown || []
        : analysisIntervalClassBreakdown;

    const allowed = new Set(
      availableIntervalClasses
        .filter((item) => item.count > 0)
        .map((item) => item.ic)
    );

    return selectedIntervalClasses.filter((intervalClass) => allowed.has(intervalClass));
  }, [analysisMode, activeSet, analysisIntervalClassBreakdown, selectedIntervalClasses]);

  const filteredPrimaryTargetPcs = useMemo(
    () =>
      buildFilteredPitchClasses(
        activeSet?.intervalClassPitchClassMap,
        activeSelectedIntervalClasses
      ) || activeSet?.pcs || [],
    [activeSet, activeSelectedIntervalClasses]
  );

  const filteredPrimaryFormTargetPcs = useMemo(
    () =>
      buildFilteredPitchClasses(
        primaryFormIntervalClassPitchClassMap,
        activeSelectedIntervalClasses
      ) || activeSet?.primeForm || [],
    [primaryFormIntervalClassPitchClassMap, activeSelectedIntervalClasses, activeSet]
  );

  const filteredAnalysisTargetPcs = useMemo(
    () =>
      buildFilteredPitchClasses(
        analysisIntervalClassPitchClassMap,
        activeSelectedIntervalClasses
      ) || selectedAnalysisMember || [],
    [
      analysisIntervalClassPitchClassMap,
      selectedAnalysisMember,
      activeSelectedIntervalClasses,
    ]
  );

  const analysisVoicingFinder = useMemo(() => {
    if (!selectedAnalysisMember) return null;
    return getVoicingFinderByCardinality(selectedAnalysisMember.length);
  }, [selectedAnalysisMember]);

  const analysisRawVoicings = useMemo(() => {
    if (!selectedAnalysisMember || !analysisVoicingFinder) return [];

    return analysisVoicingFinder(selectedAnalysisMember, maxSpan).map((voicing) => ({
      ...voicing,
      primeForm: selectedAnalysisMemberPrimeForm,
      forteName: selectedAnalysisClass?.forteName || null,
    }));
  }, [
    selectedAnalysisMember,
    analysisVoicingFinder,
    selectedAnalysisMemberPrimeForm,
    selectedAnalysisClass,
    maxSpan,
  ]);

  const analysisFilteredVoicingOccurrences = useMemo(() => {
    let list = [...analysisRawVoicings];

    if (excludeOpenStrings) {
      list = list.filter((voicing) => voicing.positions.every((position) => position.fret > 0));
    }

    list = filterByBassDegree(list, activeAnalysisBassFilter, analysisDegreeMap);

    return list;
  }, [
    analysisRawVoicings,
    excludeOpenStrings,
    activeAnalysisBassFilter,
    analysisDegreeMap,
  ]);

  const analysisFilteredVoicings = useMemo(
    () => groupVoicingsByStructure(analysisFilteredVoicingOccurrences),
    [analysisFilteredVoicingOccurrences]
  );

  const analysisPrimaryFormVoicing = useMemo(
    () => buildPrimaryFormVoicing(selectedAnalysisClass?.primeForm || []),
    [selectedAnalysisClass]
  );

  const analysisPrimaryFormVoicings = useMemo(
    () =>
      groupVoicingsByStructure(
        buildPrimaryFormVoicings(selectedAnalysisClass?.primeForm || [])
      ),
    [selectedAnalysisClass]
  );

  const canRenderAnalysisPrimaryForm =
    Boolean(selectedAnalysisClass?.primeForm?.length) &&
    Boolean(analysisPrimaryFormVoicing);

  const analysisPrimaryFormDegreeMap = useMemo(() => {
    if (!selectedAnalysisClass?.primeForm?.length) return null;

    const map = new Map();
    selectedAnalysisClass.primeForm.forEach((pc) => {
      map.set(pc, pc);
    });
    return map;
  }, [selectedAnalysisClass]);

  const analysisPrimaryFormIntervalMap = useMemo(
    () => buildIntervalMapFromOrderedPcs(selectedAnalysisClass?.primeForm || []),
    [selectedAnalysisClass]
  );

  const analysisPrimaryFormIntervalLegend = useMemo(
    () => buildIntervalLegend(selectedAnalysisClass?.primeForm || []),
    [selectedAnalysisClass]
  );

  const analysisPrimaryFormIntervalClassPitchClassMap = useMemo(
    () => buildIntervalClassPitchClassMap(selectedAnalysisClass?.primeForm || []),
    [selectedAnalysisClass]
  );

  const filteredAnalysisPrimaryFormTargetPcs = useMemo(
    () =>
      buildFilteredPitchClasses(
        analysisPrimaryFormIntervalClassPitchClassMap,
        activeSelectedIntervalClasses
      ) || selectedAnalysisClass?.primeForm || [],
    [
      analysisPrimaryFormIntervalClassPitchClassMap,
      selectedAnalysisClass,
      activeSelectedIntervalClasses,
    ]
  );

  const activeSelectedAnalysisVoicingIndex = useMemo(() => {
    if (!analysisFilteredVoicings.length) return 0;
    return Math.min(
      selectedAnalysisVoicingIndex,
      analysisFilteredVoicings.length - 1
    );
  }, [analysisFilteredVoicings, selectedAnalysisVoicingIndex]);

  const selectedAnalysisVoicing =
    analysisFilteredVoicings[activeSelectedAnalysisVoicingIndex] || null;

  const analysisOccurrenceSummary = useMemo(
    () =>
      !analysisMode
        ? null
        : buildOccurrenceSummary(
            analysisMode,
            activeSet,
            selectedAnalysisClass,
            selectedAnalysisMember
          ),
    [
      analysisMode,
      activeSet,
      selectedAnalysisClass,
      selectedAnalysisMember,
    ]
  );

  const selectedOccurrenceSummary = useMemo(
    () => (fretboardViewMode === "prime" ? null : analysisOccurrenceSummary),
    [fretboardViewMode, analysisOccurrenceSummary]
  );

  const analysisPcRoleMap = useMemo(() => {
    const map = new Map();

    selectedOccurrenceSummary?.retainedPcs.forEach((pc) => {
      map.set(pc, "core");
    });

    selectedOccurrenceSummary?.addedPcs.forEach((pc) => {
      map.set(pc, "added");
    });

    selectedOccurrenceSummary?.missingPcs.forEach((pc) => {
      if (!map.has(pc)) {
        map.set(pc, "missing");
      }
    });

    return map;
  }, [selectedOccurrenceSummary]);

  const activeSelectedVoicingIndex = useMemo(() => {
    if (!filteredVoicings.length) return 0;
    return Math.min(selected, filteredVoicings.length - 1);
  }, [filteredVoicings, selected]);

  const selectedVoicing = filteredVoicings[activeSelectedVoicingIndex] || null;

  const closeVoicingCount = useMemo(
    () =>
      rawVoicings.filter(
        (voicing) =>
          !voicing.hasSkip &&
          (!excludeOpenStrings ||
            voicing.positions.every((position) => position.fret > 0))
      ).length,
    [rawVoicings, excludeOpenStrings]
  );

  const spreadVoicingCount = useMemo(
    () =>
      rawVoicings.filter(
        (voicing) =>
          voicing.hasSkip &&
          (!excludeOpenStrings ||
            voicing.positions.every((position) => position.fret > 0))
      ).length,
    [rawVoicings, excludeOpenStrings]
  );

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
    setBassFilter("all");
    resetPrimaryVoicingSelection();
    resetAnalysisClassSelection();
  };

  const handleTransformAmountChange = (amount) => {
    setTransformAmount(amount);
    setBassFilter("all");
    resetPrimaryVoicingSelection();
    resetAnalysisClassSelection();
  };

  const handleMaxSpanChange = (value) => {
    setMaxSpan(value);
    resetPrimaryVoicingSelection();
    resetAnalysisVoicingSelection();
  };

  const handleFretboardViewModeChange = (mode) => {
    setFretboardViewMode(mode);
    if (mode === "prime") {
      setShowAll(false);
      setAnalysisShowAllVoicings(false);
    }
  };

  const applySetPresentationPatch = (patch) => {
    setFretboardViewMode(patch.fretboardViewMode);
    setDisplayMode(patch.displayMode);
    setAnalysisMode(patch.analysisMode);
    setSelectedIntervalClasses(patch.selectedIntervalClasses);
    setShowComplement(patch.showComplement);
    setShowAll(patch.showAll);
    setAnalysisShowAllVoicings(patch.analysisShowAllVoicings);
    setSelected(patch.selected);
    setSelectedAnalysisClassKey(patch.selectedAnalysisClassKey);
    setSelectedAnalysisMemberIndex(patch.selectedAnalysisMemberIndex);
    setSelectedAnalysisVoicingIndex(patch.selectedAnalysisVoicingIndex);
    setBassFilter(patch.bassFilter);
    setAnalysisBassFilter(patch.analysisBassFilter);
  };

  const handleBrowseModeChange = (mode) => {
    setBrowseMode(mode);

    const nextDisplayMode = getDisplayModeAfterBrowseModeChange(mode, displayMode);
    if (nextDisplayMode !== displayMode) {
      setDisplayMode(nextDisplayMode);
    }

    if (mode === "iv") {
      const nextIntervalVector =
        dataMap[activeSelectedForte]?.iv || selectedIntervalVector;
      const matchingKeys = intervalVectorMap.get(nextIntervalVector) || [];

      setSelectedIntervalVector(nextIntervalVector);

      if (matchingKeys.length) {
        setSelectedForte(matchingKeys[0]);
      }
    }

    resetPrimaryVoicingSelection();
    resetAnalysisClassSelection({ clearClass: true });
  };

  const handleSelectedForteChange = (forte) => {
    const nextState = buildForteSelectionState(forte, dataMap);
    applySetPresentationPatch(nextState);
    setSelectedForte(nextState.selectedForte);
    if (nextState.selectedIntervalVector) {
      setSelectedIntervalVector(nextState.selectedIntervalVector);
    }
  };

  const handleSelectedIntervalVectorChange = (intervalVector) => {
    const nextState = buildIntervalVectorSelectionState(
      intervalVector,
      intervalVectorMap
    );

    applySetPresentationPatch(nextState);
    setSelectedIntervalVector(nextState.selectedIntervalVector);

    if (nextState.selectedForte) {
      setSelectedForte(nextState.selectedForte);
    }
  };

  const handleToggleIntervalClass = (intervalClass) => {
    setSelectedIntervalClasses((current) =>
      current.includes(intervalClass)
        ? current.filter((item) => item !== intervalClass)
        : [...current, intervalClass].sort((first, second) => first - second)
    );
  };

  const handleClearIntervalClassFilter = () => {
    setSelectedIntervalClasses([]);
  };

  const handleAnalysisModeChange = (mode) => {
    setAnalysisMode((current) => (current === mode ? null : mode));
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

  const handleVoicingLayoutFilterChange = (value) => {
    setVoicingLayoutFilter(value);
    setGroupFilter("all");
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
    Boolean(selectedAnalysisMember) &&
    selectedAnalysisMember.length >= 3 &&
    selectedAnalysisMember.length <= 6 &&
    Boolean(analysisVoicingFinder);

  const heroFretboardState = useMemo(() => {
    if (showComplement) {
      return {
        badge: "Complementare",
        props: {
          voicing: null,
          allTargetPcs: complementData ? complementData.pcs : [],
          allVoicings: [],
          showAll: false,
          displayMode: "notes",
          degreeMap: null,
          intervalMap: null,
          highlightAllAsActive: true,
        },
      };
    }

    if (!analysisMode) {
      const showingPrimaryForm = fretboardViewMode === "prime";

      return {
        badge: showingPrimaryForm
          ? showAll
            ? "Forme sovrapposte"
            : "Forma primaria"
          : showAll
            ? "Tutte le forme"
            : "Forma selezionata",
        props: {
          voicing: showingPrimaryForm ? primaryFormVoicing : selectedVoicing,
          allTargetPcs: showingPrimaryForm
            ? filteredPrimaryFormTargetPcs
            : filteredPrimaryTargetPcs,
          allVoicings: showingPrimaryForm ? primaryFormVoicings : filteredVoicings,
          showAll,
          displayMode,
          degreeMap: showingPrimaryForm ? primaryFormDegreeMap : activeSet?.degreeMap,
          intervalMap: showingPrimaryForm
            ? primaryFormIntervalMap
            : activeSet?.intervalMap,
          selectedIntervalClasses: activeSelectedIntervalClasses,
          showTargetMap: !showingPrimaryForm,
          expandOccurrencesInShowAll: showingPrimaryForm,
        },
      };
    }

    const showingPrimaryForm = fretboardViewMode === "prime";

    return {
      badge: showingPrimaryForm
        ? analysisShowAllVoicings
          ? "Prime form sovrapposte"
          : "Prime form"
        : analysisShowAllVoicings
          ? "Posizioni sovrapposte"
          : "Occorrenza selezionata",
      props: {
        voicing: showingPrimaryForm
          ? canRenderAnalysisPrimaryForm
            ? analysisPrimaryFormVoicing
            : null
          : canRenderAnalysisVoicings
            ? selectedAnalysisVoicing
            : null,
        allTargetPcs: showingPrimaryForm
          ? filteredAnalysisPrimaryFormTargetPcs
          : filteredAnalysisTargetPcs,
        allVoicings: showingPrimaryForm
          ? analysisPrimaryFormVoicings
          : !canRenderAnalysisVoicings
            ? []
            : analysisFilteredVoicings,
        showAll: showingPrimaryForm
          ? analysisShowAllVoicings
          : !canRenderAnalysisVoicings
            ? false
            : analysisShowAllVoicings,
        displayMode,
        degreeMap: showingPrimaryForm
          ? analysisPrimaryFormDegreeMap
          : analysisDegreeMap,
        intervalMap: showingPrimaryForm
          ? analysisPrimaryFormIntervalMap
          : analysisIntervalMap,
        selectedIntervalClasses: activeSelectedIntervalClasses,
        showTargetMap: !showingPrimaryForm,
        extraTargetPcs:
          showingPrimaryForm || !selectedOccurrenceSummary
            ? []
            : selectedOccurrenceSummary.missingPcs,
        pcRoleMap: showingPrimaryForm ? null : analysisPcRoleMap,
        expandOccurrencesInShowAll: showingPrimaryForm,
      },
    };
  }, [
    showComplement,
    complementData,
    analysisMode,
    fretboardViewMode,
    showAll,
    primaryFormVoicing,
    selectedVoicing,
    filteredPrimaryFormTargetPcs,
    filteredPrimaryTargetPcs,
    primaryFormVoicings,
    filteredVoicings,
    displayMode,
    primaryFormDegreeMap,
    activeSet,
    primaryFormIntervalMap,
    activeSelectedIntervalClasses,
    analysisShowAllVoicings,
    canRenderAnalysisPrimaryForm,
    analysisPrimaryFormVoicing,
    canRenderAnalysisVoicings,
    selectedAnalysisVoicing,
    filteredAnalysisPrimaryFormTargetPcs,
    filteredAnalysisTargetPcs,
    analysisPrimaryFormVoicings,
    analysisFilteredVoicings,
    analysisPrimaryFormDegreeMap,
    analysisDegreeMap,
    analysisPrimaryFormIntervalMap,
    analysisIntervalMap,
    selectedOccurrenceSummary,
    analysisPcRoleMap,
  ]);

  const heroSummaryState = useMemo(() => {
    const badge = showComplement
      ? "Complementare"
      : activeSet?.transformLabel || null;

    if (showComplement) {
      return {
        title: "Sintesi attiva",
        badge,
        items: complementData
          ? [
              { label: "Classe", value: complementData.forte },
              { label: "Prime form", value: `[${complementData.pf}]` },
              { label: "IV", value: formatIntervalVector(complementData.iv) },
            ]
          : [],
        note:
          activeSet && complementData
            ? `Complementare del ${activeSet.forteName}`
            : null,
      };
    }

    if (!activeSet) {
      return {
        title: "Sintesi attiva",
        badge,
        items: [],
        note: null,
      };
    }

    if (!analysisMode) {
      return {
        title: "Sintesi attiva",
        badge,
        items: [
          { label: "Classe", value: activeSet.forteName },
          { label: "Prime form", value: `[${activeSet.primeForm.join(",")}]` },
          { label: "IV", value: formatIntervalVector(activeSet.iv) },
        ],
        note: [
          fretboardViewMode === "prime" ? "Forma primaria" : "Voicing",
          getDisplayModeLabel(displayMode),
          browseMode === "iv"
            ? `${intervalVectorFamilyClasses.length} classi nella famiglia IV`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    }

    return {
      title: analysisMode === "subsets" ? "Sintesi subset" : "Sintesi superset",
      badge,
      items: [
        { label: "Classe madre", value: activeSet.forteName },
        {
          label: "Classe attiva",
          value: selectedAnalysisClass?.forteName || "n.d.",
        },
        {
          label: "Prime form",
          value: selectedAnalysisClass
            ? `[${selectedAnalysisClass.primeForm.join(",")}]`
            : "n.d.",
        },
        {
          label: "Relazione",
          value: analysisOccurrenceSummary?.classTransform || "n.d.",
        },
      ],
      note: selectedAnalysisMember
        ? analysisMode === "subsets"
          ? `Occorrenza [${selectedAnalysisMember.join(",")}] · Gradi presenti ${formatDegreeList(
              analysisOccurrenceSummary?.retainedDegrees || []
            )}`
          : `Occorrenza [${selectedAnalysisMember.join(",")}] · Note aggiunte ${formatPitchClassList(
              analysisOccurrenceSummary?.addedPcs || []
            )}`
        : null,
    };
  }, [
    showComplement,
    activeSet,
    complementData,
    analysisMode,
    selectedAnalysisClass,
    selectedAnalysisMember,
    analysisOccurrenceSummary,
    fretboardViewMode,
    displayMode,
    browseMode,
    intervalVectorFamilyClasses,
  ]);

  const heroCatalogState = showComplement
    ? {
        eyebrow: "Vista complementare",
        title: "Catalogo sospeso",
        count: null,
        items: [],
        emptyNote: "Il catalogo delle forme torna disponibile nella vista del set.",
      }
    : !analysisMode
      ? {
          eyebrow: null,
          title: "Forme trovate",
          count: filteredVoicings.length,
          items: filteredVoicings.map((voicing, index) => ({
            key: `voicing-${selectedForte}-${index}`,
            title: `Forma ${index + 1}`,
            subtitle: voicing.positions
              .map((position) =>
                String(activeSet?.degreeMap?.get(position.pc) ?? position.pc)
              )
              .join(" • "),
            meta: null,
            auxiliary: null,
            active: index === activeSelectedVoicingIndex,
            onClick: () => handleSelectVoicing(index),
          })),
          emptyNote: "Nessuna forma disponibile con i filtri correnti.",
        }
      : {
          eyebrow: analysisMode === "subsets" ? "Catalogo subset" : "Catalogo superset",
          title: "Classi trovate",
          count: analysisClasses.length,
          items: analysisClasses.map((item) => ({
            key: `analysis-${analysisMode}-${getClassKey(item)}`,
            title: item.forteName || "n.d.",
            subtitle: `PF [${item.primeForm.join(",")}]`,
            meta: `${item.concreteCount} istanze`,
            auxiliary: formatIntervalVector(item.iv),
            active: getClassKey(item) === getClassKey(selectedAnalysisClass || item),
            onClick: () => handleSelectAnalysisClass(getClassKey(item)),
          })),
          emptyNote: "Nessuna classe trovata per i filtri attivi.",
        };

  useEffect(() => {
    replaceSearchParams((params) => {
      setSearchParam(params, "browse", browseMode === "forte" ? null : browseMode);
      setSearchParam(params, "forte", activeSelectedForte);
      setSearchParam(
        params,
        "iv",
        browseMode === "iv" ? selectedIntervalVector : null
      );
      setSearchParam(params, "span", maxSpan === DEFAULT_MAX_SPAN ? null : maxSpan);
      setSearchParam(
        params,
        "neck",
        fretboardViewMode === DEFAULT_FRETBOARD_VIEW_MODE
          ? null
          : fretboardViewMode
      );
      setSearchParam(params, "analysis", analysisMode);

      setBooleanSearchParam(params, "showAll", showAll);
      setBooleanSearchParam(params, "complement", showComplement);
      setBooleanSearchParam(params, "excludeOpen", excludeOpenStrings);

      setSearchParam(params, "subset", subsetTargetCardinality);
      setSearchParam(params, "superset", supersetTargetCardinality);
      setSearchParam(
        params,
        "group",
        activeGroupFilter === "all" ? null : activeGroupFilter
      );
      setSearchParam(
        params,
        "spacing",
        activeVoicingLayoutFilter === "all" ? null : activeVoicingLayoutFilter
      );
      setSearchParam(
        params,
        "view",
        displayMode === DEFAULT_DISPLAY_MODE ? null : displayMode
      );
      setSearchParam(
        params,
        "ic",
        activeSelectedIntervalClasses.length
          ? activeSelectedIntervalClasses.join(",")
          : null
      );
      setSearchParam(
        params,
        "bass",
        activeBassFilter === "all" ? null : activeBassFilter
      );

      setSearchParam(params, "transform", transformMode === "base" ? null : transformMode);
      setSearchParam(
        params,
        "amount",
        transformMode === "base" ? null : transformAmount
      );
      setSearchParam(params, "voicing", activeSelectedVoicingIndex || null);

      if (!analysisMode) {
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
      setSearchParam(params, "amember", activeSelectedAnalysisMemberIndex || null);
      setSearchParam(
        params,
        "abass",
        activeAnalysisBassFilter === "all" ? null : activeAnalysisBassFilter
      );
      setBooleanSearchParam(params, "aShowAll", analysisShowAllVoicings);
      setSearchParam(
        params,
        "avoicing",
        activeSelectedAnalysisVoicingIndex || null
      );
    });
  }, [
    browseMode,
    activeSelectedForte,
    selectedIntervalVector,
    maxSpan,
    fretboardViewMode,
    analysisMode,
    showAll,
    showComplement,
    excludeOpenStrings,
    subsetTargetCardinality,
    supersetTargetCardinality,
    activeGroupFilter,
    activeVoicingLayoutFilter,
    displayMode,
    activeSelectedIntervalClasses,
    activeBassFilter,
    transformMode,
    transformAmount,
    activeSelectedVoicingIndex,
    selectedAnalysisClass,
    activeSelectedAnalysisMemberIndex,
    activeAnalysisBassFilter,
    analysisShowAllVoicings,
    activeSelectedAnalysisVoicingIndex,
  ]);

  return (
    <div className="set-page">
      <div className="set-page__inner">
        <GenericSetControlsPanel
          keyLabel={keyLabel}
          browseMode={browseMode}
          heroFretboardState={heroFretboardState}
          heroSummaryState={heroSummaryState}
          heroCatalogState={heroCatalogState}
          onBrowseModeChange={handleBrowseModeChange}
          sortedKeys={sortedKeys}
          dataMap={dataMap}
          selectedForte={activeSelectedForte}
          onSelectedForteChange={handleSelectedForteChange}
          selectedIntervalVector={selectedIntervalVector}
          onSelectedIntervalVectorChange={handleSelectedIntervalVectorChange}
          intervalVectorOptions={intervalVectorOptions}
          intervalVectorMatches={intervalVectorMatches}
          maxSpan={maxSpan}
          onMaxSpanChange={handleMaxSpanChange}
          fretboardViewMode={fretboardViewMode}
          onFretboardViewModeChange={handleFretboardViewModeChange}
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
          groupFilter={activeGroupFilter}
          voicingLayoutFilter={activeVoicingLayoutFilter}
          availableVoicingLayoutFilters={availableVoicingLayoutFilters}
          onVoicingLayoutFilterChange={handleVoicingLayoutFilterChange}
          availableGroupPatterns={availableGroupPatterns}
          closeVoicingCount={closeVoicingCount}
          spreadVoicingCount={spreadVoicingCount}
          onGroupFilterChange={handleGroupFilterChange}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          degreeButtonLabel={degreeButtonLabel}
          bassOptions={bassOptions}
          bassFilter={activeBassFilter}
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

        <div className="set-page__grid">
          <GenericSetFretboardPanel
          showComplement={showComplement}
          hideFretboardVisual={true}
          analysisMode={analysisMode}
          fretboardViewMode={fretboardViewMode}
          browseMode={browseMode}
          noteName={noteName}
          activeSet={activeSet}
          selectedVoicing={selectedVoicing}
          filteredVoicings={filteredVoicings}
          primaryFormVoicing={primaryFormVoicing}
          primaryFormVoicings={primaryFormVoicings}
          primaryFormDegreeMap={primaryFormDegreeMap}
          primaryFormIntervalMap={primaryFormIntervalMap}
          primaryFormIntervalLegend={primaryFormIntervalLegend}
          showAll={showAll}
          displayMode={displayMode}
          intervalVectorFamilyClasses={intervalVectorFamilyClasses}
          selectedIntervalVector={selectedIntervalVector}
          selectedIntervalClasses={activeSelectedIntervalClasses}
          onToggleIntervalClass={handleToggleIntervalClass}
          onClearIntervalClassFilter={handleClearIntervalClassFilter}
          filteredPrimaryTargetPcs={filteredPrimaryTargetPcs}
          filteredPrimaryFormTargetPcs={filteredPrimaryFormTargetPcs}
          selectedAnalysisClass={selectedAnalysisClass}
          selectedAnalysisMember={selectedAnalysisMember}
          filteredAnalysisTargetPcs={filteredAnalysisTargetPcs}
          filteredAnalysisPrimaryFormTargetPcs={filteredAnalysisPrimaryFormTargetPcs}
          canRenderAnalysisVoicings={canRenderAnalysisVoicings}
          selectedAnalysisVoicing={selectedAnalysisVoicing}
          analysisFilteredVoicings={analysisFilteredVoicings}
          analysisPrimaryFormVoicing={analysisPrimaryFormVoicing}
          analysisPrimaryFormVoicings={analysisPrimaryFormVoicings}
          analysisPrimaryFormDegreeMap={analysisPrimaryFormDegreeMap}
          analysisPrimaryFormIntervalMap={analysisPrimaryFormIntervalMap}
          analysisPrimaryFormIntervalLegend={analysisPrimaryFormIntervalLegend}
          analysisShowAllVoicings={analysisShowAllVoicings}
          analysisDegreeMap={analysisDegreeMap}
          analysisIntervalMap={analysisIntervalMap}
          analysisIntervalLegend={analysisIntervalLegend}
          analysisIntervalClassBreakdown={analysisIntervalClassBreakdown}
          complementData={complementData}
        />

          <GenericSetResultsPanel
            browseMode={browseMode}
            showComplement={showComplement}
            analysisMode={analysisMode}
            fretboardViewMode={fretboardViewMode}
            filteredVoicings={filteredVoicings}
            noteName={noteName}
            selectedForte={activeSelectedForte}
            activeSelectedVoicingIndex={activeSelectedVoicingIndex}
            onSelectVoicing={handleSelectVoicing}
            displayMode={displayMode}
            activeSet={activeSet}
            intervalVectorFamilyClasses={intervalVectorFamilyClasses}
            selectedIntervalVector={selectedIntervalVector}
            onSelectFamilyClass={handleSelectedForteChange}
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
            analysisBassFilter={activeAnalysisBassFilter}
            analysisBassOptions={analysisBassOptions}
            onAnalysisBassFilterChange={handleAnalysisBassFilterChange}
            analysisShowAllVoicings={analysisShowAllVoicings}
            onAnalysisShowAllVoicingsChange={setAnalysisShowAllVoicings}
            analysisFilteredVoicings={analysisFilteredVoicings}
            analysisPrimaryFormVoicings={analysisPrimaryFormVoicings}
            activeSelectedAnalysisVoicingIndex={activeSelectedAnalysisVoicingIndex}
            onSelectAnalysisVoicing={handleSelectAnalysisVoicing}
            analysisDegreeMap={analysisDegreeMap}
            analysisIntervalMap={analysisIntervalMap}
            complementName={complementName}
            complementData={complementData}
          />
        </div>
      </div>
    </div>
  );
}
