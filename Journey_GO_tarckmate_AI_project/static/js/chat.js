console.log("Trackmate AI script loaded successfully!");

const chatFab = document.getElementById("chatFab");
const fabIcon = document.getElementById("fabIcon");
const chatContainer = document.getElementById("chatContainer");
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const micBtn = document.getElementById("micBtn");
const clearBtn = document.getElementById("clearBtn");

let sessionId = "trackmate_session_" + Math.random().toString(36).substring(2, 11);
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let isChatOpen = false;

// UI Toggle Logic
chatFab.addEventListener("click", () => {
    isChatOpen = !isChatOpen;
    chatContainer.classList.toggle("active", isChatOpen);
    chatFab.classList.toggle("open", isChatOpen);
    fabIcon.textContent = isChatOpen ? "✖" : "🤖";
});

function appendMessage(text, sender) {
    if (!text || !chatMessages) return;
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function playAudio(base64Data) {
    if (!base64Data) return;
    const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
    audio.play().catch(err => console.error("Audio playback error:", err));
}

// Improved Request Handler
async function executeChatRequest(payload, loadingDiv) {
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: payload.session_id,
                message: payload.message || "",
                audio_base64: payload.audio_base64 || null
            })
        });

        // Parse response
        const data = await response.json();
        
        // Always remove thinking indicator
        if (loadingDiv) loadingDiv.remove();

        if (!response.ok) {
            throw new Error(data.detail || `Server error: ${response.status}`);
        }
        
        // Success path
        if (data.audio) playAudio(data.audio);
        appendMessage(data.response, "bot");

    } catch (error) {
        if (loadingDiv) loadingDiv.remove();
        console.error("Chat Request Failed:", error);
        // Display specific error to user
        appendMessage("An issue occurred. Please check the terminal logs.", "bot");
    }
}

async function sendMessage(overrideText = null) {
    if (!userInput) return;
    const textToSend = overrideText !== null ? overrideText : userInput.value.trim();
    if (!textToSend && audioChunks.length === 0) return;

    if (overrideText === null) {
        appendMessage(textToSend, "user");
        userInput.value = "";
    }

    // Add thinking state
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot loading-msg";
    loadingDiv.textContent = "Trackmate is thinking...";
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const audioB64 = reader.result.split(',')[1];
            await executeChatRequest({ session_id: sessionId, message: textToSend, audio_base64: audioB64 }, loadingDiv);
            audioChunks = []; // Reset chunks after sending
        };
    } else {
        await executeChatRequest({ session_id: sessionId, message: textToSend }, loadingDiv);
    }
}

// Event Listeners
if (userInput) {
    userInput.addEventListener("keydown", (e) => { 
        if (e.key === "Enter") sendMessage(); 
    });
}

if (clearBtn) {
    clearBtn.addEventListener("click", () => { 
        chatMessages.innerHTML = ""; 
        sessionId = "trackmate_session_" + Math.random().toString(36).substring(2, 11);
    });
}

if (micBtn) {
    micBtn.addEventListener("click", async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = []; // Reset previous audio
                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                mediaRecorder.onstop = () => sendMessage(""); 
                mediaRecorder.start();
                isRecording = true;
                micBtn.classList.add("recording");
                micBtn.innerText = "🛑";
            } catch (err) {
                console.error("Microphone access denied:", err);
                appendMessage("Microphone access denied.", "bot");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            micBtn.classList.remove("recording");
            micBtn.innerText = "🎤";
        }
    });
}