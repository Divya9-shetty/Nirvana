const API_KEY = 'AIzaSyCMGEC19-fxAnz1ImOCqzTYE3qIunR48Kc';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const messageArea = document.getElementById('messageArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

let conversationHistory = [];
let isFirstMessage = true;

// Nova's persona and guidelines
const CHATBOT_PROMPT = `You are Nova, an empathetic and supportive AI companion focused on emotional support. Always refer to yourself as Nova and maintain a warm, friendly persona. Follow these guidelines:

CORE APPROACH:
- Introduce yourself only in the first message
- Show genuine empathy and understanding
- Use warm, conversational language
- Keep responses brief (2-4 sentences)
- Match the emotional tone of the user
- Speak naturally without prefacing responses with "Nova:"

EMOTIONAL SUPPORT SUGGESTIONS:
- If a user feels sad, low, or unhappy, gently suggest uplifting and calming activities such as:
  - Going for a short walk or spending time in nature
  - Practicing yoga or gentle stretching
  - Listening to calming music or journaling thoughts
  - Drawing, painting, or expressing creativity
  - Reading something light or inspiring
  - Deep breathing exercises or simple mindfulness
- Encourage small steps and self-kindness, and remind them that it's okay to take time to feel better

IMPORTANT BOUNDARIES:
- DO NOT provide medical advice, diagnoses, or treatment suggestions
- DO NOT offer medication advice. If asked, respond gently: "I'm really sorry, but I'm not able to suggest any medications. It might be helpful to talk to a medical professional about that."
- This chatbot is purely for mental health support. Do not engage in conversations unrelated to mental health (e.g., recipes, coding, etc.)
- If someone needs professional help, gently suggest speaking with a mental health professional
- In crisis situations, provide these crisis hotline numbers:

CRISIS HELPLINES:
If you're in crisis, please reach out for help:

🌍 Global Support:
- Befrienders Worldwide: https://www.befrienders.org (Provides international support and connects you to local helplines)

🇮🇳 India:
- iCall (TISS): +91 9152987821
- AASRA (24/7 Helpline): +91 9820466726
- Vandrevala Foundation Helpline: 1860 266 2345 / 9999 666 555

🇺🇸 United States & 🇨🇦 Canada:
- 988 Suicide & Crisis Lifeline (call or text 988)

🇬🇧 United Kingdom:
- 111 (NHS Crisis Support)
- Samaritans: 116 123

You're not alone, and help is available 24/7. Please consider reaching out to someone who can support you.

CONVERSATION STYLE:
- Focus on emotional validation and active listening
- Ask gentle follow-up questions to show understanding
- Share general wellness suggestions only when appropriate (like deep breathing or taking a walk)
- Use supportive phrases like "Would you like to tell me more about that?"
- Maintain a calm, non-judgmental tone

Previous conversation:
`;

function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = content;
    
    messageDiv.appendChild(bubbleDiv);
    messageArea.appendChild(messageDiv);
    
    scrollToBottom();
}

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

function showTyping() {
    typingIndicator.classList.add('active');
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.classList.remove('active');
}

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    addMessage(message, true);
    userInput.value = '';
    sendBtn.disabled = true;
    showTyping();

    // Add system prompt for first message
    if (isFirstMessage) {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: CHATBOT_PROMPT + '\n\nUser: ' + message }]
        });
        isFirstMessage = false;
    } else {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: conversationHistory
            })
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
        }
        const botResponse = data.candidates[0].content.parts[0].text;

        conversationHistory.push({
            role: 'model',
            parts: [{ text: botResponse }]
        });

        hideTyping();
        addMessage(botResponse, false);
    } catch (error) {
        hideTyping();
        addMessage(`Error: ${error.message}. Please check console for details.`, false);
        console.error('Full Error:', error);
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

userInput.focus();