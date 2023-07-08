const NO_UNIQUE_HOMES_CONSTRAINT_KEY = 'NO_UNIQUE_HOMES_CONSTRAINT';
const NO_GOALS_IMMOVABLE_CONSTRAINT = 'NO_GOALS_IMMOVABLE_CONSTRAINT';
const NO_HOME_IMMOVABLE_CONSTRAINT = 'NO_HOME_IMMOVABLE_CONSTRAINT';

export function enforceUniqueHomes(): boolean {
  return !process.env[NO_UNIQUE_HOMES_CONSTRAINT_KEY];
}

export function enforceGoalImmovability(): boolean {
  return !process.env[NO_GOALS_IMMOVABLE_CONSTRAINT];
}

export function enforceHomeImmovability(): boolean {
  return !process.env[NO_HOME_IMMOVABLE_CONSTRAINT];
}
