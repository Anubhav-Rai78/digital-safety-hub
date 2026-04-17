/**
 * PROJECT AEGIS - MASTER ORCHESTRATOR
 * Handles: Localization, View Swapping, UI Hydration, and Backend AI Bridge
 */

let appData = {};
const BACKEND_URL = "https://your-render-app-name.onrender.com"; 

// --- 1. INITIALIZATION & LOCALIZATION ---
async function initApp() {
    try {
        // Fetch language and content data
        const response = await fetch('./locales/en.json');
        if (!response.ok) throw new Error("Locale file missing");
        appData = await response.json();
        
        // 1.1 Static Text Injection (i18n)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            // Safe navigation for nested JSON keys
            const text = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), appData);
            if (text) {
                if (el.tagName === 'INPUT') el.placeholder = text;
                else el.innerHTML = text;
            }
        });

        // 1.2 Hydrate Dynamic Sections
        hydrateEncyclopedia();
        hydrateQuiz();
        
        // 1.3 Launch Default View
        showView('hero');
        console.log("Aether Engine: Systems Nominal. Gemini 2.5 Bridge ready.");
        
    } catch (err) {
        console.error("Critical Failure: App could not hydrate.", err);
    }
}

// --- 2. DYNAMIC CONTENT HYDRATION ---

function hydrateEncyclopedia() {
    const container = document.getElementById('view-scams');
    if (!container || !appData.scams_data) return;

    // Use a safe fallback for the section title
    const titleText = appData.sections?.scams_title || "Threat Encyclopedia";
    container.innerHTML = `<h2 class="view-title">${titleText}</h2>`;
    
    const grid = document.createElement('div');
    grid.className = 'card-grid';

    appData.scams_data.forEach(scam => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.innerHTML = `
            <h3>${scam.icon || '🛡️'} ${scam.title}</h3>
            <p style="color: var(--text-dim); margin-top: 10px; font-size: 0.9rem;">${scam.desc}</p>
            <button class="cta-primary" style="padding: 8px 20px; margin-top: 20px; font-size: 0.8rem;" 
                    onclick="askAegis('${scam.title}')">
                Analyze This Threat
            </button>
        `;
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

function hydrateQuiz() {
    const container = document.getElementById('view-quiz');
    if (!container) return;
    container.innerHTML = `
        <h2 class="view-title">Shield Training</h2>
        <div class="glass-card" style="max-width: 600px; margin: 0 auto; text-align: center;">
            <p id="quiz-question">System Initializing... Quiz module loading from local brain.</p>
            <div id="quiz-options" style="margin-top:20px;"></div>
        </div>
    `;
}

// --- 3. SPA VIEW SWAPPING ---
window.showView = function(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });
    
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.style.display = 'flex';
        // Delay ensures the display: flex is applied before opacity transition
        setTimeout(() => target.classList.add('active'), 20);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// --- 4. AEGIS AI INTERACTION (THE REAL BRIDGE) ---

window.toggleAegis = () => {
    const chat = document.getElementById('aegis-chat');
    chat.classList.toggle('hidden');
};

window.askAegis = (topic) => {
    // Force open chat if it's closed
    document.getElementById('aegis-chat').classList.remove('hidden');
    const input = document.getElementById('ai-input');
    input.value = `Analyze the risk of ${topic} scams in India.`;
    window.sendMessage(); 
};

window.sendMessage = async () => {
    const input = document.getElementById('ai-input');
    const history = document.getElementById('chat-history');
    const query = input.value.trim();

    if (!query) return;

    // 4.1 UI: Add User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user-msg';
    userDiv.innerText = query;
    history.appendChild(userDiv);
    
    input.value = '';
    history.scrollTop = history.scrollHeight;

    // 4.2 UI: Add "Thinking" Bubble
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-msg bot-msg';
    botDiv.innerText = "Consulting Aegis Fortress...";
    history.appendChild(botDiv);

    // 4.3 Network: Call Python Backend
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze?text=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            if (response.status === 429) throw new Error("Quota exceeded");
            throw new Error("Fortress Shield Offline");
        }
        
        const data = await response.json();
        
        // 4.4 Update bubble with AI result
        botDiv.innerText = data.reply || "Analysis complete, but no data was returned.";
        
    } catch (err) {
        console.error("Connection Error:", err);
        botDiv.innerText = err.message === "Quota exceeded" 
            ? "🛡️ Shield Cooling Down: API Quota reached. Wait 60s." 
            : "Critical Error: Cannot reach Backend Fortress. Ensure 'python3 main.py' is running.";
        botDiv.style.color = "#ff4d4d";
    }
    
    history.scrollTop = history.scrollHeight;
};

// --- 5. EVENT LISTENERS ---
document.getElementById('send-ai-btn')?.addEventListener('click', window.sendMessage);

document.getElementById('ai-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') window.sendMessage();
});

// Initialization call
window.addEventListener('DOMContentLoaded', initApp);