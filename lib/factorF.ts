export interface FactorReferenceRow {
  cost_million: number;
  factor: number;
}

export interface FactorCalculationResult {
  factor: number;
  raw: number;
  lowerCost: number;
  upperCost: number;
  lowerValue: number;
  upperValue: number;
  exactMatch: boolean;
}

export interface FactorSnapshotData {
  factor_f: number | null;
  factor_f_lower_cost: number | null;
  factor_f_upper_cost: number | null;
  factor_f_lower_value: number | null;
  factor_f_upper_value: number | null;
}

export function truncateFactor(value: number): number {
  return Math.floor(value * 10000) / 10000;
}

export function isFactorSnapshotUsable(
  totalCost: number,
  snapshot: FactorSnapshotData,
): boolean {
  if (
    snapshot.factor_f == null ||
    snapshot.factor_f_lower_cost == null ||
    snapshot.factor_f_upper_cost == null ||
    snapshot.factor_f_lower_value == null ||
    snapshot.factor_f_upper_value == null ||
    snapshot.factor_f <= 0 ||
    snapshot.factor_f_lower_cost <= 0 ||
    snapshot.factor_f_upper_cost <= 0 ||
    snapshot.factor_f_lower_value <= 0 ||
    snapshot.factor_f_upper_value <= 0
  ) {
    return false;
  }

  if (snapshot.factor_f_lower_cost > totalCost) {
    return false;
  }

  if (snapshot.factor_f_upper_cost > snapshot.factor_f_lower_cost) {
    return totalCost < snapshot.factor_f_upper_cost;
  }

  return totalCost <= snapshot.factor_f_lower_cost;
}

export function calculateInterpolatedFactorFromRefs(
  totalCost: number,
  lowerRef: FactorReferenceRow | null,
  upperRef: FactorReferenceRow | null,
): FactorCalculationResult | null {
  if (totalCost <= 0 || !lowerRef) return null;

  const A = totalCost / 1000000;
  const B = Number(lowerRef.cost_million);
  const D = Number(lowerRef.factor);

  if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(D)) {
    return null;
  }

  const fallbackResult = {
    factor: D,
    raw: D,
    lowerCost: B * 1000000,
    upperCost: B * 1000000,
    lowerValue: D,
    upperValue: D,
    exactMatch: true,
  };

  if (!upperRef || A <= B) return fallbackResult;

  const C = Number(upperRef.cost_million);
  const E = Number(upperRef.factor);

  if (!Number.isFinite(C) || !Number.isFinite(E) || C <= B) {
    return null;
  }

  if (A >= C) {
    return {
      factor: E,
      raw: E,
      lowerCost: B * 1000000,
      upperCost: C * 1000000,
      lowerValue: D,
      upperValue: E,
      exactMatch: true,
    };
  }

  const raw = D - ((D - E) * (A - B) / (C - B));
  const factor = truncateFactor(raw);

  return {
    factor,
    raw,
    lowerCost: B * 1000000,
    upperCost: C * 1000000,
    lowerValue: D,
    upperValue: E,
    exactMatch: Math.abs(raw - factor) < 0.000000001,
  };
}
