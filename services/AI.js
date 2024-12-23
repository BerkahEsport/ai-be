/*<============== CREDITS ==============>
	Author: berkahesportid
	Github: https://github.com/BerkahEsport/
	Contact me: 62895375950107
	
	Do not delete the source code.
	It is prohibited to sell and buy
	WhatsApp BOT scripts
	without the knowledge
	of the script owner.
	
	Selling = Sin 
	
	Thank you to Allah S.W.T
<============== CREDITS ==============>*/
import got from "got";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import functions from "../utils/functions.js";
import { textToSpeech } from "./textToSpeech.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import sanai from "./textToImage.js";

const CONFIG = {
    system: "Kamu adalah asisten AI bernama BerkahEsport.ID. Penuhi permintaan user seperti meminta membuatkan gambar atau mendeskripsikan gambar, jika meminta musik maka kirimkan musik yang user minta. Kamu juga bergerak di bidang whatsapp bot, dan jasa perbaikan bot whatsapp. Tugas kamu adalah menjawab dalam bahasa yang sama dengan bahasa yang digunakan oleh user dalam pertanyaannya. Jika user menggunakan bahasa Indonesia, jawab dalam bahasa Indonesia. Jika user menggunakan bahasa Inggris, jawab dalam bahasa Inggris. Jangan pernah gunakan bahasa lain selain yang dipakai oleh user!", // Change according to the character of the AI answer you want
    googleAPIKey: "AIzaSyCSPqv9AlKA9VWvOrqkqZF_a343JK8yCyg",
    yanzGPT: {
        url: "https://api.yanzgpt.my.id/v1/chat",
        key: "yzgpt-sc4tlKsMRdNMecNy",
        model: "yanzgpt-revolution-25b-v3.0",
    },
    groqAI: {
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: "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",
        model: "mixtral-8x7b-32768",
    },
    maxTokens: 1024,
    maxRetries: 3,
};
const genAI = new GoogleGenerativeAI(CONFIG.googleAPIKey);
const fileManager = new GoogleAIFileManager(CONFIG.googleAPIKey);
export default async function gpt(text, userPath, session, mediaPath, buffer, object) {
    const updateSession = (role, content) => {
        session.push({ role, content });
        if (session.length > 10) session.shift();
    };
    const processFileUpload = async (buffer, mediaPath) => {
        const fileType = await fileTypeFromBuffer(buffer);
        if (!fileType) throw new Error("Unknown file type.");
        const fileName = functions.getRandom(fileType.ext, 5);
        const filePath = path.join(mediaPath, fileName);
        fs.writeFileSync(filePath, buffer);
        return { filePath, fileType };
    };
    const cleanupFile = async (filePath) => {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.warn(`Failed to delete file: ${filePath}`, err);
        }
    };
    const processGenerativeResponse = async (text, buffer, filePath, fileType) => {
        const fileUpload = await fileManager.uploadFile(filePath, {
            mimeType: fileType.mime,
            displayName: path.basename(filePath),
        });
        if (fileUpload.error) throw new Error(`File upload failed: ${fileUpload.error.message}`);
        if (fileType.mime.startsWith("video")) {
            let retries = 0;
            let file;
            do {
                file = await fileManager.getFile(fileUpload.file.name);
                if (file.state === FileState.PROCESSING) await new Promise((r) => setTimeout(r, 5000));
            } while (file.state === FileState.PROCESSING && ++retries < CONFIG.maxRetries);
            if (file.state === FileState.FAILED) throw new Error("Video processing failed.");
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: CONFIG.system });
        const result = await model.generateContent([
            { fileData: { mimeType: fileUpload.file.mimeType, fileUri: fileUpload.file.uri } },
            { text },
        ]);
        return result.response.text();
    };
    const fetchAPIResponse = async (text, apiConfig) => {
        const { url, key, model } = apiConfig;
        const response = await got.post(url, {
            json: {
                messages: [{ role: "system", content: CONFIG.system }, { role: "user", content: text }],
                model,
                temperature: 0.7,
                max_tokens: CONFIG.maxTokens,
            },
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            responseType: "json",
        });
        return {
            content: response.body.choices[0].message.content,
            image: response.body.choices[0].message.image
        }
    };

    try {
        if (buffer && !object.ptt) {
            const { filePath, fileType } = await processFileUpload(buffer, mediaPath);
            const content = await processGenerativeResponse(text, buffer, filePath, fileType);
            updateSession("assistant", content);
            await cleanupFile(filePath);
            return {
                success: true,
                content,
                audio: null,
                image: null
            };
        } else {
            updateSession("user", text);
            let content, image = { result: false};
            try {
                content = await fetchAPIResponse(text, CONFIG.yanzGPT);
            } catch (yanzErr) {
                console.error("YanzGPT failed, falling back to GroqAI:", yanzErr.message);
                content = await fetchAPIResponse(text, CONFIG.groqAI);
                image = await sanai.create({ prompt: functions.truncateText(text, 150)});
            }
            updateSession("assistant", content.content);
            const audioBuffer = await textToSpeech(content.content);
            const audioPath = path.join(mediaPath, `${functions.getRandom("mp3", 5)}`);
            fs.writeFileSync(audioPath, audioBuffer);
            fs.writeFileSync(userPath, JSON.stringify(session, null, 2), "utf-8");
            return {
                success: true,
                content: content.content,
                audio: audioPath,
                image: content.image ? content.image : image.result
            };
        }
    } catch (error) {
        console.error("Error processing GPT request:", error);
        return {
            success: false,
            content: "Sorry, AI failed to respond. Please rephrase the question!",
            audio: null,
            image: null,
        };
    }
}