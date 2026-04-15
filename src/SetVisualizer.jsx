import React, { useEffect, useState } from "react";
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
import {
  getCurrentSearchParams,
  readEnumParam,
  replaceSearchParams,
  setSearchParam,
} from "./urlState";

const PAGE_OPTIONS = ["tricordi", "tetracordi", "pentacordi", "esacordi"];

function getInitialPage() {
  const params = getCurrentSearchParams();
  return readEnumParam(params, "page", PAGE_OPTIONS, "tricordi");
}

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
    <div className="page-switcher">
      <div className="page-switcher__panel">
        <div className="page-switcher__copy">
          <div className="eyebrow">Set-class explorer</div>
        </div>

        <div className="page-switcher__actions">
          <PillButton active={page === "tricordi"} onClick={() => setPage("tricordi")}>
            Tricordi
          </PillButton>
          <PillButton
            active={page === "tetracordi"}
            onClick={() => setPage("tetracordi")}
          >
            Tetracordi
          </PillButton>
          <PillButton
            active={page === "pentacordi"}
            onClick={() => setPage("pentacordi")}
          >
            Pentacordi
          </PillButton>
          <PillButton active={page === "esacordi"} onClick={() => setPage("esacordi")}>
            Esacordi
          </PillButton>
        </div>
      </div>
    </div>
  );
}

export default function SetVisualizer() {
  const [page, setPage] = useState(getInitialPage);

  useEffect(() => {
    replaceSearchParams((params) => {
      setSearchParam(params, "page", page);
    });
  }, [page]);

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
