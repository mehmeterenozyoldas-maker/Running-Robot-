export type Vector3Array = [number, number, number];

export type Mode = 'SIM' | 'DESIGN';
export type ToolType = 'TREE' | 'ROCK' | 'CRYSTAL' | 'MUSHROOM' | 'LAMP' | 'BUSH' | 'FENCE';

export type CameraView = 'DEFAULT' | 'TOP_DOWN' | 'SIDE' | 'POV';
export type WeatherType = 'CLEAR' | 'RAIN';

export interface SceneObject {
  id: string;
  type: ToolType;
  position: Vector3Array;
  rotation: Vector3Array;
  scale: number;
}

export interface IslandProps {
  mode: Mode;
  activeTool: ToolType;
  objects: SceneObject[];
  onAddObject: (obj: SceneObject) => void;
  snapToGrid: boolean;
}

export interface RunnerProps {
  paused: boolean;
}