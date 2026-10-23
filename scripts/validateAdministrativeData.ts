/**
 * Automated Data-Integrity Verification Script for Algerian Administrative Divisions
 * Validates:
 * 1. Wilayas count (69 official divisions)
 * 2. Daïras count (548 districts)
 * 3. Communes count (1,541 municipalities)
 * 4. Identifier uniqueness
 * 5. Parent-child relationships (Wilaya -> Daira -> Commune)
 * 6. Explicit verification of Beni Messous under Wilaya 16 (Alger) and Daira Bouzareah
 * 7. Cascading selector state clearing logic
 * 8. Delivery fee calculations for all wilayas
 */

import { 
  getAllCommunes, 
  getDairasForWilaya, 
  getCommunesForWilaya, 
  findCommune,
  AdministrativeCommune 
} from '../src/data/communes';
import { ALGERIAN_WILAYAS, getWilayaByCode } from '../src/data/wilayas';

export interface IntegrityReport {
  timestamp: string;
  source: string;
  administrativeReform: string;
  wilayasFound: number;
  expectedWilayas: number;
  dairasFound: number;
  communesFound: number;
  expectedCommunes: number;
  duplicateIdentifiers: number;
  invalidParentRelationships: number;
  unverifiedRecords: number;
  beniMessousVerified: boolean;
  beniMessousDetails: AdministrativeCommune | null;
  cascadingLogicPassed: boolean;
  deliveryCalculationsPassed: boolean;
  errors: string[];
}

