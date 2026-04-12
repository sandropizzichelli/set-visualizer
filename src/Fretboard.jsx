import React from "react";
import { STRINGS, DISPLAY_STRINGS, FRET_COUNT, PC_TO_NAME } from "./setData";
import { pcAt } from "./setUtils";
import { formatSemitoneLabel } from "./genericSetPageHelpers";

const INTERVAL_STYLES = [
  { solid: ["#0f5f5a", "#24b6a1"], soft: ["rgba(15,95,90,0.2)", "rgba(36,182,161,0.22)"] },
  { solid: ["#125e73", "#2ab8da"], soft: ["rgba(18,94,115,0.2)", "rgba(42,184,218,0.2)"] },
  { solid: ["#2150a6", "#5d88f2"], soft: ["rgba(33,80,166,0.2)", "rgba(93,136,242,0.18)"] },
  { solid: ["#5b3aa7", "#9f76ff"], soft: ["rgba(91,58,167,0.2)", "rgba(159,118,255,0.18)"] },
  { solid: ["#7f2f83", "#d96bc8"], soft: ["rgba(127,47,131,0.18)", "rgba(217,107,200,0.2)"] },
  { solid: ["#9a345a", "#f0719d"], soft: ["rgba(154,52,90,0.18)", "rgba(240,113,157,0.18)"] },
  { solid: ["#b0482a", "#ff9f5c"], soft: ["rgba(176,72,42,0.2)", "rgba(255,159,92,0.2)"] },
  { solid: ["#9f5a16", "#f7ba45"], soft: ["rgba(159,90,22,0.18)", "rgba(247,186,69,0.22)"] },
  { solid: ["#847515", "#d1cc53"], soft: ["rgba(132,117,21,0.16)", "rgba(209,204,83,0.24)"] },
  { solid: ["#5e7f1b", "#9dd84b"], soft: ["rgba(94,127,27,0.18)", "rgba(157,216,75,0.22)"] },
  { solid: ["#2d7d38", "#64d377"], soft: ["rgba(45,125,56,0.18)", "rgba(100,211,119,0.22)"] },
  { solid: ["#0d7a63", "#3ed4a7"], soft: ["rgba(13,122,99,0.18)", "rgba(62,212,167,0.2)"] },
];

const LABEL_WIDTH = 56;
const CELL_WIDTH = 48;
const CELL_HEIGHT = 42;
const GRID_GAP = 6;
const HEADER_HEIGHT = 20;

function getIntervalStyle(interval) {
  return INTERVAL_STYLES[interval % INTERVAL_STYLES.length];
}

function getIntervalClass(firstPc, secondPc) {
  const distance = (secondPc - firstPc + 12) % 12;
  return Math.min(distance, 12 - distance);
}

