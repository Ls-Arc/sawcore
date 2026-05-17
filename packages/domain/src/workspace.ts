import type { CabinetSetup } from "./cabinet-setup.js";

export interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly cabinetSetup: CabinetSetup;
  readonly selectedMaterialId?: string;
}
