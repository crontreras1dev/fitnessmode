// Replace every bracketed value with the real one before launch. These are
// referenced by the legal documents in src/content/legal so real values only
// need to be swapped in here once.
export const legalConfig = {
  operatorName: "[Operator legal name]",
  contactEmail: "[privacy@yourdomain.com]",
  governingLaw: "[State], United States",
  effectiveDate: "[Effective date]",
} as const;
