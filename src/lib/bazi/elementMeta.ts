import type { Element } from "@/types/bazi";

export const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];

export const ELEMENT_META: Record<Element, { label: string; hanja: string; icon: string; color: string }> = {
  wood: { label: "목", hanja: "木", icon: "새싹", color: "#62c6a5" },
  fire: { label: "화", hanja: "火", icon: "불꽃", color: "#f47d6d" },
  earth: { label: "토", hanja: "土", icon: "산", color: "#d6a85f" },
  metal: { label: "금", hanja: "金", icon: "검", color: "#b9c7d9" },
  water: { label: "수", hanja: "水", icon: "물결", color: "#6daeea" },
};

export const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

export const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

export function generatorOf(element: Element): Element {
  return ELEMENTS.find((candidate) => GENERATES[candidate] === element)!;
}

export function controllerOf(element: Element): Element {
  return ELEMENTS.find((candidate) => CONTROLS[candidate] === element)!;
}
