/**
 * DIGITAL SAFETY HUB — content.js
 * Master data file. All scam data, quiz questions, simulator scenarios.
 * Everything exported — imported by scams.js, quiz.js, simulate.js.
 */
'use strict';

/* ============================================================
   SCAM ENCYCLOPEDIA DATA
   ============================================================ */
export const SCAM_DATA = [
  {
    id: 'otp',
    title: 'OTP Scam',
    icon: '🔢',
    risk: 'high',
    category: 'otp',
    summary: 'Fraudsters trick you into sharing a one-time password to drain your bank account.',
    how: 'A caller pretends to be from your bank, TRAI, or a KYC department. They say your account will be blocked or your SIM deactivated unless you verify immediately. They ask for the OTP sent to your phone — then use it to transfer money or take over your account.',
    example: 'Ramesh got an SMS saying his SBI account would be frozen in 2 hours. A "bank officer" called and asked for the OTP to "re-verify" his KYC. Ramesh shared it. ₹48,000 was transferred out within seconds.',
    red_flags: [
      'Any caller asking for an OTP — real banks NEVER do this',
      'Urgency: "Your account will be blocked in 2 hours"',
      'SMS arrives right as the scammer calls (they triggered it)',
      'Asking you to stay on the call while you check the SMS'
    ],
    do: [
      'Hang up immediately — no explanation needed',
      'Call your bank\'s official helpline (back of your card) to verify',
      'Report the number to 1930'
    ],
    dont: [
      'Never share OTP with anyone — not even "bank officials"',
      'Don\'t stay on call if someone triggers an OTP to your phone',
      'Don\'t click any link sent alongside the OTP message'
    ]
  },
  {
    id: 'upi',
    title: 'UPI Fraud',
    icon: '💳',
    risk: 'high',
    category: 'upi',
    summary: 'Fake "collect" requests disguised as refunds or prize money that debit your account.',
    how: 'Scammers misuse UPI\'s "collect money" feature. They send a collect request with a message like "Click to receive ₹5,000 refund." When you enter your PIN to "receive," you actually authorise sending money. They also share fake QR codes claiming you\'ll receive money by scanning.',
    example: 'Priya bought a ceiling fan online. The seller said he over-charged her by ₹500 and would refund via UPI. He sent a collect request saying "Accept to receive ₹500." She entered her PIN — and ₹12,000 was debited.',
    red_flags: [
      'Someone asks you to scan a QR or accept a request to RECEIVE money',
      '"Refund" or "cashback" that requires your UPI PIN',
      'UPI collect requests from unknown IDs',
      'Pressure to complete the transaction quickly'
    ],
    do: [
      'Remember: PIN is only for SENDING money, never for receiving',
      'Decline any unexpected collect requests',
      'Check the UPI ID carefully before any transaction'
    ],
    dont: [
      'Never enter your UPI PIN to receive a payment',
      'Don\'t scan QR codes sent by strangers claiming to send you money',
      'Don\'t share your UPI ID + phone number together publicly'
    ]
  },
  {
    id: 'phishing',
    title: 'Phishing Links',
    icon: '🎣',
    risk: 'high',
    category: 'phishing',
    summary: 'Fake websites disguised as IRCTC, SBI, HDFC, or government portals steal your credentials.',
    how: 'You receive a WhatsApp message, SMS, or email with an "urgent" link — your account is suspended, you won a prize, your parcel is stuck. The link opens a near-perfect copy of a real website. You enter your credentials. Those go straight to the scammer.',
    example: 'Suresh got an SMS: "Your IRCTC account has been suspended. Verify now: irctc-verify-now.in". The site looked exactly like IRCTC. He entered his username and password. His account was used to book and cancel tickets for illegal refunds.',
    red_flags: [
      'URL has extra words or characters: sbi-online-help.com instead of sbi.co.in',
      'No padlock / HTTPS in the browser bar',
      'Urgency: "Verify within 24 hours or your account will be closed"',
      'Link in WhatsApp/SMS from unknown numbers',
      'Website asks for Aadhaar, PAN, or full card number'
    ],
    do: [
      'Always type the official URL manually in your browser',
      'Check the domain carefully: is it .gov.in, .co.in, or a fake?',
      'Use Google Safe Browsing or VirusTotal to check the URL first'
    ],
    dont: [
      'Never click links in SMS or WhatsApp to "verify" accounts',
      'Don\'t enter passwords on sites you reached through a link',
      'Don\'t ignore SSL warnings in your browser'
    ]
  },
  {
    id: 'fake_calls',
    title: 'Fake Bank / KYC / Police Calls',
    icon: '📞',
    risk: 'high',
    category: 'fake_calls',
    summary: '"Digital arrest" calls from fake officers threaten legal action to extort money.',
    how: 'Caller claims to be a CBI officer, court magistrate, bank fraud department, or TRAI. They say a parcel with drugs/illegal items was intercepted in your name, or your number is linked to a crime. They put you under "digital arrest" — threatening you\'ll be arrested if you disconnect. They demand you stay on video call and pay to "clear your name."',
    example: 'Geeta got a call from "CBI Inspector Sharma." He said a parcel with 5kg of MDMA was booked in her name from Mumbai to Singapore. He kept her on video call for 7 hours, threatening arrest. She transferred ₹3.2 lakh to "clear the case." Her family had to tell her it was a scam.',
    red_flags: [
      '"Digital arrest" — no such thing exists in Indian law',
      'Police or CBI never conduct investigations over phone/video',
      'Pressure not to tell family or friends',
      'Demanding money to "settle" criminal charges',
      'WhatsApp video call from someone in police/judge uniform'
    ],
    do: [
      'Hang up. This is 100% a scam — no government body works this way',
      'Tell your family immediately',
      'Call the real police: 100 or 112',
      'File a report at cybercrime.gov.in'
    ],
    dont: [
      'Never stay on a video call under any threat',
      'Don\'t transfer money to "settle" any government case',
      'Don\'t keep the call secret from family as scammers instruct'
    ]
  },
  {
    id: 'fake_news',
    title: 'Fake News / Misinformation',
    icon: '📰',
    risk: 'medium',
    category: 'fake_news',
    summary: 'Viral WhatsApp forwards spread medical, political, and financial misinformation causing real harm.',
    how: 'Fake news spreads via WhatsApp forwards, Facebook posts, and YouTube videos. Common types: fake government schemes ("PM is giving ₹5 lakh to all"), health misinformation ("lemon juice cures cancer"), fake disaster news causing panic, and fake investment advice pumping small stocks.',
    example: 'A viral WhatsApp forward in Gujarat said the government was offering free ration cards via a link. Over 4 lakh people clicked the link and entered their Aadhaar and phone numbers. The data was harvested and sold.',
    red_flags: [
      '"Forwarded many times" label on WhatsApp',
      'No named author, date, or original source',
      'Triggers strong emotion: panic, anger, or greed',
      'Claims about government freebies with suspicious links',
      '"Share with 10 people before midnight" urgency'
    ],
    do: [
      'Check on AltNews (altnews.in) or BoomLive (boomlive.in)',
      'Search the headline on Google News to find original coverage',
      'Ask "Who wrote this? When? What is their source?"'
    ],
    dont: [
      'Don\'t forward anything you haven\'t verified yourself',
      'Don\'t act on WhatsApp medical advice',
      'Don\'t click links in forwards to claim government schemes'
    ]
  },
  {
    id: 'kyc_sim',
    title: 'KYC / SIM Swap Scam',
    icon: '📱',
    risk: 'high',
    category: 'kyc_sim',
    summary: 'Fraudsters update your SIM at a local dealer using your Aadhaar, cutting off your number to steal OTPs.',
    how: 'The scammer gets your Aadhaar number through a data breach or phishing. They visit a mobile store with a fake ID and request a SIM swap. Once done, your number stops working. All OTPs for your bank now go to their SIM. They clean out your account before you even know your number is gone.',
    example: 'Arjun\'s phone showed "No Service" one morning. He thought it was a network issue. By the time he reached an Airtel store 3 hours later, his bank account had three large UPI transfers totalling ₹1.9 lakh.',
    red_flags: [
      'Your phone suddenly loses all network signal (no service)',
      'You stop receiving calls or SMS without explanation',
      'You get an SMS about a SIM change request you didn\'t initiate',
      'Unknown login attempts on banking apps'
    ],
    do: [
      'If your SIM goes dead unexpectedly, call your operator immediately from another phone',
      'Use TAFCOP (tafcop.sancharsaathi.gov.in) to check SIMs on your Aadhaar',
      'Enable 2-step verification on all accounts beyond just SMS OTP'
    ],
    dont: [
      'Don\'t share your Aadhaar number with unknown callers or websites',
      'Don\'t ignore unexpected loss of network for more than 15 minutes',
      'Don\'t use SMS OTP as your only security on high-value accounts'
    ]
  },
  {
    id: 'job_scam',
    title: 'Job / Work-From-Home Scam',
    icon: '💼',
    risk: 'high',
    category: 'job_scam',
    summary: 'Fake job offers require "security deposits" or task completions that steal your money.',
    how: 'Part-time task scams ask you to like YouTube videos, rate hotels, or review apps for ₹500–₹2,000 per task. Initially you get paid. Then a "big task" requires you to invest ₹10,000 first. You never see the return. Traditional job scams promise ₹50k–₹1L/month remote jobs but charge ₹2,000–₹20,000 for "registration," "training kits," or "security deposits."',
    example: 'Kavya was offered ₹800/hour to rate Zomato restaurants on Telegram. She earned ₹3,200 in 3 days (paid out). Then she was given a "premium task" needing a ₹15,000 deposit for higher returns. She paid. The Telegram group went silent.',
    red_flags: [
      'Job requires upfront money ("registration fee," "training kit," "security deposit")',
      'Telegram or WhatsApp recruitment — not LinkedIn or official email',
      'Promised ₹50,000–₹1 lakh/month for simple tasks',
      'Initial small payouts to build trust before asking for large investment',
      'No verifiable company address, website, or GST number'
    ],
    do: [
      'Verify the company on MCA portal (mca.gov.in)',
      'Google the company name + "fraud" or "scam"',
      'Legitimate employers never charge candidates any fee'
    ],
    dont: [
      'Never pay a "deposit" or "registration" to get a job',
      'Don\'t trust job offers that arrive on Telegram or WhatsApp unsolicited',
      'Don\'t share bank details before an in-person or verified video interview'
    ]
  },
  {
    id: 'lottery',
    title: 'Lottery / Prize Scam',
    icon: '🎰',
    risk: 'medium',
    category: 'lottery',
    summary: 'Fake "KBC winner" calls and prize notifications demand tax or processing fees before releasing your prize.',
    how: 'You receive a call, SMS, or WhatsApp message saying you\'ve won a KBC lottery, Amazon spin, or BSNL reward. The prize is ₹25 lakh or a car. To claim it, you must pay "GST," "TDS," or a "processing fee." Every payment unlocks a new fee requirement. The prize never exists.',
    example: 'Mahesh got a WhatsApp call saying he won ₹25 lakh in "KBC Lucky Draw 2025." He paid ₹8,000 GST, then ₹15,000 "RBI clearance fee," then ₹22,000 "customs duty." He lost ₹45,000 total chasing a prize that was never real.',
    red_flags: [
      'You "won" a lottery you never entered',
      'Prize requires upfront fee: GST, TDS, customs, "processing"',
      'KBC never contacts winners via WhatsApp or unknown numbers',
      'Caller refuses to meet in person to handover the prize',
      'Multiple escalating fees with each payment'
    ],
    do: [
      'Verify directly with the company (use their official website number)',
      'Real prizes deduct tax from the prize — they never ask you to pay first',
      'Report on 1930 or cybercrime.gov.in'
    ],
    dont: [
      'Never pay any fee to "claim" a prize or lottery',
      'Don\'t share bank details to receive prize money',
      'Don\'t be convinced by photos of past winners or fake receipts'
    ]
  }
];

