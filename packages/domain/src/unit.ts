export type Unit = "mm" | "cm" | "in";

export const UNITS = ["mm", "cm", "in"] as const satisfies readonly Unit[];
