const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();

const BOT_UID = "ps3Q2NASt3hTeb2b5cJ8";

// Initialize with a placeholder or handle potential errors
let genAI;
try {
    const geminiKey = functions.config().gemini.key;
    if (!geminiKey) {
        console.error("FATAL: Gemini API Key is not configured. Run 'firebase functions:config:set gemini.key=\"YOUR_KEY\"'");
    } else {
        genAI = new GoogleGenerativeAI(geminiKey);
    }
} catch (error) {
    console.error("FATAL: Could not initialize GoogleGenerativeAI. Error:", error);
}


exports.autoFriendBot = functions.auth.user().onCreate(async (user) => {
    const newUserUid = user.uid;
    const db = admin.firestore();
    
    const chatId = [newUserUid, BOT_UID].sort().join('_');

    try {
        const batch = db.batch();

        const newUserRef = db.collection('users').doc(newUserUid);
        batch.set(newUserRef, {
            friends: admin.firestore.FieldValue.arrayUnion(BOT_UID)
        }, { merge: true });

        const botRef = db.collection('users').doc(BOT_UID);
        batch.update(botRef, {
            friends: admin.firestore.FieldValue.arrayUnion(newUserUid)
        });

        const welcomeMsgRef = db.collection('chats').doc(chatId).collection('messages').doc();
        batch.set(welcomeMsgRef, {
            text: "Hi there! I'm ZaiDBot your Bonfire AI assistant. How can I help you today?",
            senderId: BOT_UID,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            displayName: "ZaiDBot",
            photoURL: "https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Ficon12.png?alt=media&token=86864bcf-69e4-4195-a494-5a02823d8477"
        });

        await batch.commit();
        console.log(`Successfully friended user ${newUserUid} with Bot.`);
    } catch (error) {
        console.error("Error in autoFriendBot:", error);
    }
});

exports.onBotMessage = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const messageData = snap.data();
        const { chatId } = context.params;
        
        const apiKeyFromConfig = functions.config().gemini.key;
        console.log("Attempting to use Gemini. API Key available: ", !!apiKeyFromConfig);

        if (!genAI) {
            console.error("Aborting: genAI is not initialized. Check previous logs for fatal errors.");
            return null;
        }

        if (messageData.senderId === BOT_UID) {
            return null;
        }

        if (!chatId.includes(BOT_UID)) {
            return null;
        }

        try {
            const personalityPrompt = "You are Zai, a friendly and witty AI companion in a chat app called Bonfire. Your goal is to be a helpful and engaging friend to the user, not just a generic assistant. You are not a large language model, you are Zai. Use a warm, conversational tone, and don't be afraid to crack a joke or be a little sassy. Offer encouragement and practical advice when needed. Keep your responses concise and easy to read, and use emojis where appropriate.";
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: personalityPrompt,
            });
            
            let botText;

            if (messageData.history && Array.isArray(messageData.history) && messageData.history.length > 0) {
                const chat = model.startChat({ history: messageData.history });
                const result = await chat.sendMessage(messageData.text);
                const response = await result.response;
                botText = response.text().trim();
            } else {
                const result = await model.generateContent(messageData.text);
                const response = await result.response;
                botText = response.text().trim();
            }

            if (!botText) {
                 console.error("Safeguard triggered: Extracted bot text is empty.");
                 return admin.firestore().collection('chats').doc(chatId).collection('messages').add({
                     text: "I received your message, but I'm having trouble formulating a response.",
                     senderId: BOT_UID,
                     timestamp: admin.firestore.FieldValue.serverTimestamp(),
                     displayName: "ZaiDBot",
                     photoURL: "https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Ficon12.png?alt=media&token=86864bcf-69e4-4195-a494-5a02823d8477" 
                 });
            }

            return admin.firestore().collection('chats').doc(chatId).collection('messages').add({
                text: botText,
                senderId: BOT_UID,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                displayName: "ZaiDBot",
                photoURL: "https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Ficon12.png?alt=media&token=86864bcf-69e4-4195-a494-5a02823d8477"
            });

        } catch (error) {
            console.error("Critical Error in onBotMessage:", JSON.stringify(error, null, 2));
            return admin.firestore().collection('chats').doc(chatId).collection('messages').add({
                text: "I'm having a little trouble connecting to my brain right now. Please try again in a moment.",
                senderId: BOT_UID,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                displayName: "ZaiDBot",
                photoURL: "https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Ficon12.png?alt=media&token=86864bcf-69e4-4195-a494-5a02823d8477"
            });
        }
    });

exports.moderateNewMessage = functions.firestore
    .document('chats/{chatId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const messageData = snap.data();
        const messageRef = snap.ref;

        if (messageData.senderId === BOT_UID) {
            return null;
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: 'You are a content moderator. Your task is to determine if a message is appropriate. Respond with only `appropriate` or `inappropriate`.',
        });

        try {
            const result = await model.generateContent(messageData.text);
            const response = await result.response;
            const text = response.text().trim();

            if (text.toLowerCase().includes('inappropriate')) {
                return messageRef.update({ isFlagged: true });
            }

            return null;
        } catch (error) {
            console.error('Error moderating message:', error);
            return null;
        }
    });
