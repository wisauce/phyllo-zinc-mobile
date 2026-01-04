// Virtual Lab Scene Components
export { default as DraggableItem } from './draggable-item';
export { default as DropZone } from './drop-zone';
export { default as SceneCollectLeaves } from './scene-collect-leaves';
export { default as SceneFilter } from './scene-filter';
export { default as SceneFinalMix } from './scene-final-mix';
export { default as SceneGrind } from './scene-grind';
export { default as SceneHotMaceration } from './scene-hot-maceration';
export { default as SceneMakeZinc } from './scene-make-zinc';
export { default as SceneMixSolvent } from './scene-mix-solvent';

// Scene names in order
export const SCENE_ORDER = [
  'collect-leaves',
  'grind',
  'mix-solvent',
  'hot-maceration',
  'filter',
  'make-zinc',
  'final-mix',
] as const;

export type SceneId = typeof SCENE_ORDER[number];

export const SCENE_TITLES: Record<SceneId, string> = {
  'collect-leaves': 'Collect Leaves',
  'grind': 'Grind Leaves',
  'mix-solvent': 'Mix Solvent',
  'hot-maceration': 'Hot Maceration',
  'filter': 'Filter Extract',
  'make-zinc': 'Make Zinc NP',
  'final-mix': 'Final Mix',
};

export const SCENE_DESCRIPTIONS: Record<SceneId, string> = {
  'collect-leaves': 'Collect 5 Phyllanthus niruri leaves for extraction',
  'grind': 'Grind the collected leaves into a fine powder',
  'mix-solvent': 'Add ethanol solvent to the ground leaves',
  'hot-maceration': 'Heat the mixture to extract bioactive compounds',
  'filter': 'Filter the extract to remove solid particles',
  'make-zinc': 'Synthesize zinc oxide nanoparticles',
  'final-mix': 'Combine ZnO NPs with plant extract for final product',
};
