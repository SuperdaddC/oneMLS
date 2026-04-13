# Commission Law -- Post-NAR Settlement

> **Primary Authority:** Business and Professions Code Division 4 (10000-11506); AB 2992 (effective Jan 1, 2025)
> **Related:** NAR Settlement Agreement (effective Aug 17, 2024); C.A.R. form updates
> **Key BPC Sections:** 10176, 10177, 10130-10149

---

## Overview

California real estate commission law underwent major changes in 2024-2025 following the National Association of Realtors (NAR) antitrust settlement and California Assembly Bill 2992. These changes fundamentally altered how buyer agent compensation is negotiated, disclosed, and communicated.

---

## Pre-Settlement Commission Structure (Historical Context)

### Traditional Model (Pre-Aug 17, 2024)
- Seller agreed to total commission in listing agreement (e.g., 5-6%)
- Listing broker split commission with buyer's broker (typically 50/50)
- Commission split was displayed on MLS listing
- Buyers rarely negotiated or paid their own agent's commission directly
- Cooperative compensation was the norm

---

## NAR Settlement Changes (Effective Aug 17, 2024)

### Key Rule Changes

**1. No Buyer Agent Commission on MLS**
- MLS listings may no longer include, display, or communicate buyer agent compensation offers
- This applies to all MLSs nationwide, including CRMLS, MLSListings, Bay East, etc.
- Listing agents may not input any buyer agent commission amount in MLS fields

**2. Written Buyer-Broker Agreement Required Before Touring**
- Buyer's agents must have a written agreement with their buyer client before:
  - Touring homes in person
  - Conducting live virtual tours
  - Any substantive property viewing
- This is now codified in California law by AB 2992 (see [buyer-representation.md](buyer-representation.md))

**3. Compensation Negotiation Moved Off-MLS**
Seller offers of buyer agent compensation may still occur through:
- Direct communication between listing and buyer's agents
- Listing agent's marketing materials or brokerage website
- Terms within the purchase agreement (buyer requests seller pay buyer's agent)
- Seller concessions at closing

---

## California-Specific Commission Rules

### Commission Not Fixed by Law
- BPC 10176(g): Commission rates are **never fixed by law**
- Each broker sets their own commission independently
- Listing agreements must contain a statement that commission is negotiable
- Anti-trust law prohibits brokerages from agreeing on standard commission rates

### Commission Disclosure Requirements

**BPC 10176(g) -- Compensation Disclosure:**
- Broker must disclose all commission, compensation, fees, and profit to their contracting client
- This includes referral fees, bonuses, and any other form of compensation

**BPC 10176(h) -- Option-Listing Combinations:**
- If a broker holds both an option and a listing, they must:
  - Inform the principal of the amount of profit they will make
  - Obtain written consent from the principal before exercising the option

### Who Can Earn a Commission (BPC 10130-10149)
- Only a **licensed real estate broker** (or salesperson acting under a broker) may earn a commission
- Unlicensed persons cannot receive real estate commissions (BPC 10136)
- Salespersons must be compensated through their employing broker, not directly from a client

### Grounds for Discipline Related to Commission (BPC 10176)
- **(e)** Failure to present all offers to the principal
- **(f)** Listing without a definite termination date
- **(g)** Failure to disclose compensation
- **(h)** Option-listing profit non-disclosure
- **(i)** Dishonest dealing
- **(j)** Violation of other licensing law provisions

---

## Current Commission Models (Post-Settlement)

### Model 1: Seller Pays Both Agents
- Seller agrees in listing agreement to pay listing broker commission
- Seller separately agrees (in purchase agreement or otherwise) to pay buyer's agent
- Buyer's agent compensation negotiated off-MLS
- Most similar to traditional model but with more transparency

### Model 2: Buyer Pays Own Agent
- Buyer agrees in buyer-broker agreement to pay their own agent
- Buyer's agent compensation comes from buyer's funds
- May be financed (VA loans allow this) or paid from buyer's cash
- Listing agreement only covers listing broker's commission

### Model 3: Hybrid / Seller Concession
- Purchase agreement includes term requesting seller pay buyer's agent compensation
- Seller may accept, reject, or counter this term
- Effective mechanism is similar to a seller concession or closing cost credit
- Common in practice -- many buyers include this in their offers

### Model 4: Commission Split Still Offered (Off-MLS)
- Listing broker offers buyer agent compensation on their website, marketing materials, or through direct communication
- This is permissible as long as it does not appear on MLS
- Buyer's agent must still have a written agreement with buyer specifying compensation

---

## Commission Disputes

### Procuring Cause
- The broker who is the "procuring cause" of the sale is entitled to the commission
- Procuring cause = the broker whose efforts brought about the sale
- Disputes often arise when multiple brokers were involved

### Safety Clause Disputes
- The listing agreement's safety clause determines post-expiration commission rights
- Broker must provide written list of prospective buyers within specified period
- New listing with a different broker may override safety clause

### Dispute Resolution
- Arbitration through local REALTOR association (for members)
- Mediation (recommended/required by most agreements)
- Court litigation (if arbitration not available or not agreed to)
- Interpleader by escrow holder when commission disbursement is disputed

---

## Tax Implications of Commission

### For Agents/Brokers
- Commission income is subject to federal and California income tax
- Self-employed agents must pay self-employment tax
- 1099 reporting by brokerages

### For Sellers
- Commission paid is a selling expense, reducing capital gain
- Properly documented commission reduces taxable gain on property sale

### For Buyers
- If buyer pays own agent commission, it is generally added to cost basis
- May not be directly deductible but increases basis for future gain calculations

---

## DRE Enforcement

### Investigation Triggers
- Consumer complaints
- Random audits
- Pattern of complaints against a licensee

### Disciplinary Actions
- Formal reprimand / citation
- Fine (up to $2,500 per violation for citations)
- License restriction
- License suspension (specified period)
- License revocation
- Cost recovery for investigation/hearing expenses

### Common Commission-Related Violations
- Collecting commission without a license
- Undisclosed dual compensation
- Failure to disclose referral fees
- Commission sharing with unlicensed persons
- Trust fund violations related to commission deposits

---

## Contract Builder Implementation Notes

### Commission Handling
1. Listing agreement: capture listing broker commission (rate or flat fee)
2. Buyer-broker agreement: capture buyer agent compensation terms
3. Purchase agreement: include field for seller-paid buyer agent compensation request
4. Escrow instructions: calculate and allocate commission disbursements

### Validation Rules
- Commission fields must include negotiability statement
- Verify agent license numbers against DRE database
- Flag if buyer agent compensation is being communicated via MLS
- Ensure buyer-broker agreement exists before showing/touring
- Track commission allocation across listing agreement, buyer-broker agreement, and purchase agreement
