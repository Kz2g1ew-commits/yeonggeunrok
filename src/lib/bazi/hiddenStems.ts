import type { HiddenStem } from "@/types/bazi";
import { STEMS } from "./stems";

const h = (stem: string, role: HiddenStem["role"], weight: number): HiddenStem => ({
  stem,
  element: STEMS[stem].element,
  role,
  weight,
});

export const HIDDEN_STEMS: Record<string, HiddenStem[]> = {
  子: [h("癸", "main", 1.5)],
  丑: [h("己", "main", 1.5), h("癸", "middle", 1), h("辛", "residual", 0.5)],
  寅: [h("甲", "main", 1.5), h("丙", "middle", 1), h("戊", "residual", 0.5)],
  卯: [h("乙", "main", 1.5)],
  辰: [h("戊", "main", 1.5), h("乙", "middle", 1), h("癸", "residual", 0.5)],
  巳: [h("丙", "main", 1.5), h("戊", "middle", 1), h("庚", "residual", 0.5)],
  午: [h("丁", "main", 1.5), h("己", "middle", 1)],
  未: [h("己", "main", 1.5), h("丁", "middle", 1), h("乙", "residual", 0.5)],
  申: [h("庚", "main", 1.5), h("壬", "middle", 1), h("戊", "residual", 0.5)],
  酉: [h("辛", "main", 1.5)],
  戌: [h("戊", "main", 1.5), h("辛", "middle", 1), h("丁", "residual", 0.5)],
  亥: [h("壬", "main", 1.5), h("甲", "middle", 1)],
};
