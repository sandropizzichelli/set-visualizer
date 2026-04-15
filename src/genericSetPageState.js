import {
  readBooleanParam,
  readEnumParam,
  readIntegerParam,
  readStringParam,
} from "./urlState";

const ANALYSIS_MODES = ["subsets", "supersets"];
const DISPLAY_MODES = ["notes", "degrees", "intervals"];
const TRANSFORM_MODES = ["base", "tn", "tni"];
const BROWSE_MODES = ["forte", "iv"];
const FRETBOARD_VIEW_MODES = ["voicing", "prime"];
const VOICING_LAYOUT_FILTERS = ["all", "close", "spread"];
const DEFAULT_DISPLAY_MODE = "degrees";
const DEFAULT_FRETBOARD_VIEW_MODE = "prime";
const MIN_MAX_SPAN = 2;
const MAX_MAX_SPAN = 5;

export function getAvailableVoicingLayoutFilters(noteCount) {
  return noteCount >= 6 ? ["all", "close"] : VOICING_LAYOUT_FILTERS;
}

export function readBassFilter(params, name) {
  const value = params.get(name);
  if (!value || value === "all") return "all";

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 11) {
    return "all";
  }

  return parsed;
}

export function buildIntervalVectorOptions(keys, dataMap) {
  return [...new Set(keys.map((key) => dataMap[key]?.iv).filter(Boolean))].sort(
    (first, second) => first.localeCompare(second)
  );
}

export function readIntervalClassFilter(params, name) {
  const value = params.get(name);
  if (!value) return [];

  return [...new Set(
    value
      .split(",")
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => !Number.isNaN(item) && item >= 1 && item <= 6)
  )].sort((first, second) => first - second);
}

export function buildUrlStateFromParams(params, keys, dataMap, noteCount) {
  const selectedForte = readStringParam(params, "forte", keys[0], keys);
  const intervalVectorOptions = buildIntervalVectorOptions(keys, dataMap);
  const defaultIntervalVector =
    dataMap[selectedForte]?.iv || intervalVectorOptions[0] || "";
  const availableVoicingLayoutFilters = getAvailableVoicingLayoutFilters(noteCount);

  return {
    browseMode: readEnumParam(params, "browse", BROWSE_MODES, "forte"),
    selectedForte,
    selectedIntervalVector: readStringParam(
      params,
      "iv",
      defaultIntervalVector,
      intervalVectorOptions
    ),
    selected: readIntegerParam(params, "voicing", 0, { min: 0 }),
    maxSpan: readIntegerParam(params, "span", 5, {
      min: MIN_MAX_SPAN,
      max: MAX_MAX_SPAN,
    }),
    fretboardViewMode: readEnumParam(
      params,
      "neck",
      FRETBOARD_VIEW_MODES,
      DEFAULT_FRETBOARD_VIEW_MODE
    ),
    showAll: readBooleanParam(params, "showAll", false),
    showComplement: readBooleanParam(params, "complement", false),
    excludeOpenStrings: readBooleanParam(params, "excludeOpen", false),
    analysisMode: readEnumParam(params, "analysis", ANALYSIS_MODES, null),
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
    voicingLayoutFilter: readEnumParam(
      params,
      "spacing",
      availableVoicingLayoutFilters,
      "all"
    ),
    displayMode: readEnumParam(
      params,
      "view",
      DISPLAY_MODES,
      DEFAULT_DISPLAY_MODE
    ),
    bassFilter: readBassFilter(params, "bass"),
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
    analysisBassFilter: readBassFilter(params, "abass"),
    selectedIntervalClasses: readIntervalClassFilter(params, "ic"),
  };
}

