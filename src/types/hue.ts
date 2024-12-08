export interface HueMessage {
  creationtime: string;
  data: HueMessageData[];
  id: string;
  type: string;
}

export interface HueColor {
  xy: { x: number; y: number };
}

export interface HueMessageData {
  color: HueColor;
  id: string;
  id_v1: string;
  type: string;
}