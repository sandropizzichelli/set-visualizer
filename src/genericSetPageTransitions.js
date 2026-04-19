const DEFAULT_DISPLAY_MODE = "degrees";
const DEFAULT_FRETBOARD_VIEW_MODE = "prime";

export function buildSetPresentationDefaults() {
  return {
    fretboardViewMode: DEFAULT_FRETBOARD_VIEW_MODE,
    displayMode: DEFAULT_DISPLAY_MODE,
    analysisMode: null,
    selectedIntervalClasses: [],
    showComplement: false,
    showAll: false,
    analysisShowAllVoicings: false,
    selected: 0,
    selectedAnalysisClassKey: null,
    selectedAnalysisMemberIndex: 0,
    selectedAnalysisVoicingIndex: 0,
    bassFilter: "all",
    analysisBassFilter: "all",
  };
}

export function buildForteSelectionState(forte, dataMap) {
  return {
    ...buildSetPresentationDefaults(),
    selectedForte: forte,
    selectedIntervalVector: dataMap[forte]?.iv || null,
  };
}

export function buildIntervalVectorSelectionState(intervalVector, intervalVectorMap) {
  const matchingKeys = intervalVectorMap.get(intervalVector) || [];

  return {
    ...buildSetPresentationDefaults(),
    selectedIntervalVector: intervalVector,
    selectedForte: matchingKeys[0] || null,
  };
}

export function buildGenusSelectionState(genusId, genusMap, dataMap) {
  const selectedGenus = genusMap.get(genusId) || null;
  const selectedForte = selectedGenus?.keys?.[0] || null;

  return {
    ...buildSetPresentationDefaults(),
    selectedGenusId: selectedGenus?.id || null,
    selectedForte,
    selectedIntervalVector: selectedForte ? dataMap[selectedForte]?.iv || null : null,
  };
}

export function getDisplayModeAfterBrowseModeChange(mode, currentDisplayMode) {
  if (mode === "iv" && currentDisplayMode === "notes") {
    return "intervals";
  }

  return currentDisplayMode;
}
