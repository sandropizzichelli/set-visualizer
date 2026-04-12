import React from "react";
import { STRINGS, DISPLAY_STRINGS, FRET_COUNT, PC_TO_NAME } from "./setData";
import { pcAt } from "./setUtils";
import {
  formatSemitoneLabel,
  getIntervalStyle,
} from "./genericSetPageHelpers";

const LABEL_WIDTH = 56;
const CELL_WIDTH = 48;
const CELL_HEIGHT = 42;
const GRID_GAP = 6;
const HEADER_HEIGHT = 20;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
  const overlayWidth =
    LABEL_WIDTH + (FRET_COUNT + 1) * CELL_WIDTH + (FRET_COUNT + 1) * GRID_GAP;
  const overlayHeight =
    HEADER_HEIGHT + visibleStrings.length * CELL_HEIGHT + visibleStrings.length * GRID_GAP;

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
          const dx = x2 - x1;
          const dy = y2 - y1;
          const distance = Math.hypot(dx, dy) || 1;
          const normalX = -dy / distance;
          const normalY = dx / distance;
          const bendDirection =
            (firstPosition.fret + secondPosition.fret + intervalClass) % 2 === 0 ? 1 : -1;
          const bendStrength = 14 + intervalClass * 4 + Math.abs(firstRow - secondRow) * 2;
          const midpointX = (x1 + x2) / 2;
          const midpointY = (y1 + y2) / 2;
          const controlX = clamp(
            midpointX + normalX * bendStrength * bendDirection,
            LABEL_WIDTH + CELL_WIDTH / 2,
            overlayWidth - CELL_WIDTH / 2
          );
          const controlY = clamp(
            midpointY + normalY * bendStrength * bendDirection,
            HEADER_HEIGHT + CELL_HEIGHT / 2,
            overlayHeight - CELL_HEIGHT / 2
          );
          const path = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

          return [
            {
              key: `${firstPosition.stringIndex}-${firstPosition.fret}-${secondPosition.stringIndex}-${secondPosition.fret}-${intervalClass}`,
              intervalClass,
              path,
            },
          ];
        })
      )
    : [];

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
                    <path
                      d={segment.path}
                      className="fretboard-overlay__line fretboard-overlay__line--glow"
                      style={{ stroke: palette.soft[0] }}
                    />
                    <path
                      d={segment.path}
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
