# Natural Hazard Disclosure (NHD)

> **Primary Authority:** California Civil Code Sections 1103 - 1103.14
> **Related Statutes:** Government Code 8589.3, 8589.4, 51175-51189; Public Resources Code 2621-2630, 2690-2699.6
> **C.A.R. Form:** NHD (Natural Hazard Disclosure Statement)
> **Also Known As:** Natural Hazards Disclosure Act

---

## Overview

The Natural Hazards Disclosure Act requires that sellers and their agents disclose whether a property is located within one or more state or locally mapped natural hazard zones. This is a statutory requirement separate from the Transfer Disclosure Statement (TDS).

---

## Applicability

### Transactions Covered (Civil Code 1103)
Same scope as TDS -- applies to transfers of residential real property of one to four dwelling units by sale, exchange, lease with option to purchase, real property sales contract, ground lease coupled with improvements, or any other option to purchase.

### Exemptions (Civil Code 1103.1)
Same exemptions as TDS (Civil Code 1102.2):
- Court-ordered sales, foreclosures, bankruptcy, government transfers, etc.

---

## Six Mandatory Hazard Zone Disclosures

The NHD Statement must address whether the property is located within each of the following six hazard zones:

### 1. Special Flood Hazard Area (Zone A or Zone V)
- **Authority:** Government Code 8589.3; National Flood Insurance Act of 1968
- **Maps:** FEMA Flood Insurance Rate Maps (FIRMs)
- **Definition:** Areas with a 1% or greater annual chance of flooding (100-year flood plain)
- **Disclosure Required:** Whether the property is in any type Zone A or Zone V

### 2. Area of Potential Flooding (Dam Inundation Zone)
- **Authority:** Government Code 8589.4; Water Code 6160-6161
- **Maps:** Dam inundation maps prepared pursuant to Water Code 6161
- **Definition:** Areas that could be flooded in the event of a dam failure
- **Disclosure Required:** Whether the property is within a mapped dam inundation area

### 3. Very High Fire Hazard Severity Zone
- **Authority:** Government Code 51175-51189 (specifically 51183.5)
- **Maps:** CAL FIRE Fire Hazard Severity Zone maps for Local Responsibility Areas (LRA)
- **Definition:** Areas designated by CAL FIRE as very high fire hazard severity
- **Disclosure Required:** Whether property is in a very high fire hazard severity zone designated by the local agency

### 4. Wildland Area That May Contain Substantial Forest Fire Risks and Hazards
- **Authority:** Public Resources Code 4125-4136
- **Maps:** State Responsibility Area (SRA) fire hazard maps
- **Definition:** State Responsibility Areas with fire hazard
- **Disclosure Required:** Whether property is within a wildland fire area (state responsibility)

### 5. Earthquake Fault Zone
- **Authority:** Public Resources Code 2621-2630 (Alquist-Priolo Earthquake Fault Zoning Act)
- **Maps:** California Geological Survey Earthquake Fault Zone maps
- **Definition:** Areas within approximately 500 feet of an active fault trace
- **Disclosure Required:** Whether property is within a delineated Alquist-Priolo Earthquake Fault Zone

### 6. Seismic Hazard Zone
- **Authority:** Public Resources Code 2690-2699.6 (Seismic Hazards Mapping Act)
- **Maps:** California Geological Survey Seismic Hazard Zone maps
- **Definition:** Areas susceptible to liquefaction or earthquake-induced landslides
- **Disclosure Required:** Whether property is within a mapped seismic hazard zone (liquefaction or landslide zone)

---

## NHD Statement Form (Civil Code 1103.2)

### Required Format
The Natural Hazard Disclosure Statement must be in the form prescribed by Civil Code 1103.2, which includes:
- A checklist for each of the six hazard zones (Yes/No/Not mapped)
- Signature lines for seller, seller's agent, and buyer
- Date of completion

### Marking Guidelines
- **"Yes"** -- The property IS within the hazard zone
- **"No"** -- The property is NOT within the hazard zone (expert report may be required)
- **Ambiguous determinations:** If a map is not of sufficient accuracy or scale for a reasonable person to determine the property's location relative to the zone, the answer must be "Yes" UNLESS an expert report verifies otherwise

---

## Who Must Disclose

### Seller's Duty
- The seller must sign the NHD Statement
- Seller may rely on a third-party NHD report

### Agent's Duty
- Both listing and selling agents must disclose actual knowledge of hazard zone locations
- Agents may rely on a third-party NHD report to satisfy their disclosure obligation

### Third-Party NHD Companies
Sellers and agents may engage a licensed professional or NHD disclosure company to prepare the report. Common NHD providers include companies that specialize in mapping and disclosure services.

**Qualified experts (Civil Code 1103.4):**
- Licensed engineer
- Licensed land surveyor
- Licensed geologist
- Expert in natural hazard discovery

---

## Delivery Requirements

### Timing (Civil Code 1103.3)
- Must be delivered **as soon as practicable before transfer of title**
- Same timing requirements as TDS

### Rescission Rights
If delivered after execution of the purchase offer:

| Delivery Method | Rescission Period |
|---|---|
| In person | 3 calendar days |
| By mail | 5 calendar days |
| Electronic delivery | 5 calendar days |

---

## Liability and Safe Harbor (Civil Code 1103.4, 1103.12, 1103.13)

### Liability for Non-Disclosure
Any person who willfully or negligently violates this article is liable for actual damages suffered by the transferee (Civil Code 1103.13).

### Safe Harbor Provision (Civil Code 1103.4)
Neither the seller nor the agent is liable for errors or inaccuracies in the NHD Statement IF:
- They relied in good faith on information from a third-party NHD report
- The third party was a qualified expert
- The report was not more than two years old at the time of delivery

### No Duty to Investigate Beyond Maps
Neither the seller nor agent is required to:
- Conduct independent geological or hydrological investigations
- Hire experts to verify zone determinations
- Research beyond the publicly available hazard maps

---

## Additional Local Hazard Disclosures

Beyond the six mandatory state hazard zones, local jurisdictions may require additional disclosures. Common examples include:

- **Airport influence area** -- proximity to airports
- **Coastal erosion zones** -- coastal bluff setback areas
- **High-wind zones** -- areas subject to extreme wind events
- **Industrial use proximity** -- proximity to refineries, chemical plants, etc.
- **Right-to-farm** -- agricultural areas subject to farming operations

---

## Interaction with TDS

The NHD Statement is a separate document from the TDS but is often delivered at the same time. The TDS addresses the property's physical condition; the NHD addresses the property's location relative to mapped hazard zones.

The NHD is sometimes combined with a broader "Combined Natural Hazard and Tax Disclosure Report" that also includes:
- Mello-Roos/special tax information
- Supplemental property tax notices
- Environmental hazard maps
- Airport proximity maps
- Local disclosure items

---

## Contract Builder Implementation Notes

### Data Requirements
1. Property address (for geocoding against hazard maps)
2. APN (for cross-referencing county tax records)
3. Access to hazard zone databases (FEMA FIRM maps, CGS maps, CAL FIRE maps, dam inundation maps)

### Automation Opportunities
- **Geocoded hazard zone lookup** -- automatically determine all six zone statuses from property coordinates
- **NHD report integration** -- accept third-party NHD report data for auto-population
- **Expiration tracking** -- flag NHD reports older than 2 years (safe harbor limit)

### Validation Rules
- All six hazard zones must be addressed (no blanks)
- "No" answers on ambiguous maps should be flagged for expert report attachment
- Track NHD report date for safe harbor compliance
- Require all three signatures (seller, seller's agent, buyer)
