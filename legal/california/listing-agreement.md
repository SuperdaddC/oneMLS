# Listing Agreement Requirements

> **Primary Authority:** Business and Professions Code 10176(f); AB 1345 (Residential Exclusive Listing Agreements Act, effective Jan 1, 2024)
> **Related Statutes:** Civil Code 1624 (Statute of Frauds); BPC 10176(g), (h)
> **C.A.R. Forms:** RLA/ELA (Residential Listing Agreement -- Exclusive Authorization and Right to Sell)

---

## Overview

A listing agreement is a contract between a property owner and a real estate broker authorizing the broker to act as the owner's agent in marketing and selling the property. California law imposes specific requirements on listing agreements, including mandatory written form, termination dates, and duration limits.

---

## Types of Listing Agreements

### 1. Exclusive Authorization and Right to Sell (Most Common)
- Broker earns commission regardless of who sells the property during the listing period
- Broker earns commission even if the seller finds the buyer independently
- Industry standard for residential transactions
- C.A.R. Form: RLA (Residential Listing Agreement)

### 2. Exclusive Agency Listing
- Broker earns commission only if broker or cooperating broker procures the buyer
- Seller retains the right to sell independently without owing commission
- Less common than Exclusive Authorization and Right to Sell

### 3. Open Listing (Non-Exclusive)
- Multiple brokers may be given listing rights
- Only the broker who actually procures the buyer earns commission
- Seller may sell independently without owing commission
- No written agreement required (but recommended)
- Cannot be "exclusive"

---

## Legal Requirements

### Written Agreement Required
- The Statute of Frauds (Civil Code 1624) requires listing agreements to be in writing
- An oral listing agreement is unenforceable -- the broker cannot collect a commission

### Definite Termination Date (BPC 10176(f))
- **Every exclusive listing** must contain a definite, final termination date
- Failure to include a termination date is grounds for disciplinary action against the licensee
- An agreement without a termination date is not automatically void, but subjects the agent to DRE discipline

### AB 1345 -- Residential Exclusive Listing Agreements Act (Effective Jan 1, 2024)

**Duration Limits:**

| Provision | Maximum |
|---|---|
| Initial exclusive listing term | **24 months** |
| Renewal term | **12 months** |

**Key Provisions:**
1. Exclusive listing agreements for single-family residential property cannot exceed **24 months**
2. Renewals cannot exceed **12 months** each
3. **Automatic renewal is prohibited** -- any renewal must be:
   - In writing
   - Dated
   - Signed by all parties
4. **Recording prohibited** -- it is unlawful to present an exclusive listing agreement for recording with the county recorder
5. Agreements for future exclusive listings are also covered

**Enforcement:**
- Agreements exceeding 24 months are **void and unenforceable**
- Recorded listings are **void and unenforceable**
- Violation is deemed a violation of licensing law -- DRE may take disciplinary action
- Applies to single-family residential properties (not commercial or multi-family over 4 units)

### Scope of AB 1345
- Applies to **single-family residential** properties only
- Includes any agreement to enter into a future exclusive listing agreement
- Does not apply to commercial, industrial, or multi-family (5+ units) properties

---

## Required Elements of a Listing Agreement

### Mandatory Provisions
1. **Property identification** -- address, legal description
2. **Listing price** -- the price at which the property will be offered
3. **Commission/compensation** -- the amount or percentage, clearly stated
4. **Termination date** -- specific date the agreement expires
5. **Broker identification** -- name, license number, brokerage
6. **Agency disclosure** -- acknowledgment of agency relationships
7. **Authorization to sell** -- scope of broker's authority
8. **Signatures** -- owner(s) and broker

### Commission Disclosure
- **BPC 10176(g):** Broker must disclose all compensation, fees, and profit to the client
- **BPC 10176(h):** For option-listing combinations, broker must inform principal of profit and obtain written consent
- Commission rates are **not fixed by law** -- they are negotiable between seller and broker
- The listing agreement must contain a statement that commission is not set by law and is negotiable

