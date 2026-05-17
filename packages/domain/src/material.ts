export interface MaterialSheet {
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface MaterialCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sheet: MaterialSheet;
  readonly thicknessMm: number;
  readonly priceCentsPerSheet: number;
  readonly currency: "USD";
}
