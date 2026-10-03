import { SampleDossier } from './types.js';

export const SAMPLE_DOSSIERS: SampleDossier[] = [
  {
    id: 'sample-bait-and-switch',
    title: 'The Remote Bait-and-Switch',
    company: 'Austin Cloud Solutions LLC',
    role: 'Senior Full-Stack Engineer',
    scenarioType: 'bait_and_switch',
    summaryDescription:
      'Recruiter emails promised $165,000 base, 100% remote flexibility, unlimited PTO, and company hardware. The formal offer letter arrived with $132,000 base, mandatory 4 days in-office in Austin, fixed PTO, and an exploding 48-hour deadline.',
    keyDivergenceHint:
      '$33k base salary divergence, remote converted to mandatory onsite, 18-month non-compete.',
    documents: [
      {
        id: 'doc-bns-email',
        title: 'Recruiter Initial Pitch & Compensation Confirmation',
        type: 'recruiter_email',
        source: 'sample',
        uploadedAt: '2026-09-28T14:20:00Z',
        metadata: {
          sender: 'sarah.jenkins@austincloudsolutions.com',
          dateReceived: 'September 28, 2026',
          domain: 'austincloudsolutions.com',
        },
        rawText: `From: Sarah Jenkins <sarah.jenkins@austincloudsolutions.com>
To: Alex Mercer <alex.mercer.dev@gmail.com>
Date: September 28, 2026
Subject: Offer Terms & Next Steps - Senior Full-Stack Engineer

Hi Alex,

The engineering leadership team was blown away by your systems design round! We are thrilled to officially extend an offer to join Austin Cloud Solutions LLC as a Senior Full-Stack Engineer.

Here is a summary of the compensation terms we agreed on:
• Base Salary: $165,000 per year (paid bi-weekly)
• Work Arrangement: 100% remote anywhere in the United States. You will never be asked to relocate or come into an office.
• Paid Time Off: Unlimited PTO policy with an encouraged minimum of 20 days taken per year.
• Equipment: A brand new 16" Apple MacBook Pro M3 Max will be shipped directly to your residence by our IT department before your start date, plus a $1,500 home office setup stipend.
• Sign-on Bonus: $10,000 payable on your first regular pay cycle.

We will generate the formal legal paperwork and send it over for your signature tomorrow. Let me know if you have any questions!

Warm regards,
Sarah Jenkins
Director of Talent Acquisition
Austin Cloud Solutions LLC`,
      },
      {
        id: 'doc-bns-notes',
        title: 'Candidate Notes from VP Engineering Call',
        type: 'candidate_notes',
        source: 'sample',
        uploadedAt: '2026-09-29T10:15:00Z',
        metadata: {
          dateReceived: 'September 29, 2026',
          sender: 'Candidate Call Notes',
        },
        rawText: `Call with Dave (VP of Engineering):
- Date: Sept 29, 2026
- Dave confirmed team is distributed across Pacific and Eastern time zones.
- Emphasized that base salary is $165,000.
- Re-stated that there is no probationary period because the interview bar was high.
- Said offer letter would be sent via DocuSign today.`,
      },
      {
        id: 'doc-bns-contract',
        title: 'Formal Employment Offer Letter & Restrictive Covenants',
        type: 'offer_letter',
        source: 'sample',
        uploadedAt: '2026-09-30T09:00:00Z',
        metadata: {
          dateReceived: 'September 30, 2026',
          sender: 'Austin Cloud Solutions LLC HR',
        },
        rawText: `AUSTIN CLOUD SOLUTIONS LLC
1100 Congress Avenue, Suite 400
Austin, TX 78701

EMPLOYMENT AGREEMENT AND FORMAL OFFER OF EMPLOYMENT

Date: September 30, 2026
Candidate: Alex Mercer
Address: 742 Evergreen Terrace, Apt 3B, Austin, TX 78704
Phone: (512) 555-0198
SSN: 345-21-9876

Dear Alex,

Austin Cloud Solutions LLC (the "Company") is pleased to offer you the position of Senior Full-Stack Engineer on the following contractual terms:

1. POSITION AND DUTIES
You will serve as Senior Full-Stack Engineer reporting to the VP of Engineering.

2. COMPENSATION AND BONUS
Your starting base salary will be $132,000 USD per year, payable in accordance with regular payroll practices. You shall be eligible to participate in the Annual Incentive Plan for an additional discretionary performance bonus of up to $33,000, payable at the sole discretion of the Board of Directors subject to corporate profitability thresholds.

3. WORK LOCATION AND COMMENCEMENT
Your primary work location will be at our headquarters in Austin, TX. You agree to report in-office a minimum of 4 days per week (Monday through Thursday), with optional remote flexibility on Friday subject to manager approval.

4. PAID TIME OFF AND BENEFITS
You will accrue 14 days of paid time off (PTO) annually, pro-rated from your start date. Company health, dental, and vision insurance will take effect following the completion of a mandatory 90-day probationary period.

5. RESTRICTIVE COVENANTS AND NON-COMPETE
For a period of 18 months following the termination of your employment for any reason, you agree not to provide services, directly or indirectly, to any competitor within the North American continent offering cloud optimization or infrastructure software.

6. ACCEPTANCE DEADLINE
This offer of employment is strictly valid for 48 hours and shall expire on October 2, 2026 at 5:00 PM CST. Failure to sign within 48 hours shall cause this offer to be automatically rescinded.

Austin Cloud Solutions LLC
By: David Sterling, VP Engineering`,
      },
    ],
  },
  {
    id: 'sample-payment-red-flag',
    title: 'The Equipment Check Red Flag',
    company: 'Global Apex Systems Inc',
    role: 'Remote Data Operations Specialist',
    scenarioType: 'payment_red_flag',
    summaryDescription:
      'Recruiter outreach originated from an unverified lookalike domain (.site). The entire interview occurred on Telegram text chat. The offer mandates depositing an upfront $3,850 cashier check to wire to a designated hardware vendor.',
    keyDivergenceHint:
      'Urgent cashier check cashing instructions, @site domain, Telegram chat interview, payment advance request.',
    documents: [
      {
        id: 'doc-prf-email',
        title: 'Initial Recruiter Outreach from Apex Careers',
        type: 'recruiter_email',
        source: 'sample',
        uploadedAt: '2026-10-01T08:30:00Z',
        metadata: {
          sender: 'hr-department@global-apex-systems.site',
          dateReceived: 'October 1, 2026',
          domain: 'global-apex-systems.site',
        },
        rawText: `From: Global Apex HR <hr-department@global-apex-systems.site>
To: Jamie Vance <jamie.vance88@gmail.com>
Date: October 1, 2026
Subject: Immediate Interview Invitation - Remote Data Operations Specialist ($48/hr)

Dear Jamie Vance,

Our recruitment board has reviewed your resume on Indeed and selected your profile for an immediate remote position as Remote Data Operations Specialist at Global Apex Systems Inc.

The rate of pay is $48.00 per hour ($99,840 annually). This is a 100% remote work from home position.

INTERVIEW PROTOCOL:
Due to the high volume of applicants, our Chief Talent Officer Dr. Raymond Shaw will conduct your comprehensive text interview today via Telegram Messenger.

Please download Telegram from the app store and message username: @Apex_Talent_Raymond to commence your interview briefing immediately. Use interview code: APX-9902.

Best,
Recruitment Operations
Global Apex Systems Inc`,
      },
      {
        id: 'doc-prf-interview',
        title: 'Interview Transcript via Telegram Text Chat',
        type: 'recruiter_message',
        source: 'sample',
        uploadedAt: '2026-10-01T11:45:00Z',
        metadata: {
          sender: '@Apex_Talent_Raymond (Telegram)',
          dateReceived: 'October 1, 2026',
          platform: 'Telegram',
        },
        rawText: `[11:02 AM] @Apex_Talent_Raymond: Welcome Jamie. I am Dr. Raymond Shaw. Let us proceed with 5 quick operational questions.
[11:04 AM] Jamie: Thank you Dr. Shaw. Glad to connect.
[11:06 AM] @Apex_Talent_Raymond: How do you handle database record discrepancies and confidentiality?
[11:08 AM] Jamie: [Answers regarding data validation, integrity checks, and NDA protocols...]
[11:15 AM] @Apex_Talent_Raymond: Excellent answers. You have demonstrated exemplary acumen. On behalf of Global Apex Systems Inc, you are hired effective immediately!
[11:18 AM] Jamie: That is great news, will we have a video call with the operations manager?
[11:20 AM] @Apex_Talent_Raymond: Video verification is deferred to company orientation day. Next step is your workstation provisioning.`,
      },
      {
        id: 'doc-prf-letter',
        title: 'Offer Letter & Workstation Procurement Directive',
        type: 'offer_letter',
        source: 'sample',
        uploadedAt: '2026-10-01T13:00:00Z',
        metadata: {
          sender: 'Global Apex Systems Inc',
          dateReceived: 'October 1, 2026',
        },
        rawText: `GLOBAL APEX SYSTEMS INC
OFFICIAL JOB APPOINTMENT LETTER & PROCUREMENT INSTRUCTIONS

Candidate: Jamie Vance
Position: Remote Data Operations Specialist
Compensation: $48.00 per hour ($99,840 per year)
Work Location: 100% Remote / Home Office

EQUIPMENT SETUP AND MANDATORY ADVANCE CHECK PROCEDURE:
To configure your home workstation with proprietary Apex Data Engine software, you require an Apple 27" 5K Retina Workstation and secure VPN Router.

The company will issue an advance cashier's check of $3,850.00 payable to your name. You must deposit this check into your personal bank account. Once deposited, you are required to wire transfer the funds to our certified hardware vendor (Silicon Valley Logistics Inc) via Zelle or Wire Transfer within 24 hours. The vendor will then courier the configured equipment to your doorstep.

Failure to deposit the check and reimburse the vendor within 24 hours of delivery will void your employment agreement.

Accepted and Agreed:
Candidate Signature: __________________ Date: ___________`,
      },
    ],
  },
  {
    id: 'sample-opaque-startup',
    title: 'The Opaque Startup Equity Trap',
    company: 'NovaScale Technologies Inc',
    role: 'Lead Platform Architect',
    scenarioType: 'opaque_startup',
    summaryDescription:
      'High-growth seed startup offering 50,000 options with hyped valuation claims, but completely missing strike price, capitalization pool size, and 409A appraisal. Contract includes draconian off-hours IP claims and full bonus clawbacks.',
    keyDivergenceHint:
      'Missing strike price, unstated dilution, aggressive IP assignment of personal weekend projects, 24-month clawback.',
    documents: [
      {
        id: 'doc-ost-email',
        title: 'Founder Email Regarding Equity upside',
        type: 'recruiter_email',
        source: 'sample',
        uploadedAt: '2026-09-25T16:00:00Z',
        metadata: {
          sender: 'elena@novascale.io',
          dateReceived: 'September 25, 2026',
          domain: 'novascale.io',
        },
        rawText: `From: Elena Rostova <elena@novascale.io>
To: Chris Lin <chris.lin.tech@gmail.com>
Date: September 25, 2026
Subject: NovaScale Offer - Lead Platform Architect

Hi Chris,

We are so stoked to bring you on as Lead Platform Architect. We just closed our $4M seed round led by top tier VCs and the trajectory is insane.

Here is the high-level picture:
• Base Salary: $155,000 base
• Stock Options: 50,000 stock options! In our upcoming Series A model, this grant easily represents $250k–$400k in upside.
• Signing Bonus: $15,000 to help you transition.
• Culture: Huge autonomy, high ownership.

Contract is attached! Let's build the future together.

Elena Rostova
Co-Founder & CEO, NovaScale`,
      },
      {
        id: 'doc-ost-contract',
        title: 'NovaScale Employment Contract & IP Assignment',
        type: 'offer_letter',
        source: 'sample',
        uploadedAt: '2026-09-26T11:00:00Z',
        metadata: {
          sender: 'NovaScale Legal',
          dateReceived: 'September 26, 2026',
        },
        rawText: `NOVASCALE TECHNOLOGIES INC
EMPLOYMENT OFFER LETTER

Candidate: Chris Lin
Title: Lead Platform Architect

1. SALARY AND SIGNING BONUS
Your starting base salary will be $155,000 per year. You will receive a one-time signing bonus of $15,000. If you voluntarily resign from the company within 24 months of your start date, you must repay the full 100% of the signing bonus plus company reasonable attorney's fees incurred in collecting repayment.

2. STOCK OPTIONS
Subject to approval by the Board of Directors, you will be granted 50,000 stock options under the Company Equity Incentive Plan. The options will vest over a 4-year period with a 1-year cliff (25% vesting after 12 months, and monthly thereafter).
[Note: Exercise price, current 409A valuation, and total shares outstanding are omitted].

3. INTELLECTUAL PROPERTY ASSIGNMENT (PIIA)
Employee agrees that all inventions, discoveries, designs, software, computer programs, and improvements created, conceived, or authored by Employee, whether or not during normal working hours, whether or not on Company premises or equipment, and whether or not relating to the Company's current or prospective business, shall immediately and irrevocably become the sole property of NovaScale Technologies Inc.

4. TERMINATION AND POST-TERMINATION EXERCISE
Upon separation of employment for any reason, Employee shall have thirty (30) days to exercise any vested options, after which all vested and unvested options shall be irrevocably forfeited.`,
      },
    ],
  },
  {
    id: 'sample-clean-offer',
    title: 'The Clean & Transparent Tech Offer',
    company: 'Nexus Data Dynamics Inc',
    role: 'Senior Machine Learning Engineer',
    scenarioType: 'clean_offer',
    summaryDescription:
      'A well-documented, legitimate offer with matching figures across recruiter communications and the formal contract. Clear 4-year RSU vesting, transparent health benefits from Day 1, and standard 5-business-day decision window.',
    keyDivergenceHint:
      'High alignment (94%), all recruiter promises match written contract, minor standard negotiation questions.',
    documents: [
      {
        id: 'doc-cle-email',
        title: 'Recruiter Offer Summary Email',
        type: 'recruiter_email',
        source: 'sample',
        uploadedAt: '2026-10-01T15:00:00Z',
        metadata: {
          sender: 'marcus.v@nexusdatadynamics.com',
          dateReceived: 'October 1, 2026',
          domain: 'nexusdatadynamics.com',
        },
        rawText: `From: Marcus Vance <marcus.v@nexusdatadynamics.com>
To: Taylor Reed <taylor.reed.ai@gmail.com>
Date: October 1, 2026
Subject: Official Offer: Senior Machine Learning Engineer at Nexus Data Dynamics

Hi Taylor,

On behalf of Nexus Data Dynamics Inc, congratulations on completing our technical rounds! We are delighted to extend a formal offer for the Senior Machine Learning Engineer position.

Terms discussed:
• Base Salary: $160,000 per year
• Annual Performance Bonus: 12% target bonus based on individual OKRs and company milestones
• Equity: 12,000 RSUs vesting over 4 years with a 1-year cliff (25% cliff, then quarterly vesting)
• Work Location: Hybrid model (2 days per week in our Seattle, WA engineering hub, 3 days remote)
• Benefits: Comprehensive medical, dental, and vision effective Day 1 of employment; 401(k) matching up to 5% dollar-for-dollar
• Decision Window: Please review the formal agreement and return it by Friday, October 8, 2026.

Let me know if you would like to hop on a quick call with our engineering manager to discuss any questions!

Best,
Marcus Vance
Senior Technical Recruiter | Nexus Data Dynamics Inc`,
      },
      {
        id: 'doc-cle-contract',
        title: 'Nexus Data Dynamics Formal Employment Agreement',
        type: 'offer_letter',
        source: 'sample',
        uploadedAt: '2026-10-01T16:30:00Z',
        metadata: {
          sender: 'Nexus Data Dynamics Legal',
          dateReceived: 'October 1, 2026',
        },
        rawText: `NEXUS DATA DYNAMICS INC
EMPLOYMENT AGREEMENT

Candidate: Taylor Reed
Position: Senior Machine Learning Engineer
Reporting to: Director of AI Research
Location: Seattle, WA (Hybrid: 2 days in-office, 3 days remote)

1. BASE COMPENSATION & ANNUAL BONUS
Your annual base salary will be $160,000, payable semi-monthly. You will be eligible for an annual performance bonus with a target of 12% of base salary, evaluated annually based on mutually agreed OKRs.

2. RESTRICTED STOCK UNITS (RSU)
You will receive a grant of 12,000 Restricted Stock Units (RSUs) pursuant to the 2024 Equity Incentive Plan. Vesting is 25% on the first anniversary of your start date, with remaining shares vesting quarterly over the subsequent 36 months.

3. BENEFITS & 401(K)
Comprehensive health insurance commences on Day 1 of employment with 90% of employee premiums covered by the Company. The Company provides a 100% 401(k) match on employee contributions up to 5% of salary, vesting immediately.

4. PAID TIME OFF
You will be entitled to 20 days of paid vacation per calendar year plus 11 company holidays.

5. PRIOR INVENTIONS & INTELLECTUAL PROPERTY
Company claims ownership only over inventions created in the course of your employment or using Company resources. Please list all pre-existing inventions and open-source contributions on Exhibit A attached hereto to ensure full exclusion.

6. DEADLINE
Please review and execute this agreement by October 8, 2026.`,
      },
    ],
  },
];
