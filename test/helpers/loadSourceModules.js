import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO_ROOT = "/Users/silvialumaca/Desktop/set-visualizer";
const SRC_ROOT = path.join(REPO_ROOT, "src");

let modulesPromise;

function patchImports(source) {
  return source
    .replaceAll('from "./setData";', 'from "./setData.js";')
    .replaceAll('from "./setUtils";', 'from "./setUtils.js";')
    .replaceAll('from "./urlState";', 'from "./urlState.js";')
    .replaceAll(
      'from "./genericSetPageState";',
      'from "./genericSetPageState.js";'
    )
    .replaceAll(
      'from "./genericSetPageTransitions";',
      'from "./genericSetPageTransitions.js";'
    );
}

async function prepareTempModules() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "set-visualizer-tests-"));
  const tempSrc = path.join(tempRoot, "src");
  await mkdir(tempSrc, { recursive: true });

  const files = [
    "setData.js",
    "setUtils.js",
    "genericSetPageHelpers.js",
    "urlState.js",
    "genericSetPageState.js",
    "genericSetPageTransitions.js",
  ];

  await Promise.all(
    files.map(async (fileName) => {
      const source = await readFile(path.join(SRC_ROOT, fileName), "utf8");
      const content =
        fileName === "setData.js" ? source : patchImports(source);
      await writeFile(path.join(tempSrc, fileName), content, "utf8");
    })
  );

  const [setData, setUtils, helpers, urlState, genericSetPageState, genericSetPageTransitions] = await Promise.all([
    import(pathToFileURL(path.join(tempSrc, "setData.js")).href),
    import(pathToFileURL(path.join(tempSrc, "setUtils.js")).href),
    import(pathToFileURL(path.join(tempSrc, "genericSetPageHelpers.js")).href),
    import(pathToFileURL(path.join(tempSrc, "urlState.js")).href),
    import(pathToFileURL(path.join(tempSrc, "genericSetPageState.js")).href),
    import(pathToFileURL(path.join(tempSrc, "genericSetPageTransitions.js")).href),
  ]);

  return {
    setData,
    setUtils,
    helpers,
    urlState,
    genericSetPageState,
    genericSetPageTransitions,
  };
}

export function loadSourceModules() {
  if (!modulesPromise) {
    modulesPromise = prepareTempModules();
  }

  return modulesPromise;
}
