import React from "react";
import { STRINGS, DISPLAY_STRINGS, FRET_COUNT, PC_TO_NAME } from "./setData";
import { pcAt } from "./setUtils";

export default function Fretboard({
  voicing,
  allTargetPcs,
  allVoicings,
  showAll,
  displayMode,
  degreeMap,
  highlightAllAsActive = false,
  hideEmptyStrings = false,
}) {
  const selectedMap = new Map();

  if (showAll && allVoicings) {
    allVoicings.forEach((currentVoicing) => {
      currentVoicing.positions.forEach((position) => {
        const key = `${position.stringIndex}-${position.fret}`;
        if (!selectedMap.has(key)) {
          selectedMap.set(key, {
            pc: position.pc,
            degree: degreeMap?.get(position.pc) ?? null,
          });
        }
      });
    });
  } else if (voicing) {
    voicing.positions.forEach((position) => {
      const key = `${position.stringIndex}-${position.fret}`;
      selectedMap.set(key, {
        pc: position.pc,
        degree: degreeMap?.get(position.pc) ?? null,
      });
    });
  }

  const visibleStrings = DISPLAY_STRINGS.filter((displayString) => {
    const stringIndex = STRINGS.findIndex((stringItem) => stringItem.name === displayString.name);
    if (!hideEmptyStrings) return true;

    if (highlightAllAsActive) {
      return Array.from({ length: FRET_COUNT + 1 }, (_, fret) => pcAt(stringIndex, fret)).some(
        (pc) => allTargetPcs.includes(pc)
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

  return (
    <div className="fretboard-scroll">
      <div className="fretboard-board">
        <div
          className="fretboard-grid"
          style={{ gridTemplateColumns: `56px repeat(${FRET_COUNT + 1}, 48px)` }}
        >
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
                    (highlightAllAsActive && allTargetPcs.includes(pc));
                  const target = allTargetPcs.includes(pc);

                  let text = "";
                  if (active) {
                    text = selectedInfo
                      ? displayMode === "degrees"
                        ? String(selectedInfo.degree ?? "")
                        : PC_TO_NAME[selectedInfo.pc]
                      : PC_TO_NAME[pc];
                  }

                  const className = ["fretboard__cell"];
                  if (active) {
                    className.push("is-active");
                  } else if (target && !highlightAllAsActive) {
                    className.push("is-target");
                  }

                  return (
                    <div key={cellKey} className={className.join(" ")} title={PC_TO_NAME[pc]}>
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
