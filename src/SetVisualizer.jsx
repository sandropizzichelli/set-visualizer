import React, { useState } from "react";
import {
  TETRACHORD_KEYS,
  PENTACHORD_KEYS,
  HEXACHORD_KEYS,
  FORTE_4_8_DATA,
  FORTE_5_7_DATA,
  FORTE_6_DATA,
} from "./setData";
import {
  findTetrachordVoicings,
  findPentachordVoicings,
  findHexachordVoicings,
} from "./setUtils";
import { PillButton } from "./SetControls";
import GenericSetPage from "./GenericSetPage";
import TricordPage from "./TricordPage";

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

function PentachordPage() {
  return (
    <GenericSetPage
      title="Visualizzatore pentacordi su chitarra"
      description="Pagina separata dai tricordi e dai tetracordi. Qui lavori solo con i set a 5 note di Allen Forte."
      keyLabel="Pentacordo Forte"
      keys={PENTACHORD_KEYS}
      dataMap={FORTE_5_7_DATA}
      findVoicingFn={findPentachordVoicings}
      noteName="pentacordo"
      complementName="Complementare"
      degreeButtonLabel="Gradi 1-2-3-4-5"
      noteCount={5}
    />
  );
}

function HexachordPage() {
  return (
    <GenericSetPage
      title="Visualizzatore esacordi su chitarra"
      description="Pagina separata dai tricordi, tetracordi e pentacordi. Qui lavori solo con i set a 6 note di Allen Forte."
      keyLabel="Esacordo Forte"
      keys={HEXACHORD_KEYS}
      dataMap={FORTE_6_DATA}
      findVoicingFn={findHexachordVoicings}
      noteName="esacordo"
      complementName="Complementare"
      degreeButtonLabel="Gradi 1-2-3-4-5-6"
      noteCount={6}
    />
  );
}

function PageSwitcher({ page, setPage }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        gap: "8px",
        background: "rgba(255,255,255,0.95)",
        padding: "8px",
        borderRadius: "14px",
        border: "1px solid #ddd",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        flexWrap: "wrap",
        maxWidth: "90vw",
      }}
    >
      <PillButton
        active={page === "tricordi"}
        onClick={() => setPage("tricordi")}
      >
        Pagina tricordi
      </PillButton>
      <PillButton
        active={page === "tetracordi"}
        onClick={() => setPage("tetracordi")}
      >
        Pagina tetracordi
      </PillButton>
      <PillButton
        active={page === "pentacordi"}
        onClick={() => setPage("pentacordi")}
      >
        Pagina pentacordi
      </PillButton>
      <PillButton
        active={page === "esacordi"}
        onClick={() => setPage("esacordi")}
      >
        Pagina esacordi
      </PillButton>
    </div>
  );
}

export default function SetVisualizer() {
  const [page, setPage] = useState("tricordi");

  return (
    <>
      <PageSwitcher page={page} setPage={setPage} />
      {page === "tricordi" && <TricordPage />}
      {page === "tetracordi" && <TetrachordPage />}
      {page === "pentacordi" && <PentachordPage />}
      {page === "esacordi" && <HexachordPage />}
    </>
  );
}