export default function Fretboard({
  voicing,
  allTargetPcs,
  allVoicings,
  showAll,
  displayMode,
  degreeMap,
  intervalMap,
  selectedIntervalClasses = [],
  highlightAllAsActive = false,
  hideEmptyStrings = false,
}) {
  const selectedMap = new Map();
  const isIntervalMode = displayMode === "intervals" && intervalMap;
  const targetPitchClassSet = new Set(allTargetPcs);

  if (showAll && allVoicings) {
    allVoicings.forEach((currentVoicing) => {
      currentVoicing.positions.forEach((position) => {
        if (!targetPitchClassSet.has(position.pc)) return;

        const key = `${position.stringIndex}-${position.fret}`;
        if (!selectedMap.has(key)) {
          selectedMap.set(key, {
            stringIndex: position.stringIndex,
            fret: position.fret,
            pc: position.pc,
            degree: degreeMap?.get(position.pc) ?? null,
            interval: intervalMap?.get(position.pc) ?? null,
          });
        }
      });
    });
  } else if (voicing) {
    voicing.positions.forEach((position) => {
      if (!targetPitchClassSet.has(position.pc)) return;

      const key = `${position.stringIndex}-${position.fret}`;
      selectedMap.set(key, {
        stringIndex: position.stringIndex,
        fret: position.fret,
        pc: position.pc,
        degree: degreeMap?.get(position.pc) ?? null,
        interval: intervalMap?.get(position.pc) ?? null,
      });
    });
  }

  const visibleStrings = DISPLAY_STRINGS.filter((displayString) => {
    const stringIndex = STRINGS.findIndex((stringItem) => stringItem.name === displayString.name);
    if (!hideEmptyStrings) return true;

    if (highlightAllAsActive) {
      return Array.from({ length: FRET_COUNT + 1 }, (_, fret) => pcAt(stringIndex, fret)).some(
        (pc) => targetPitchClassSet.has(pc)
      );
    }

    return (
      voicing?.positions.some((position) => position.stringIndex === stringIndex) ||
      (showAll &&
        allVoicings?.some((currentVoicing) =>
          currentVoicing.positions.some((position) => position.stringIndex === stringIndex)
        ))
    );
  });

  const stringRowIndexMap = new Map(
    visibleStrings.map((displayString, rowIndex) => {
      const stringIndex = STRINGS.findIndex((stringItem) => stringItem.name === displayString.name);
      return [stringIndex, rowIndex];
    })
  );

  const selectedPositions = Array.from(selectedMap.values());
  const canRenderConnections =
    selectedIntervalClasses.length > 0 &&
    selectedPositions.length > 1 &&
    !showAll &&
    !highlightAllAsActive;

  const connectionSegments = canRenderConnections
    ? selectedPositions.flatMap((firstPosition, firstIndex) =>
        selectedPositions.slice(firstIndex + 1).flatMap((secondPosition) => {
          const intervalClass = getIntervalClass(firstPosition.pc, secondPosition.pc);
          if (!selectedIntervalClasses.includes(intervalClass)) return [];

          const firstRow = stringRowIndexMap.get(firstPosition.stringIndex);
          const secondRow = stringRowIndexMap.get(secondPosition.stringIndex);
          if (firstRow === undefined || secondRow === undefined) return [];

          const x1 =
            LABEL_WIDTH +
            GRID_GAP +
            firstPosition.fret * (CELL_WIDTH + GRID_GAP) +
            CELL_WIDTH / 2;
          const y1 =
            HEADER_HEIGHT +
            GRID_GAP +
            firstRow * (CELL_HEIGHT + GRID_GAP) +
            CELL_HEIGHT / 2;
          const x2 =
            LABEL_WIDTH +
            GRID_GAP +
            secondPosition.fret * (CELL_WIDTH + GRID_GAP) +
            CELL_WIDTH / 2;
          const y2 =
            HEADER_HEIGHT +
            GRID_GAP +
            secondRow * (CELL_HEIGHT + GRID_GAP) +
            CELL_HEIGHT / 2;

          return [
            {
              key: `${firstPosition.stringIndex}-${firstPosition.fret}-${secondPosition.stringIndex}-${secondPosition.fret}-${intervalClass}`,
              intervalClass,
              x1,
              y1,
              x2,
              y2,
            },
          ];
        })
      )
    : [];

  const overlayWidth =
    LABEL_WIDTH + (FRET_COUNT + 1) * CELL_WIDTH + (FRET_COUNT + 1) * GRID_GAP;
  const overlayHeight =
    HEADER_HEIGHT + visibleStrings.length * CELL_HEIGHT + visibleStrings.length * GRID_GAP;

  return (
    <div className="fretboard-scroll">
      <div className="fretboard-board">
        <div
          className="fretboard-grid"
          style={{ gridTemplateColumns: `56px repeat(${FRET_COUNT + 1}, 48px)` }}
        >
          {connectionSegments.length > 0 && (
            <svg
              className="fretboard-overlay"
              viewBox={`0 0 ${overlayWidth} ${overlayHeight}`}
              aria-hidden="true"
            >
              {connectionSegments.map((segment) => {
                const palette = getIntervalStyle(segment.intervalClass);

                return (
                  <g key={segment.key}>
                    <line
                      x1={segment.x1}
                      y1={segment.y1}
                      x2={segment.x2}
                      y2={segment.y2}
                      className="fretboard-overlay__line fretboard-overlay__line--glow"
                      style={{ stroke: palette.soft[0] }}
                    />
                    <line
                      x1={segment.x1}
                      y1={segment.y1}
                      x2={segment.x2}
                      y2={segment.y2}
                      className="fretboard-overlay__line"
                      style={{ stroke: palette.solid[1] }}
                    />
                  </g>
                );
              })}
            </svg>
          )}

          <div className="fretboard__corner" />
          {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => (
            <div key={fret} className="fretboard__fret-label">
              {fret}
            </div>
          ))}

          {visibleStrings.map((displayString) => {
            const stringIndex = STRINGS.findIndex((stringItem) => stringItem.name === displayString.name);

            return (
              <React.Fragment key={displayString.name}>
                <div className="fretboard__string-label">{displayString.name}</div>

                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
                  const pc = pcAt(stringIndex, fret);
                  const cellKey = `${stringIndex}-${fret}`;
                  const selectedInfo = selectedMap.get(cellKey);
                  const active =
                    Boolean(selectedInfo) ||
                    (highlightAllAsActive && targetPitchClassSet.has(pc));
                  const target = targetPitchClassSet.has(pc);
                  const interval = intervalMap?.get(selectedInfo?.pc ?? pc);

                  let text = "";
                  if (active) {
                    text = selectedInfo
                      ? displayMode === "degrees"
                        ? String(selectedInfo.degree ?? "")
                        : displayMode === "intervals"
                          ? formatSemitoneLabel(selectedInfo.interval ?? 0)
                          : PC_TO_NAME[selectedInfo.pc]
                      : displayMode === "intervals" && interval !== undefined
                        ? formatSemitoneLabel(interval)
                        : PC_TO_NAME[pc];
                  }

                  const className = ["fretboard__cell"];
                  const style = {};

                  if (active) {
                    className.push("is-active");
                  } else if (target && !highlightAllAsActive) {
                    className.push("is-target");
                  }

                  if (isIntervalMode && interval !== undefined && interval !== null) {
                    const palette = getIntervalStyle(interval);

                    if (active) {
                      style.background = `linear-gradient(135deg, ${palette.solid[0]} 0%, ${palette.solid[1]} 100%)`;
                      style.border = "2px solid rgba(255, 252, 246, 0.92)";
                      style.boxShadow = `0 0 0 3px ${palette.soft[0]}, 0 16px 28px rgba(10, 73, 69, 0.28)`;
                    } else if (target && !highlightAllAsActive) {
                      style.background = `linear-gradient(180deg, rgba(255,252,247,0.96), ${palette.soft[1]})`;
                      style.borderColor = palette.solid[0];
                      style.boxShadow = `inset 0 0 0 2px ${palette.soft[0]}, 0 2px 5px rgba(17, 10, 6, 0.05)`;
                    }
                  }

                  return (
                    <div
                      key={cellKey}
                      className={className.join(" ")}
                      style={style}
                      title={isIntervalMode && interval !== undefined ? `${PC_TO_NAME[pc]} · ${formatSemitoneLabel(interval)}` : PC_TO_NAME[pc]}
                    >
                      {text}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
