export interface Disclosure {
  id: string;
  label: string;
  required: boolean;
  description: string;
  condition?: "pre_1978";
}

export interface StateRequirements {
  state: string;
  stateName: string;
  disclosures: Disclosure[];
  notes: string;
  formReference: string;
}

export const STATE_REQUIREMENTS: Record<string, StateRequirements> = {
  CA: {
    state: "CA",
    stateName: "California",
    disclosures: [
      {
        id: "ca_tds",
        label: "Transfer Disclosure Statement (TDS)",
        required: true,
        description:
          "Required for most residential property transfers in California.",
      },
      {
        id: "ca_nhd",
        label: "Natural Hazard Disclosure",
        required: true,
        description:
          "Discloses whether property is in a natural hazard zone (flood, fire, earthquake, etc.).",
      },
      {
        id: "ca_agency",
        label: "Agency Disclosure",
        required: true,
        description:
          "Discloses the agency relationship between the agent and buyer/seller.",
      },
      {
        id: "ca_lead_paint",
        label: "Lead Paint Disclosure (pre-1978)",
        required: true,
        description:
          "Federal requirement for properties built before 1978.",
        condition: "pre_1978",
      },
      {
        id: "ca_mello_roos",
        label: "Mello-Roos Disclosure",
        required: true,
        description:
          "Discloses any Mello-Roos community facilities district taxes.",
      },
    ],
    notes:
      "California requires additional disclosures. See DRE guidelines.",
    formReference: "California DRE",
  },
  CO: {
    state: "CO",
    stateName: "Colorado",
    disclosures: [
      {
        id: "co_spd",
        label: "Seller's Property Disclosure",
        required: true,
        description:
          "Comprehensive disclosure of known property conditions.",
      },
      {
        id: "co_lead_paint",
        label: "Lead Paint Disclosure (pre-1978)",
        required: true,
        description:
          "Federal requirement for properties built before 1978.",
        condition: "pre_1978",
      },
      {
        id: "co_water",
        label: "Source of Water Disclosure",
        required: true,
        description:
          "Discloses the source and legal right to water on the property.",
      },
      {
        id: "co_sqft",
        label: "Square Footage Disclosure",
        required: true,
        description:
          "Discloses how square footage was measured and by whom.",
      },
    ],
    notes: "Colorado contracts follow CREC approved forms.",
    formReference: "CREC",
  },
  FL: {
    state: "FL",
    stateName: "Florida",
    disclosures: [
      {
        id: "fl_seller",
        label: "Seller's Disclosure",
        required: true,
        description:
          "General property condition disclosure by the seller.",
      },
      {
        id: "fl_lead_paint",
        label: "Lead Paint Disclosure (pre-1978)",
        required: true,
        description:
          "Federal requirement for properties built before 1978.",
        condition: "pre_1978",
      },
      {
        id: "fl_radon",
        label: "Radon Gas Disclosure",
        required: true,
        description:
          "Required by Florida law for all residential transactions.",
      },
      {
        id: "fl_hoa",
        label: "Homeowners Association Disclosure",
        required: true,
        description:
          "Discloses HOA membership requirements, fees, and restrictions.",
      },
      {
        id: "fl_energy",
        label: "Energy Efficiency Disclosure",
        required: true,
        description:
          "Provides information about the energy performance of the property.",
      },
    ],
    notes:
      "Florida requires additional disclosures per FL Statutes Ch. 689.",
    formReference: "FL Statutes Ch. 689",
  },
};

const DEFAULT_REQUIREMENTS: StateRequirements = {
  state: "",
  stateName: "Other",
  disclosures: [
    {
      id: "generic_lead_paint",
      label: "Lead Paint Disclosure (pre-1978)",
      required: true,
      description:
        "Federal requirement for properties built before 1978.",
      condition: "pre_1978",
    },
    {
      id: "generic_seller",
      label: "Seller's Property Disclosure",
      required: false,
      description:
        "General property condition disclosure (requirements vary by state).",
    },
  ],
  notes:
    "State-specific forms coming soon. Contact support for assistance.",
  formReference: "General",
};

export function getStateRequirements(state: string): StateRequirements {
  const upper = state?.toUpperCase();
  return (
    STATE_REQUIREMENTS[upper] || {
      ...DEFAULT_REQUIREMENTS,
      state: upper,
    }
  );
}
