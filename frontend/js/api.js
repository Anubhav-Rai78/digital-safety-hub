const BACKEND_URL = "http://127.0.0.1:8000"; // Local for now, Render later

export async function verifyWithAegis(text) {
    try {
        const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        const data = await response.json();
        return data.verdict;
    } catch (error) {
        console.error("Connection to Fortress failed:", error);
        return "I cannot reach my security database right now.";
    }
}