### Safety/Protection Clause
- Most listing agreements include a "safety clause" (also called "broker protection clause")
- This clause allows the broker to earn a commission if a buyer who was introduced to the property during the listing period purchases after the listing expires
- The safety clause typically has its own expiration period (e.g., 90 days after listing termination)
- The broker must provide a written list of prospective buyers to the seller within a specified period after listing expiration

---

## Seller's Obligations Under the Listing Agreement

1. **Cooperate with marketing** -- allow showings, photography, open houses (as agreed)
2. **Provide accurate information** -- disclose known material facts about the property
3. **Not interfere with broker's efforts** -- refrain from independently negotiating during exclusive listing period (for exclusive listings)
4. **Pay commission upon closing** -- per the terms of the agreement
5. **Complete required disclosures** -- TDS, NHD, etc.

---

## Broker's Obligations Under the Listing Agreement

1. **Fiduciary duties** -- loyalty, obedience, disclosure, confidentiality, care, accounting
2. **Diligent marketing** -- actively market the property per agreed-upon plan
3. **Present all offers** -- present all written offers to the seller (BPC 10176(e))
4. **Honest dealing** -- no fraud, misrepresentation, or dishonest dealing (BPC 10176(i))
5. **Agency disclosure** -- provide required agency disclosures
6. **Compliance with MLS rules** -- if property is listed on MLS
7. **Trust fund handling** -- properly handle deposits per DRE regulations

---

## Cancellation and Termination

### Expiration
- The listing automatically terminates on the expiration date
- No action required by either party

### Mutual Cancellation
- Both parties may agree to cancel at any time
- Should be in writing

### Seller Cancellation
- Seller may cancel at any time, BUT:
  - May owe commission if broker has performed services
  - May owe cancellation fee if specified in the agreement
  - Broker may have a claim for damages
- In practice, most brokers will release the listing if the seller insists

### Broker's Cancellation
- Broker may withdraw from the listing
- Should provide written notice
- Must return all documents and property belonging to the seller

### Death or Incapacity
- The death of either the seller or the broker/agent may terminate the agreement
- Corporate brokerages survive the death of an individual agent

---

## Post-NAR Settlement Considerations

### MLS Listing Rules (Effective Aug 17, 2024)
- Listing agents may no longer display buyer agent compensation offers on the MLS
- Compensation may still be negotiated off-MLS
- Seller may include buyer agent compensation offer on marketing materials, websites, or in the purchase agreement

### Impact on Listing Agreement
- The listing agreement specifies the commission paid by the seller to the listing broker
- Any buyer agent compensation offered by the seller is a separate negotiation
- C.A.R. forms have been updated to reflect these changes

---

## Penalties for Non-Compliance

| Violation | Consequence |
|---|---|
| No termination date (BPC 10176(f)) | DRE discipline (license suspension/revocation) |
| Listing exceeding 24 months (AB 1345) | Agreement void and unenforceable |
| Automatic renewal clause (AB 1345) | Renewal void and unenforceable |
| Recording listing agreement (AB 1345) | Recording void and unenforceable |
| Failure to disclose commission (BPC 10176(g)) | DRE discipline |
| Failure to present offers (BPC 10176(e)) | DRE discipline |

---

## Contract Builder Implementation Notes

### Required Fields
1. Property address and APN
2. Listing price
3. Commission rate/amount
4. Start date
5. Termination date (validate: max 24 months for SFR)
6. Broker name and license number
7. Agent name and license number
8. Seller name(s) and signatures
9. Agency disclosure acknowledgment
10. Safety clause terms (if included)

### Validation Rules
- Termination date must be present
- For SFR: term must not exceed 24 months from execution date
- For renewals: term must not exceed 12 months
- No automatic renewal provisions
- Commission rate/amount must be clearly stated
- Commission negotiability statement must be included
- Flag if listing type is "exclusive" and missing required elements
