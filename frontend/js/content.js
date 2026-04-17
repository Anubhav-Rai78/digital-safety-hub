export const scamData = [
    {
        id: 1,
        title: "UPI QR Fraud",
        risk: "Critical",
        desc: "Scammers send a QR code claiming 'Receive Money'. Remember: Scanning a QR is ONLY for sending money, never for receiving."
    },
    {
        id: 2,
        title: "KYC Suspension",
        risk: "High",
        desc: "Urgent SMS claiming your bank account will be blocked. They want you to click a link and enter your PIN/OTP."
    },
    {
        id: 3,
        title: "Part-Time Task Scam",
        risk: "Medium",
        desc: "Offers for easy money by liking YouTube videos or rating hotels. Eventually, they ask for a 'security deposit'."
    }
];

export const quizQuestions = [
    {
        q: "A bank official calls asking for a 'one-time code' to verify your account. Do you share it?",
        options: ["Yes, if they sound official", "No, never share OTPs", "Only if I initiated the call"],
        correct: 1
    }
];