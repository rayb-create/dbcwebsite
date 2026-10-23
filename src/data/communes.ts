/**
 * Official Algerian Administrative Divisions Dataset (Law 26-06 / JO N°25)
 * Source: Official Algerian Administrative Organization
 * Hierarchy: Wilaya (01..69) -> Daïra (548) -> Commune (1,541)
 * Verified coverage: All 69 wilayas and 1,541 municipalities with French/Latin & Arabic names.
 */

import rawData from './algeriaAdministrative.json';

export interface AdministrativeCommuneRaw {
  id: number;
  commune_name_ascii: string;
  commune_name: string;
  daira_name_ascii: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name_ascii: string;
  wilaya_name: string;
}

export interface AdministrativeCommune {
  id: number;
  nameAscii: string;
  nameAr: string;
  dairaAscii: string;
  dairaAr: string;
  wilayaCode: string;
  wilayaNameAscii: string;
  wilayaNameAr: string;
}

export interface AdministrativeDaira {
  nameAscii: string;
  nameAr: string;
  wilayaCode: string;
  communesCount: number;
}

// Convert raw records into strongly-typed AdministrativeCommune objects
const ALL_COMMUNES: AdministrativeCommune[] = (rawData as AdministrativeCommuneRaw[]).map((r) => ({
  id: r.id,
  nameAscii: r.commune_name_ascii,
  nameAr: r.commune_name,
  dairaAscii: r.daira_name_ascii,
  dairaAr: r.daira_name,
  wilayaCode: r.wilaya_code.padStart(2, '0'),
  wilayaNameAscii: r.wilaya_name_ascii,
  wilayaNameAr: r.wilaya_name,
}));

// Pre-index by wilaya code and composite keys for O(1) performance
const COMMUNES_BY_WILAYA = new Map<string, AdministrativeCommune[]>();
const DAIRAS_BY_WILAYA = new Map<string, AdministrativeDaira[]>();
const COMMUNE_BY_ID = new Map<number, AdministrativeCommune>();

for (const c of ALL_COMMUNES) {
  COMMUNE_BY_ID.set(c.id, c);

  // Group by Wilaya
  if (!COMMUNES_BY_WILAYA.has(c.wilayaCode)) {
    COMMUNES_BY_WILAYA.set(c.wilayaCode, []);
  }
  COMMUNES_BY_WILAYA.get(c.wilayaCode)!.push(c);
}

// Build Daïras grouped by Wilaya
for (const [code, commList] of COMMUNES_BY_WILAYA.entries()) {
  const dairaMap = new Map<string, { nameAscii: string; nameAr: string; count: number }>();
  for (const c of commList) {
    if (!dairaMap.has(c.dairaAscii)) {
      dairaMap.set(c.dairaAscii, { nameAscii: c.dairaAscii, nameAr: c.dairaAr, count: 0 });
    }
    dairaMap.get(c.dairaAscii)!.count++;
  }

  const dairas: AdministrativeDaira[] = Array.from(dairaMap.values())
    .map((d) => ({
      nameAscii: d.nameAscii,
      nameAr: d.nameAr,
      wilayaCode: code,
      communesCount: d.count,
    }))
    .sort((a, b) => a.nameAscii.localeCompare(b.nameAscii));

  DAIRAS_BY_WILAYA.set(code, dairas);
}

/**
 * Returns all 1,541 verified Algerian communes
 */
export function getAllCommunes(): AdministrativeCommune[] {
  return ALL_COMMUNES;
}

/**
 * Returns all daïras belonging to a specific wilaya (01 to 69)
 */
export function getDairasForWilaya(wilayaCode: string): AdministrativeDaira[] {
  const code = wilayaCode.padStart(2, '0');
  return DAIRAS_BY_WILAYA.get(code) || [];
}

/**
 * Returns communes for a wilaya, optionally filtered by daïra
 */
export function getCommunesForWilaya(
  wilayaCode: string,
  dairaNameAscii?: string
): AdministrativeCommune[] {
  const code = wilayaCode.padStart(2, '0');
  const allInWilaya = COMMUNES_BY_WILAYA.get(code) || [];

  if (dairaNameAscii && dairaNameAscii.trim() !== '') {
    const trimmed = dairaNameAscii.trim().toLowerCase();
    return allInWilaya
      .filter((c) => c.dairaAscii.toLowerCase() === trimmed || c.dairaAr === dairaNameAscii.trim())
      .sort((a, b) => a.nameAscii.localeCompare(b.nameAscii));
  }

  return [...allInWilaya].sort((a, b) => a.nameAscii.localeCompare(b.nameAscii));
}

/**
 * Returns simple string array of commune names for a wilaya (for backwards compatibility)
 */
export function getCommuneNamesForWilaya(
  wilayaCode: string,
  dairaNameAscii?: string,
  isArabic: boolean = false
): string[] {
  const list = getCommunesForWilaya(wilayaCode, dairaNameAscii);
  return list.map((c) => (isArabic ? c.nameAr : c.nameAscii));
}

/**
 * Find commune by ID
 */
export function getCommuneById(id: number): AdministrativeCommune | undefined {
  return COMMUNE_BY_ID.get(id);
}

/**
 * Find commune by name and wilaya code
 */
export function findCommune(
  name: string,
  wilayaCode?: string
): AdministrativeCommune | undefined {
  if (!name) return undefined;
  const search = name.trim().toLowerCase();
  const code = wilayaCode ? wilayaCode.padStart(2, '0') : undefined;

  return ALL_COMMUNES.find((c) => {
    if (code && c.wilayaCode !== code) return false;
    return (
      c.nameAscii.toLowerCase() === search ||
      c.nameAr === name.trim() ||
      `${c.nameAscii} (${c.nameAr})`.toLowerCase() === search
    );
  });
}

/**
 * Backward compatibility: Record mapping Wilaya codes to list of Latin commune names
 */
export const WILAYA_COMMUNES: Record<string, string[]> = Object.fromEntries(
  Array.from(COMMUNES_BY_WILAYA.entries()).map(([code, list]) => [
    code,
    list.map((c) => c.nameAscii).sort((a, b) => a.localeCompare(b)),
  ])
);