/* ============================================================
   QUIZ QUESTIONS
   ============================================================ */
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'OTP Scams',
    q: 'A caller says he\'s from your bank and your account will be blocked in 2 hours unless you share the OTP just sent to your phone. What do you do?',
    options: [
      'Share the OTP since the account might get blocked',
      'Ask him to call back while you check the SMS',
      'Hang up immediately — banks never ask for OTPs',
      'Share only the last 4 digits to be safe'
    ],
    correct: 2,
    explanation: '✅ Correct! No legitimate bank, government body, or company will ever ask for your OTP over the phone. An OTP arriving just as someone calls is a deliberate social engineering attack — they triggered it.'
  },
  {
    id: 2,
    category: 'UPI Fraud',
    q: 'You sold something on OLX. The buyer says he\'ll send money via UPI and asks you to "accept the collect request" and enter your PIN. What is happening?',
    options: [
      'Normal UPI process — you need PIN to receive money',
      'A scam — entering PIN sends money, doesn\'t receive it',
      'Safe, UPI collect requests are always for receiving',
      'The buyer is being cautious about security'
    ],
    correct: 1,
    explanation: '✅ Correct! UPI PIN is only for SENDING money. A "collect request" means someone is asking you to SEND them money. You never need a PIN to receive a UPI payment — it just appears in your account.'
  },
  {
    id: 3,
    category: 'Phishing',
    q: 'You get an SMS: "Your HDFC NetBanking is suspended. Verify at hdfc-secure-login.net within 24 hrs." The link opens a page that looks exactly like HDFC\'s site. What do you do?',
    options: [
      'Log in quickly to avoid getting blocked',
      'Call HDFC first, then log in if they confirm',
      'Close the tab — the URL is fake, this is phishing',
      'Log in but don\'t enter your full password'
    ],
    correct: 2,
    explanation: '✅ Correct! HDFC\'s official domain is hdfcbank.com. "hdfc-secure-login.net" is a fake domain designed to steal credentials. Real banks never suspend accounts via SMS links and never use .net domains for Indian banking.'
  },
  {
    id: 4,
    category: 'Fake Calls',
    q: 'A "CBI officer" calls and says a parcel with illegal items was booked in your name. He keeps you on video call for hours, says you\'re under "digital arrest" and must pay ₹2 lakh to clear your name. What is this?',
    options: [
      'A real investigation — you should cooperate',
      'A 100% scam — "digital arrest" does not exist in Indian law',
      'Possibly real — the CBI does investigate these cases',
      'Real if they show a court order on video'
    ],
    correct: 1,
    explanation: '✅ Correct! "Digital arrest" is not a legal concept in India. No government agency — CBI, police, customs, or court — conducts arrests or investigations via phone or video call. Hang up and call 112.'
  },
  {
    id: 5,
    category: 'Misinformation',
    q: 'A WhatsApp forward says the government is giving ₹5 lakh to all citizens. It has a link to a site that looks like the PMO website and asks for your Aadhaar and bank details. What do you do?',
    options: [
      'Fill in details — this looks like an official scheme',
      'Forward to family first, then fill it in',
      'Don\'t share details — verify on official PIB/PMO website first',
      'Fill in only Aadhaar, not bank details, to be safe'
    ],
    correct: 2,
    explanation: '✅ Correct! All central government schemes are listed at india.gov.in and pib.gov.in. No real scheme asks for Aadhaar + bank details via a WhatsApp link. Any scheme requiring this via forward is data harvesting.'
  },
  {
    id: 6,
    category: 'OTP Scams',
    q: 'Your phone suddenly shows "No Service" for 2 hours despite being in a city with good coverage. What should you do FIRST?',
    options: [
      'Restart your phone and wait',
      'Call your telecom provider from another phone — you may be SIM swapped',
      'Visit an operator store next day',
      'Check if mobile data is turned off'
    ],
    correct: 1,
    explanation: '✅ Correct! Sudden loss of network could be a SIM swap attack — someone is receiving all your OTPs. You must call your telecom provider from another phone IMMEDIATELY and ask them to freeze your number until you can visit a store.'
  },
  {
    id: 7,
    category: 'UPI Fraud',
    q: 'You\'re selling your old laptop on Quickr. The buyer sends a screenshot showing ₹12,000 "transferred" to your UPI but it hasn\'t appeared. He asks you to send the laptop first. What do you do?',
    options: [
      'Send the laptop — the money must be processing',
      'Wait 30 minutes for the payment to clear, then send',
      'Never hand over goods until money appears in your account',
      'Ask for 50% cash and 50% UPI as a compromise'
    ],
    correct: 2,
    explanation: '✅ Correct! Fake payment screenshots are one of the most common OLX/Quickr scams. UPI transactions are near-instant — if money isn\'t in your account within 60 seconds, the payment was not made. Screenshots can be easily faked.'
  },
  {
    id: 8,
    category: 'Phishing',
    q: 'You applied for an IPL team jersey recharge offer on a site shared in a WhatsApp group. It asks for your debit card number, expiry, and CVV to "verify eligibility." The offer looks real. What is this?',
    options: [
      'Legitimate — companies verify eligibility this way',
      'A phishing scam collecting card details',
      'Safe if the offer was shared in a trusted group',
      'Real if the site has HTTPS in the address'
    ],
    correct: 1,
    explanation: '✅ Correct! No legitimate offer, contest, or eligibility check requires your full card number + CVV. IPL teams don\'t offer WhatsApp recharge schemes. Seasonal events (IPL, elections, festivals) are peak times for phishing scams in India.'
  },
  {
    id: 9,
    category: 'Fake Calls',
    q: 'A "Telecom Regulatory Authority" caller says your number will be disconnected due to suspicious activity. To prevent this, you must give them your Aadhaar number and the OTP that will arrive. What do you do?',
    options: [
      'Give Aadhaar only — OTP is too risky',
      'Hang up — TRAI never calls individuals to prevent disconnection',
      'Give details only if they can tell you your current plan',
      'Ask them to send an email first, then call back'
    ],
    correct: 1,
    explanation: '✅ Correct! TRAI (Telecom Regulatory Authority of India) does not call individual subscribers. Telecom companies send official notices via SMS or registered mail — not phone calls asking for Aadhaar and OTP.'
  },
  {
    id: 10,
    category: 'Misinformation',
    q: 'A Telegram group you\'re in offers a "work from home" job: rate hotels on a website for ₹600 per task. You get paid ₹2,400 for the first 4 tasks. Then they offer a "premium task" needing a ₹12,000 advance for higher returns. What do you do?',
    options: [
      'Pay — you\'ve already been paid so this is clearly real',
      'Pay half and negotiate the rest after results',
      'Stop — this is a task scam. Early payments build false trust',
      'Ask for a contract before paying'
    ],
    correct: 2,
    explanation: '✅ Correct! Initial small payouts are the core tactic of task/part-time scams. They pay real money early to build trust. The "premium task" requiring an advance is where they take your money and disappear. Legitimate employers never ask employees to invest money.'
  }
];

