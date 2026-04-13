# Agency Disclosure

> **Primary Authority:** California Civil Code Sections 2079 - 2079.24
> **Article:** Article 2 -- Duty to Prospective Purchaser of Real Property
> **C.A.R. Form:** AD (Disclosure Regarding Real Estate Agency Relationship)
> **Related Form:** AVID (Agent Visual Inspection Disclosure)

---

## Overview

California law requires real estate agents to disclose their agency relationships to all parties in a transaction. The law defines the types of agency relationships, mandates a specific disclosure form, and establishes the duties owed by agents to their principals and other parties.

---

## Types of Agency Relationships (Civil Code 2079.13)

### Seller's Agent
- An agent acting under a listing agreement with the seller
- Owes fiduciary duties to the seller
- Owes duties of honest and fair dealing to the buyer

### Buyer's Agent
- An agent acting under a buyer representation agreement
- Owes fiduciary duties to the buyer
- Owes duties of honest and fair dealing to the seller

### Dual Agent
- An agent representing both buyer and seller in the same transaction
- Owes fiduciary duties to both parties
- Must obtain **informed written consent** from both parties before acting as a dual agent
- Cannot disclose confidential information from one principal to the other without written consent

---

## Mandatory Disclosure Form (Civil Code 2079.16)

### Form Content
The disclosure form must contain the text specified in Civil Code 2079.16, which explains:
- The duties of a seller's agent to the seller and buyer
- The duties of a buyer's agent to the buyer and seller
- The duties of a dual agent to both parties
- The concept of associate licensees acting in different capacities within the same brokerage

### When to Deliver

| Party | When Disclosure Must Be Provided |
|---|---|
| Seller | Before entering into the listing agreement |
| Buyer | As soon as practicable prior to execution of the buyer's offer to purchase |
| Both parties | Before the buyer and seller enter into a purchase agreement |

### Acknowledgment Required
- Each party must sign an acknowledgment of receipt
- The acknowledgment should be retained by the agent/broker

---

## Agency Confirmation (Civil Code 2079.17)

### Confirmation Requirement
The selling agent (or buyer's agent) must confirm their agency relationship **as soon as practicable** prior to or concurrent with the execution of the purchase agreement.

### Methods of Confirmation
Agency may be confirmed in:
1. The purchase agreement itself (standard C.A.R. RPA includes agency confirmation provisions)
2. A separate written confirmation form

### Required Disclosure
The confirmation must state:
- Whether the listing agent is acting as the seller's agent exclusively, or as a dual agent
- Whether the selling/buyer's agent is acting as the buyer's agent exclusively, or as a dual agent

---

## Agent's Visual Inspection Duty (Civil Code 2079)

### Duty to Inspect
A broker or salesperson owes a duty to a prospective buyer of residential property (1-4 units) to:
1. Conduct a **reasonably competent and diligent visual inspection** of the property
2. Disclose to the buyer all facts materially affecting value or desirability that such inspection would reveal

### Standard of Care (Civil Code 2079.2)
The standard of care is the degree of care that a **reasonably prudent real estate licensee** would exercise, measured by the knowledge required to obtain a license.

### Scope of Inspection (Civil Code 2079.3)
The inspection duty does NOT include:
- Areas **not reasonably and normally accessible** to visual inspection
- An affirmative inspection of areas **off-site** of the subject property
- Research of **public records** or permits concerning title or use

### Who Must Inspect
- **Listing agent** -- must inspect and disclose on TDS
- **Buyer's agent** -- must inspect and disclose on TDS
- Both agents complete their respective sections

### AVID Form (C.A.R.)
Many agents use the separate Agent Visual Inspection Disclosure (AVID) form to document findings, which is more detailed than the TDS agent sections.

---

## Fiduciary Duties

### Duties Owed to Principal (Client)
All agents owe their principal:
1. **Loyalty** -- act in the best interest of the principal
2. **Obedience** -- follow lawful instructions
3. **Disclosure** -- disclose all material facts affecting the transaction
4. **Confidentiality** -- keep confidential information confidential
5. **Reasonable care and diligence** -- exercise the skill and care expected of a licensee
6. **Accounting** -- account for all funds and property received

### Duties Owed to All Parties
All agents owe ALL parties (including non-clients):
1. **Honest and fair dealing**
2. **Disclosure of material facts** known to the agent that affect the value or desirability of the property
3. **Visual inspection** results (for residential 1-4 units)

### Dual Agency Limitations
A dual agent:
- Cannot tell the buyer the seller will accept less than the listing price (without written consent)
- Cannot tell the seller the buyer will pay more than the offering price (without written consent)
- Must treat both parties fairly and equally
- Must disclose all material facts to both parties (subject to confidentiality obligations)

---

## Associate Licensees and Subagents (Civil Code 2079.14)

### Same Brokerage, Different Roles
When two associate licensees from the same brokerage represent different parties:
- The **broker** is a dual agent
- Each **associate licensee** is acting as the agent of their respective principal only
- Each associate licensee must maintain confidentiality regarding their own client's negotiating position

### Subagency
- Subagency occurs when a cooperating broker acts as the seller's agent through the listing broker
- Modern practice has largely moved away from subagency in favor of buyer representation
- If subagency exists, it must be disclosed

---

## Penalties for Non-Compliance

### DRE Disciplinary Action
Failure to properly disclose agency relationships may result in:
- License suspension or revocation
- Fines under Business and Professions Code 10176, 10177
- Additional training requirements

### Civil Liability
- Agent may be liable for actual damages resulting from failure to disclose
- Potential rescission of the transaction if agency was not properly disclosed
- Breach of fiduciary duty claims

### Statute of Limitations
- Two years from discovery of the breach for actual damages
- Four years for breach of fiduciary duty (Civil Code 2079.4)

---

## Contract Builder Implementation Notes

### Required Data Points
1. Listing agent name, license number, and brokerage
2. Buyer's agent name, license number, and brokerage
3. Agency relationship type for each agent
4. Whether same brokerage (dual agency trigger)
5. Dual agency consent signatures (if applicable)

### Validation Rules
- Agency disclosure MUST be delivered before listing agreement (seller) and before offer (buyer)
- Dual agency requires separate informed written consent from both parties
- Agency confirmation must appear in or with the purchase agreement
- Flag same-brokerage transactions for mandatory dual agency disclosure
- Verify all acknowledgment signatures are present
