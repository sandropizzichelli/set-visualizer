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
    allVoicings.forEach((v) => {
      v.positions.forEach((p) => {
        const key = `${p.stringIndex}-${p.fret}`;
        if (!selectedMap.has(key)) {
          selectedMap.set(key, {
            pc: p.pc,
            degree: degreeMap?.get(p.pc) ?? null,
          });
        }
      });
    });
  } else if (voicing) {
    voicing.positions.forEach((p) => {
      const key = `${p.stringIndex}-${p.fret}`;
      selectedMap.set(key, {
        pc: p.pc,
        degree: degreeMap?.get(p.pc) ?? null,
      });
    });
  }

  const visibleStrings = DISPLAY_STRINGS.filter((displayString) => {
    const sIdx = STRINGS.findIndex((s) => s.name === displayString.name);
    if (!hideEmptyStrings) return true;

    if (highlightAllAsActive) {
      return Array.from({ length: FRET_COUNT + 1 }, (_, fret) =>
        pcAt(sIdx, fret)
      ).some((pc) => allTargetPcs.includes(pc));
    }

    return (
      voicing?.positions.some((p) => p.stringIndex === sIdx) ||
      (showAll &&
        allVoicings?.some((v) =>
          v.positions.some((p) => p.stringIndex === sIdx)
        ))
    );
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "inline-block",
          padding: "12px",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `52px repeat(${FRET_COUNT + 1}, 46px)`,
            gap: "4px",
          }}
        >
          <div />
          {Array.from({ length: FRET_COUNT + 1 }, (_, i) => (
            <div
              key={i}
              style={{ textAlign: "center", fontSize: "12px", color: "#666" }}
            >
              {i}
            </div>
          ))}

          {visibleStrings.map((displayString) => {
            const sIdx = STRINGS.findIndex(
              (s) => s.name === displayString.name
            );

            return (
              <React.Fragment key={displayString.name}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {displayString.name}
                </div>

                {Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
                  const pc = pcAt(sIdx, fret);
                  const key = `${sIdx}-${fret}`;
                  const selectedInfo = selectedMap.get(key);
                  const active =
                    !!selectedInfo ||
                    (highlightAllAsActive && allTargetPcs.includes(pc));
                  const target = allTargetPcs.includes(pc);

                  let bg = "white";
                  let border = "1px solid #ddd";
                  let color = "#111";
                  let text = "";

                  if (active) {
                    bg = "#111";
                    border = "1px solid #111";
                    color = "white";

                    if (selectedInfo) {
                      text =
                        displayMode === "degrees"
                          ? String(selectedInfo.degree ?? "")
                          : PC_TO_NAME[selectedInfo.pc];
                    } else {
                      text = PC_TO_NAME[pc];
                    }
                  } else if (target && !highlightAllAsActive) {
                    bg = "#f3f4f6";
                    border = "1px solid #d1d5db";
                  }

                  return (
                    <div
                      key={`${sIdx}-${fret}`}
                      style={{
                        width: "46px",
                        height: "38px",
                        borderRadius: "8px",
                        background: bg,
                        border,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
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