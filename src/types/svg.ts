export interface SvgLayer {
  id: string;
  type: string;
  name: string;
  element: string;
  order: number;
  visible: boolean;
}

export interface SvgLayerUpdate {
  layers: SvgLayer[];
  svg: string;
}

