/**
 * Retailer prefixes for model profiles.
 * Maps profile name prefixes (lowercase) to the model name pattern to match.
 */
export const retailerPrefixes = {
  asda: 'ASDA',
  giovanni: 'Giovanni',
  iceland: 'Iceland',
  mands: 'MANDS',
  nisa: 'NISA',
  sainsburys: 'Sainsburys',
  savers: 'Savers',
  tesco: 'Tesco',
  tjmorris: 'TJMorris',
  coop: 'Coop',
  buffaload: 'Buffaload',
  booker: 'Booker',
  mars: 'Mars',
  kepak: 'Kepak',
  fowlerwelch: 'FowlerWelch',
  turners: 'Turners',
  bandm: 'BANDM',
  cds: 'CDS',
  fw: 'FW',
  gousto: 'Gousto',
  nutricia: 'Nutricia',
  warrens: 'Warrens',
  burbank: 'Burbank',
  bandr: 'BandR'
}

/**
 * Parse a profile string to extract retailer and optional model number.
 * Examples: 'asda3' -> { retailer: 'ASDA', model: '3' }
 *           'asda' -> { retailer: 'ASDA', model: null }
 * @param {string} profile - The profile string (lowercase)
 * @returns {{ retailer: string, model: string|null }|null}
 */
export function parseModelProfile(profile) {
  if (!profile) return null

  // Check each retailer prefix to find a match
  for (const [key, retailer] of Object.entries(retailerPrefixes)) {
    if (profile.startsWith(key)) {
      const remainder = profile.slice(key.length)
      // Remainder should be empty or a number
      if (remainder === '' || /^\d+$/.test(remainder)) {
        return {
          retailer,
          model: remainder || null
        }
      }
    }
  }

  return null
}

/**
 * Check if a profile is a model profile (retailer or retailer+model number).
 * Examples: 'asda', 'asda3', 'sainsburys1'
 * @param {string} profile - The profile string (lowercase)
 * @returns {boolean}
 */
export function isModelProfile(profile) {
  return parseModelProfile(profile) !== null
}

/**
 * Get specs to run based on PROFILE environment variable.
 * Profiles allow running subsets of tests from CDP Portal.
 *
 * Available profiles:
 * - 'connectivity-check': Run only connectivity check test
 * - 'asda', 'asda1', 'asda2', 'asda3', etc.: Run only packing list tests for that retailer/model
 * - 'giovanni', 'iceland', 'mands', 'nisa', 'sainsburys' (with optional model number)
 * - undefined/default: Run all tests
 *
 * @returns {string[]} Array of spec file patterns to run
 */
export function getSpecs() {
  const profile = process.env.PROFILE?.toLowerCase()

  switch (profile) {
    case 'connectivity-check':
      // Connectivity check only
      return ['./test/specs/connectivity-check.e2e.js']
    default:
      // Model profiles run only packing list tests (filtering happens in getTestCases)
      if (isModelProfile(profile)) {
        return ['./test/specs/process-packing-list.e2e.js']
      }
      // Run all tests
      return ['./test/specs/**/*.e2e.js']
  }
}