/* ============================================================
   SIMULATOR SCENARIOS
   ============================================================ */
export const SCENARIOS = [
  {
    id: 'fake_bank_call',
    title: 'Fake Bank Call',
    icon: '🏦',
    difficulty: 'easy',
    caller_name: '+91-98765-43210',
    caller_status: 'Incoming call',
    steps: [
      { type: 'incoming', text: 'Hello, am I speaking with the account holder? I am calling from SBI Fraud Prevention Cell. We have detected suspicious activity on your account.' },
      { type: 'incoming', text: 'Sir/Madam, to protect your account we need to verify your identity. Please tell me the OTP that just arrived on your registered mobile number.' },
      {
        type: 'choice',
        choices: [
          { text: 'The OTP is 847293', isCorrect: false, consequence: 'Within 30 seconds, ₹45,000 was transferred from your account. The "bank officer" disconnected.', explanation: 'Never share OTPs. This was a social engineering attack. The scammer triggered the OTP themselves and needed you to read it out. Real SBI fraud teams never ask for OTPs.' },
          { text: 'Which branch are you calling from? Let me call back on the official SBI number.', isCorrect: true, consequence: 'The caller became aggressive, said your account would be blocked, then disconnected.', explanation: 'Perfect. Asking to call back on the official number is exactly right. Real bank employees welcome this. Scammers hang up when you try to verify through official channels.' },
          { text: 'I\'ll give you only the first 3 digits: 847', isCorrect: false, consequence: 'The scammer said that\'s enough "for verification" and disconnected. Your account was compromised.', explanation: 'Never share any part of an OTP. Even partial OTPs can help scammers in certain attacks. The moment someone calls asking for OTP verification, it\'s a scam.' }
        ]
      },
      { type: 'incoming', text: '(If you asked to call back) Sir, this is urgent! Your account will be blocked in 10 minutes if you don\'t verify now. There is no time!' },
      {
        type: 'choice',
        choices: [
          { text: 'Okay, the OTP is 847293. Please save my account.', isCorrect: false, consequence: 'The urgency worked. ₹45,000 transferred. The "officer" disconnected immediately.', explanation: 'Urgency and panic are the scammer\'s best weapons. Real bank fraud teams are never in a rush that requires bypassing verification. If someone says "no time," it means they need you panicked and not thinking clearly.' },
          { text: 'I don\'t care. I\'m hanging up and calling 1800-11-2211 (SBI official number) right now.', isCorrect: true, consequence: 'You hung up. Called SBI. They confirmed no suspicious activity and no such call was made from their end.', explanation: 'You handled this perfectly. Hanging up and calling the official number eliminates all risk. Even if your account had a real problem, SBI would never resolve it by asking for your OTP.' }
        ]
      }
    ]
  },
  {
    id: 'upi_refund_trap',
    title: 'UPI Refund Trap',
    icon: '💸',
    difficulty: 'easy',
    caller_name: 'Vikram — OLX Buyer',
    caller_status: 'WhatsApp',
    steps: [
      { type: 'incoming', text: 'Hi, I saw your laptop listing on OLX. I\'m interested. Can we do the deal online? I\'m in Pune but my driver can pick it up.' },
      { type: 'outgoing', text: 'Yes, that\'s fine. The price is ₹18,000 as listed.' },
      { type: 'incoming', text: 'Perfect. I\'ll pay via UPI right now. Please share your UPI ID. I\'m sending a collect request — just accept it and enter your PIN to confirm receipt.' },
      {
        type: 'choice',
        choices: [
          { text: 'Okay, I accepted the request and entered my PIN.', isCorrect: false, consequence: 'You just sent ₹18,000 to the "buyer." The collect request was a payment request, not a receipt. The "buyer" has now disappeared.', explanation: 'Collect requests on UPI require you to SEND money. You should only receive money via UPI — it arrives automatically in your account. Never enter your PIN for someone else\'s collect request.' },
          { text: 'Wait — why do I need to enter my PIN to receive money? UPI doesn\'t work that way.', isCorrect: true, consequence: 'The "buyer" tried to explain "it\'s a new UPI feature." You declined and told him to simply transfer to your UPI ID. He went silent.', explanation: 'Correct. UPI PIN is ONLY for sending money. To receive, you just give your UPI ID — the money arrives without any action from you. Anyone asking you to "enter PIN to receive" is attempting fraud.' }
        ]
      },
      { type: 'incoming', text: '(If you questioned him) Don\'t worry, it\'s a new feature SBI has started. You\'ll see ₹18,000 credited after you accept. I\'ve done this 10 times already!' },
      {
        type: 'choice',
        choices: [
          { text: 'Okay, if it\'s a new feature I\'ll try it.', isCorrect: false, consequence: '₹18,000 debited. "Buyer" blocked you immediately.', explanation: 'Social proof ("I\'ve done this 10 times") is a classic manipulation tactic. UPI\'s mechanism has not changed — PIN is for sending only. Trust the system, not the story.' },
          { text: 'No. Just transfer to my UPI ID directly: myid@upi. If money doesn\'t arrive, no deal.', isCorrect: true, consequence: 'The "buyer" stopped responding. You saved ₹18,000 and avoided the scam.', explanation: 'Perfect response. Insisting on a direct transfer puts all the steps in your control. Real buyers will comply immediately. Scammers disappear because they cannot execute the fraud this way.' }
        ]
      }
    ]
  },
  {
    id: 'digital_arrest',
    title: 'Digital Arrest Scam',
    icon: '👮',
    difficulty: 'medium',
    caller_name: '+91-011-4527-XXXX',
    caller_status: 'Video Call — "CBI HQ"',
    steps: [
      { type: 'incoming', text: 'I am Deputy Inspector Arun Kumar from CBI Cybercrime Division, New Delhi. You are under digital arrest. A courier package in your name was intercepted at IGI Airport containing 5kg of narcotics and 3 forged passports.' },
      { type: 'incoming', text: 'You have been connected to this crime. Do NOT disconnect this call or contact anyone. You are under legal surveillance. Disconnecting will result in physical arrest within 2 hours.' },
      {
        type: 'choice',
        choices: [
          { text: 'I\'m scared. I\'ll stay on the call and cooperate.', isCorrect: false, consequence: 'Over 4 hours the "CBI officer" demanded ₹2.5 lakh as "clearance bond." You transferred it. The call ended. There was no case.', explanation: '"Digital arrest" does not exist in Indian law. The CBI, police, or any court cannot arrest you via phone. Panic and isolation (not telling family) are the weapons here.' },
          { text: 'I\'m disconnecting. "Digital arrest" is not a legal concept. I\'m calling 112.', isCorrect: true, consequence: 'You hung up. Called 112. Filed a report. The number was already flagged by the National Cybercrime portal.', explanation: 'Perfect. "Digital arrest" is a known scam tactic. No government agency conducts arrests or investigations over phone/video. The moment someone says you\'re under "digital arrest," it is fraud.' },
          { text: 'Let me tell my family what is happening first.', isCorrect: true, consequence: 'The "officer" screamed not to contact anyone. You ignored him and called your father. Your father immediately identified it as the "CBI scam" he\'d read about in the news.', explanation: 'Smart. Scammers ALWAYS instruct victims to keep the call secret from family. This is because family members are less panicked and can identify the scam immediately. Telling someone you trust is always the right move.' }
        ]
      }
    ]
  },
  {
    id: 'job_task_scam',
    title: 'IPL Influencer Job Scam',
    icon: '🏏',
    difficulty: 'medium',
    caller_name: 'HR — StarGig Media',
    caller_status: 'Telegram Message',
    steps: [
      { type: 'incoming', text: 'Hi! We are hiring Part-Time Social Media Influencers for IPL 2026 campaign. Earn ₹800–₹1,200 per task. Just like/share IPL posts. No experience needed. Interested?' },
      { type: 'outgoing', text: 'Yes, I\'m interested. What are the tasks exactly?' },
      { type: 'incoming', text: 'You\'ll complete 5 tasks today: follow 5 IPL pages, like 10 posts. For each task you earn ₹600. Payment is instant via UPI. Here\'s Task 1.' },
      { type: 'incoming', text: 'You completed 3 tasks! ₹1,800 has been credited to your UPI. Check your account!' },
      { type: 'incoming', text: 'Excellent work! You\'ve been selected for our Premium Influencer Program. Task 4 pays ₹8,000 but requires a ₹5,000 activation deposit. After task completion you receive ₹13,000 back.' },
      {
        type: 'choice',
        choices: [
          { text: 'I\'ve already received ₹1,800 so this is legitimate. I\'ll pay the ₹5,000 deposit.', isCorrect: false, consequence: 'You paid ₹5,000. Then a ₹12,000 "premium tier" appeared. You paid that too. Then the group went silent. Total loss: ₹17,000.', explanation: 'This is a task/investment hybrid scam. Early payouts are real — they\'re the bait. The escalating "deposits" are the trap. The ₹1,800 you received cost them very little; they planned to take far more from you.' },
          { text: 'Stop. Legitimate jobs don\'t require employees to pay deposits. This is a scam.', isCorrect: true, consequence: 'The "HR" sent three more messages about "missing your chance." You blocked them and reported the Telegram account.', explanation: 'Correct. The rule is simple: no real employer charges their employees to work. "Activation deposits," "security bonds," and "task advance" are all scam vocabulary. Report task scams to cybercrime.gov.in.' }
        ]
      }
    ]
  },
  {
    id: 'phishing_sms',
    title: 'IRCTC Phishing SMS',
    icon: '🚂',
    difficulty: 'hard',
    caller_name: 'IRCTC-Alert (SMS)',
    caller_status: 'SMS received',
    steps: [
      { type: 'incoming', text: 'IRCTC: Your account has been temporarily suspended due to unusual activity. Verify your identity within 12 hours to avoid permanent deactivation. Click: irctc-verify-secure.in/account' },
      {
        type: 'choice',
        choices: [
          { text: 'Click the link — my train is next week, I need the account.', isCorrect: false, consequence: 'The site looked perfect. You entered your IRCTC login. Scammers now control your account and booked 8 tickets worth ₹24,000 using your saved wallet and card.', explanation: 'The urgency ("next week train") is exactly what scammers exploit. The domain "irctc-verify-secure.in" is fake — IRCTC only uses irctc.co.in. Never click SMS links to "verify" accounts.' },
          { text: 'Check the URL carefully: irctc-verify-secure.in — this is NOT irctc.co.in.', isCorrect: true, consequence: 'You opened a browser and typed irctc.co.in directly. Your account was fine — no suspension. The SMS was phishing.', explanation: 'Excellent. The domain check is the most important skill in preventing phishing. IRCTC only ever uses irctc.co.in. Any variation is fake. Always type URLs manually.' },
          { text: 'Forward the SMS to family to warn them.', isCorrect: false, consequence: 'Three family members clicked the link before realising it was fake. Two had accounts compromised.', explanation: 'Well-intentioned but harmful — forwarding phishing links spreads the threat. Instead, warn family in a message, share only the text (not the link), and report to 1930 or the IRCTC helpline.' }
        ]
      }
    ]
  },
  {
    id: 'fake_investment',
    title: 'Fake Stock Market App',
    icon: '📈',
    difficulty: 'hard',
    caller_name: 'Rahul — Investment Club',
    caller_status: 'WhatsApp Group',
    steps: [
      { type: 'incoming', text: 'Welcome to Elite Investors Club 🇮🇳. Our AI trading signals gave 340% returns last quarter. We share tips daily. Today\'s pick: buy XYZ Ltd at ₹42, target ₹78.' },
      { type: 'incoming', text: 'Our members who invested ₹50,000 last month already have ₹1.7 lakh! Screenshots below. The app is linked — deposit and start earning. Minimum investment: ₹10,000.' },
      {
        type: 'choice',
        choices: [
          { text: 'The screenshots look real and 340% is amazing. I\'ll invest ₹25,000.', isCorrect: false, consequence: 'The "app" showed ₹25,000 growing to ₹68,000 in 2 weeks. When you tried to withdraw, a "30% tax" of ₹20,400 was required first. You paid it. Then a "compliance fee." Total lost: ₹52,000. The app went offline.', explanation: 'Investment scams (accounting for 76% of cyber-fraud losses in India, 2025) work by showing fake profits in a controlled app. The trap is the "withdrawal fee" — you keep paying to release money that was never there.' },
          { text: 'SEBI-registered advisors don\'t operate via WhatsApp groups. This is a pig butchering scam.', isCorrect: true, consequence: 'You reported the group to SEBI\'s SCORES portal (scores.sebi.gov.in) and left. The group was flagged within 48 hours.', explanation: 'Perfect identification. "Pig butchering" (fatten then slaughter) is the #1 investment fraud globally. SEBI-registered advisors must provide their registration number. WhatsApp trading groups with guaranteed returns are always fraudulent.' }
        ]
      }
    ]
  },
  {
    id: 'deepfake_call',
    title: 'AI Deepfake Voice Scam',
    icon: '🤖',
    difficulty: 'hard',
    caller_name: 'Your "Brother" Rohan',
    caller_status: 'Audio call',
    steps: [
      { type: 'incoming', text: '(Voice sounds exactly like your brother Rohan) "Hey! It\'s me. I\'m in a terrible situation. I had a small accident near Bangalore, police are here, they want ₹35,000 fine paid immediately or they\'ll arrest me. Please transfer ASAP — I\'ll explain later."' },
      {
        type: 'choice',
        choices: [
          { text: 'The voice is exactly Rohan\'s. Transfer ₹35,000 immediately.', isCorrect: false, consequence: 'You transferred the money. Called Rohan back. He picked up — at home in Delhi, completely fine. An AI cloned his voice from a 30-second audio it found online.', explanation: 'AI voice cloning can replicate someone\'s voice from as little as 3 seconds of audio (social media reels, YouTube). This is a growing threat. The safeguard is always calling back on the known number or using a pre-agreed family code word for emergencies.' },
          { text: 'Hang up and call Rohan on his saved number directly.', isCorrect: true, consequence: 'Rohan answered immediately — he was at home. The "emergency call" was a deepfake. You saved ₹35,000.', explanation: 'This is the correct protocol for all emergency financial requests. No matter how authentic the voice sounds, always verify by calling back on a number you already have saved. AI voice cloning cannot intercept that callback.' },
          { text: 'Ask a question only Rohan would know the answer to.', isCorrect: true, consequence: 'The "AI Rohan" paused, gave a vague answer ("come on, just send it fast"). You became suspicious and hung up.', explanation: 'Good thinking. Pre-agreed family secret questions or code words are excellent defences against voice scams. AI voice clones can mimic tone and accent but cannot access personal family memories.' }
        ]
      }
    ]
  }
];