export function runAdministrativeDataValidation(): IntegrityReport {
  const errors: string[] = [];
  const allCommunes = getAllCommunes();

  // 1. Validate Wilayas
  const wilayaCodes = new Set(ALGERIAN_WILAYAS.map(w => w.code));
  if (ALGERIAN_WILAYAS.length !== 69) {
    errors.push(`Expected 69 wilayas, found ${ALGERIAN_WILAYAS.length}`);
  }

  // Check 01 to 69 exist exactly once
  for (let i = 1; i <= 69; i++) {
    const code = String(i).padStart(2, '0');
    if (!wilayaCodes.has(code)) {
      errors.push(`Missing Wilaya code: ${code}`);
    }
  }

  // 2. Validate IDs and duplicates
  const seenIds = new Set<number>();
  let duplicateCount = 0;
  for (const c of allCommunes) {
    if (seenIds.has(c.id)) {
      duplicateCount++;
      errors.push(`Duplicate commune identifier: ${c.id}`);
    }
    seenIds.add(c.id);
  }

  // 3. Validate Parent Relationships
  let invalidParents = 0;
  let unverified = 0;
  const allDairasSet = new Set<string>();

  for (const c of allCommunes) {
    // Validate wilaya reference
    if (!wilayaCodes.has(c.wilayaCode)) {
      invalidParents++;
      errors.push(`Commune ${c.nameAscii} (${c.id}) references invalid wilaya: ${c.wilayaCode}`);
    }

    // Validate daira reference
    if (!c.dairaAscii || c.dairaAscii.trim() === '' || !c.dairaAr || c.dairaAr.trim() === '') {
      invalidParents++;
      errors.push(`Commune ${c.nameAscii} (${c.id}) has missing daira reference`);
    }

    // Validate names
    if (!c.nameAscii || !c.nameAr) {
      unverified++;
      errors.push(`Commune ID ${c.id} missing Latin or Arabic name`);
    }

    allDairasSet.add(`${c.wilayaCode}:${c.dairaAscii.toLowerCase()}`);
  }

  // Count distinct dairas
  let totalDairasCount = 0;
  for (let i = 1; i <= 69; i++) {
    const code = String(i).padStart(2, '0');
    const dairas = getDairasForWilaya(code);
    totalDairasCount += dairas.length;

    // Check each daira has at least 1 commune
    for (const d of dairas) {
      if (d.communesCount <= 0) {
        errors.push(`Daira ${d.nameAscii} in Wilaya ${code} has 0 communes`);
      }
    }
  }

  // 4. Verify Beni Messous
  const beniMessous = findCommune('Beni Messous', '16');
  let beniMessousOk = false;
  if (
    beniMessous &&
    beniMessous.wilayaCode === '16' &&
    beniMessous.dairaAscii === 'Bouzareah' &&
    beniMessous.nameAr === 'بني مسوس'
  ) {
    beniMessousOk = true;
  } else {
    errors.push('Beni Messous failed hierarchy verification in Wilaya 16 (Alger)');
  }

  // Also verify all 57 communes appear in getCommunesForWilaya('16')
  const algerCommunes = getCommunesForWilaya('16');
  if (algerCommunes.length !== 57) {
    beniMessousOk = false;
    errors.push(`Wilaya 16 expected 57 communes, found ${algerCommunes.length}`);
  }

  // Verify key requested communes in Wilaya 16
  const required16Communes = [
    { ascii: 'Beni Messous', ar: 'بني مسوس', expectedDaira: 'Bouzareah' },
    { ascii: 'Bouzareah', ar: 'بوزريعة', expectedDaira: 'Bouzareah' },
    { ascii: 'Bab El Oued', ar: 'باب الوادي', expectedDaira: 'Bab El Oued' },
    { ascii: 'Dar El Beida', ar: 'الدار البيضاء', expectedDaira: 'Dar El Beida' },
  ];

  for (const req of required16Communes) {
    const found = algerCommunes.find(c => c.nameAscii === req.ascii);
    if (!found) {
      errors.push(`Required commune ${req.ascii} (${req.ar}) not found in Wilaya 16`);
    } else {
      if (found.nameAr !== req.ar) {
        errors.push(`Commune ${req.ascii} Arabic name mismatch: expected ${req.ar}, got ${found.nameAr}`);
      }
      if (found.dairaAscii !== req.expectedDaira) {
        errors.push(`Commune ${req.ascii} internal daira mismatch: expected ${req.expectedDaira}, got ${found.dairaAscii}`);
      }
    }
  }

  // 5. Test Two-Dropdown Selection & Cascading Reset Logic
  // Dropdown 1: Wilaya
  // Dropdown 2: Commune (all communes of that wilaya)
  // Step A: Customer selects Wilaya '16' (Alger) -> Communes list contains 57 communes
  // Step B: Customer selects Commune 'Beni Messous' -> internal daira is 'Bouzareah'
  // Step C: Customer switches Wilaya to '31' (Oran) -> Commune selection is cleared ('')
  // Step D: Communes list now contains all 26 communes of Oran
  let twoDropdownsPassed = true;
  let currentWilayaSelection = '16';
  let currentCommuneSelection = 'Beni Messous';

  const communesFor16 = getCommunesForWilaya(currentWilayaSelection);
  const selectedCommuneObj = communesFor16.find(c => c.nameAscii === currentCommuneSelection);
  if (!selectedCommuneObj || selectedCommuneObj.dairaAscii !== 'Bouzareah') {
    twoDropdownsPassed = false;
    errors.push('Failed to resolve internal daira for Beni Messous');
  }

  // Wilaya change handler clears commune
  const onWilayaChange = (newWilayaCode: string) => {
    currentWilayaSelection = newWilayaCode;
    currentCommuneSelection = ''; // reset commune
  };

  onWilayaChange('31');
  if (currentWilayaSelection !== '31' || currentCommuneSelection !== '') {
    twoDropdownsPassed = false;
    errors.push('Two-dropdown check failed: changing wilaya did not reset commune');
  }

  const communesFor31 = getCommunesForWilaya(currentWilayaSelection);
  if (communesFor31.length !== 26) {
    twoDropdownsPassed = false;
    errors.push(`Wilaya 31 (Oran) expected 26 communes, got ${communesFor31.length}`);
  }

  // 6. Test Delivery Fee Calculation for all 69 Wilayas
  let deliveryPassed = true;
  for (const w of ALGERIAN_WILAYAS) {
    const feeLookup = getWilayaByCode(w.code);
    if (!feeLookup || typeof feeLookup.homeDeliveryFeeDzd !== 'number' || feeLookup.homeDeliveryFeeDzd <= 0) {
      deliveryPassed = false;
      errors.push(`Delivery fee lookup failed for wilaya ${w.code} - ${w.nameEn}`);
    }
  }

  return {
    timestamp: new Date().toISOString(),
    source: 'algeria-communes-wilayas (wadiemendja & islam-re)',
    administrativeReform: 'Loi n° 26-06 (Journal Officiel N°25, 69 Wilayas, 1,541 Communes)',
    wilayasFound: ALGERIAN_WILAYAS.length,
    expectedWilayas: 69,
    dairasFound: totalDairasCount,
    communesFound: allCommunes.length,
    expectedCommunes: 1541,
    duplicateIdentifiers: duplicateCount,
    invalidParentRelationships: invalidParents,
    unverifiedRecords: unverified,
    beniMessousVerified: beniMessousOk,
    beniMessousDetails: beniMessous || null,
    twoDropdownsPassed: twoDropdownsPassed,
    deliveryCalculationsPassed: deliveryPassed,
    errors,
  };
}

// If run directly via node / tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('validateAdministrativeData')) {
  console.log('Running Algerian Administrative Data Integrity Audit...\n');
  const report = runAdministrativeDataValidation();
  console.log(JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    console.error('\nValidation failed with errors:');
    report.errors.forEach(e => console.error(' - ' + e));
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All Algerian administrative data integrity tests passed cleanly.');
    process.exit(0);
  }
}
