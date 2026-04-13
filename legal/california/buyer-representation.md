# Buyer Representation Agreement

> **Primary Authority:** Assembly Bill 2992 (effective January 1, 2025); Business and Professions Code 10147.6
> **Related:** NAR Settlement Agreement (effective Aug 17, 2024); DRE Licensee Advisory (Nov 14, 2024)
> **C.A.R. Form:** BRBA (Buyer Representation and Broker Compensation Agreement)

---

## Overview

AB 2992 fundamentally changed buyer representation in California by mandating written buyer-broker agreements for all real property sales. This law codifies and expands upon the NAR settlement requirements, imposing California-specific rules including a strict 3-month duration limit.

---

## Key Requirements of AB 2992

### Written Agreement Mandatory (BPC 10147.6)
- A written buyer-broker representation agreement is **required** for a buyer's broker to receive any commission in a real property sale
- Applies to **all property types**: residential, commercial, industrial, multifamily, single-family, vacant land
- Agreement must be executed **as soon as practicable**, but **no later than the execution of the buyer's offer to purchase**

### Duration Limit -- 90 Days Maximum
- The agreement **cannot exceed 3 months** (90 days) from the date of execution
- **Exception:** Agreements between a broker and a corporation, LLC, or partnership are exempt from the 3-month limit
- The expiration date must be clearly stated in the agreement

### Automatic Renewal Prohibited
- The agreement **cannot renew automatically**
- Any renewal must be:
  - In writing
  - Dated
  - Signed by all parties
  - Limited to 3 months per renewal period

---

## Required Agreement Provisions

The buyer-broker agreement must include:

### 1. Description of Services
- Specific services the broker will perform on behalf of the buyer
- May include: property search, market analysis, offer preparation, negotiation, transaction coordination

### 2. Compensation Terms
- The **amount** of compensation (fixed fee, percentage, or hourly rate)
- The **structure** of compensation (how it will be calculated)
- Must include the statement: "The amount or rate of real estate commissions is not fixed by law but rather is set by each broker individually and may be negotiable between the buyer and the broker"

### 3. When Compensation is Due
- Must specify the trigger for payment (e.g., upon close of escrow, upon offer acceptance, etc.)

### 4. Expiration Date
- Must clearly state the date the agreement expires
- Cannot exceed 3 months from execution date (for individual buyers)

---

## Who Must Sign

| Party | Requirement |
|---|---|
| Buyer | Must sign the agreement |
| Buyer's Agent/Broker | Must sign the agreement |
| Seller | NOT a party to the buyer-broker agreement |

---

## Timing Requirements

### When to Execute
- **NAR Settlement Rule:** Before any in-person or virtual property touring
- **AB 2992:** As soon as practicable, but no later than execution of the buyer's offer to purchase

### Practical Implications
- Agents should execute the agreement at the first substantive meeting with the buyer
- Open houses present a gray area -- attending an open house may not require an agreement, but further touring/representation does
- The agreement should be in place before:
  - Private showings
  - Writing offers
  - Substantive negotiation on behalf of the buyer

---

## Scope of Representation

### Exclusive vs. Non-Exclusive

**Exclusive Buyer Representation:**
- Buyer agrees to work with one broker exclusively
- Buyer owes commission to that broker regardless of who finds the property
- Most protective for the broker

**Non-Exclusive Buyer Representation:**
- Buyer may work with multiple brokers
- Only the broker who facilitates the purchase earns the commission
- Less commitment from the buyer

### Geographic or Property-Type Limitations
- The agreement may be limited to:
  - Specific geographic areas
  - Specific property types
  - Specific price ranges
  - Specific properties (e.g., agreement only for a particular property)

---

## Compensation Mechanics (Post-NAR Settlement)

### How Buyer's Agent Gets Paid

**Scenario 1: Seller Offers Buyer Agent Compensation**
- Seller agrees in purchase agreement or through off-MLS communication to pay buyer's agent
- If seller's offered amount meets buyer-broker agreement amount, buyer owes nothing additional
- If seller's offered amount is less, buyer is responsible for the shortfall

**Scenario 2: Buyer Pays Agent Directly**
- Buyer pays their agent per the buyer-broker agreement terms
- Payment typically at close of escrow
- May be financed in certain loan programs (VA loans permit this)

**Scenario 3: Hybrid**
- Buyer requests seller pay buyer's agent compensation as a term of the purchase offer
- If seller accepts, compensation comes from sale proceeds
- If seller counters or rejects, buyer may need to pay directly

### Commission Negotiability Statement
The agreement MUST contain the following statement (or substantially similar):
> "The amount or rate of real estate commissions is not fixed by law but rather is set by each broker individually and may be negotiable between the buyer and the broker."

---

## Termination and Cancellation

### Expiration
- Agreement automatically terminates on the stated expiration date
- No renewal without new written, signed, dated agreement

### Mutual Cancellation
- Both parties may agree to cancel at any time in writing

### Buyer's Cancellation
- Buyer may terminate, but may owe compensation if broker has performed services
- Terms of cancellation should be specified in the agreement

### Broker's Cancellation
- Broker may withdraw representation
- Must provide written notice

---

## Void and Unenforceable Agreements

An agreement is **void and unenforceable** if:
1. It exceeds 3 months in duration (for individual buyers)
2. It contains an automatic renewal clause
3. It fails to include the required commission negotiability statement
4. It does not include the required provisions (services, compensation, timing, expiration)

**Consequence:** If the agreement is void, the broker **cannot recover any commission** under it.

---

## DRE Enforcement

### Violation Consequences
- A licensee who violates AB 2992 is deemed to have violated their licensing law
- DRE may take disciplinary action:
  - License suspension
  - License revocation
  - Fines and penalties
  - Required education

### DRE Rulemaking
The DRE has been authorized to adopt regulations implementing AB 2992, including:
- Specific form requirements
- Clarification of "as soon as practicable" standard
- Guidance on open house scenarios
- Requirements for electronic agreements

---

## Comparison: AB 2992 vs. NAR Settlement Rules

| Requirement | NAR Settlement | AB 2992 |
|---|---|---|
| Written agreement required | Yes (before touring) | Yes (before offer at latest) |
| Duration limit | None specified | 3 months maximum |
| Auto-renewal | Not addressed | Prohibited |
| Property types | Residential | All property types |
| Commission statement | Required | Required (specific language) |
| Compensation disclosure | Yes | Yes (amount, structure, when due) |
| Enforcement | MLS rules / NAR membership | California DRE / state law |

---

## Contract Builder Implementation Notes

### Required Fields
1. Buyer name(s) and entity type (individual, LLC, corporation, partnership)
2. Broker name, license number, brokerage
3. Agent name and license number
4. Execution date
5. Expiration date (validate: max 90 days for individuals)
6. Description of services
7. Compensation amount/rate
8. Compensation structure (percentage, flat fee, hourly)
9. When compensation is due (at close, upon acceptance, other)
10. Commission negotiability statement (mandatory language)
11. Scope (exclusive/non-exclusive, geographic area, property types)
12. Signatures of buyer and broker/agent

### Validation Rules
- Expiration date must not exceed 90 days from execution date (unless entity buyer)
- No automatic renewal provisions
- Commission negotiability statement must be present
- All required provisions must be present (services, compensation, timing, expiration)
- Flag if agreement is missing before offer execution
- Entity type check: if LLC/corporation/partnership, 90-day limit does not apply
- Track agreement status: active, expired, renewed, cancelled
