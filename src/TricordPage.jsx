import React, { useMemo } from "react";
import { TRICHORD_FORTE_MAP } from "./setData";
import { findVoicings } from "./setUtils";
import GenericSetPage from "./GenericSetPage";

const TRICHORD_IV_MAP = {
  "3-1": "210000",
  "3-2": "111000",
  "3-3": "101100",
  "3-4": "100110",
  "3-5": "100011",
  "3-6": "020100",
  "3-7": "011010",
  "3-8": "010101",
  "3-9": "010020",
  "3-10": "002001",
  "3-11": "001110",
  "3-12": "000300",
};

function buildTrichordData() {
  const dataMap = {};

  Object.entries(TRICHORD_FORTE_MAP).forEach(([pfKey, forteName]) => {
    const pfArray = pfKey.split(",").map(Number);

    dataMap[forteName] = {
      pf: pfArray.join(""),
      iv: TRICHORD_IV_MAP[forteName] || "",
    };
  });

  const keys = Object.keys(dataMap).sort((a, b) => {
    const nA = parseInt(a.split("-")[1], 10);
    const nB = parseInt(b.split("-")[1], 10);
    return nA - nB;
  });

  return { keys, dataMap };
}

export default function TricordPage() {
  const { keys, dataMap } = useMemo(() => buildTrichordData(), []);

  return (
    <GenericSetPage
      title="Visualizzatore tricordi su chitarra"
      description="Pagina uniformata alle altre: seleziona direttamente un tricordo di Allen Forte e visualizzane le forme sul manico."
      keyLabel="Tricordo Forte"
      keys={keys}
      dataMap={dataMap}
      findVoicingFn={findVoicings}
      noteName="tricordo"
      complementName="Complementare"
      degreeButtonLabel="Gradi 1-2-3"
      noteCount={3}
    />
  );
}
