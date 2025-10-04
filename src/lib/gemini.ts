import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { Document } from "@langchain/core/documents";
import pLimit from "p-limit";

const limit = pLimit(3);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const summariseModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export const aiSummariseCommit = async (diff: string) => {
  return limit(async () => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await summariseModel.generateContent([
                `You are an expert programmer, and you are trying to summarise a git diff.
                 Please summarise the following diff file:
                 ${diff}`,
            ]);
            return response.response.text()?.trim() || "No summary generated";
        } catch (error: any) {
            if (error.status === 429) {
                console.warn(`[aiSummariseCommit] Attempt ${attempt + 1} failed due to 429. Retrying...`);
                if (attempt === MAX_RETRIES - 1) {
                    console.error("[aiSummariseCommit] Maximum retries reached.");
                    break;
                }
                const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
                await sleep(delay);
            } else {
                console.error("Error in aiSummariseCommit:", error);
                return "No summary generated due to error";
            }
        }
    }
    return "No summary generated due to error";
  });
};

export const summariseCode = async (doc: Document) => {
  return limit(async () => {
    console.log("getting summary for", doc.metadata.source, "from summarise code gemini.ts");
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const code = doc.pageContent?.slice(0, 1000) || "";
            const response = await summariseModel.generateContent([
                `You are an intelligent senior software engineer explaining ${doc.metadata.source} file.
                 Here is the code:
                 -
                 ${code}
                 -
                 Give a summary no more than 100 words.`,
            ]);
            const summaryText = response.response.text()?.trim() || "No summary generated";
            console.log("summary generated for the document", summaryText);
            return summaryText;
        } catch (error: any) {
            if (error.status === 429) {
                console.warn(`[summariseCode] Attempt ${attempt + 1} failed due to 429 for ${doc.metadata.source}. Retrying...`);
                if (attempt === MAX_RETRIES - 1) {
                    console.error(`[summariseCode] Maximum retries reached for ${doc.metadata.source}.`);
                    break;
                }
                const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
                console.log(`Retrying in ${Math.round(delay / 1000)}s...`);
                await sleep(delay);
            } else {
                console.error("Error in summariseCode:", error);
                return "No summary generated due to error";
            }
        }
    }
    return "No summary generated due to error";
  });
};

export async function generateEmbedding(summary: string) {
  return limit(async () => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const model = genAI.getGenerativeModel({
                model: "text-embedding-004",
            });
            const result = await model.embedContent(summary);
            const embedding = result.embedding;
            return embedding.values;
        } catch (error: any) {
             if (error.status === 429) {
                console.warn(`[generateEmbedding] Attempt ${attempt + 1} failed due to 429. Retrying...`);
                if (attempt === MAX_RETRIES - 1) {
                    console.error("[generateEmbedding] Maximum retries reached.");
                    return [];
                }
                const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
                await sleep(delay);
            } else {
                console.error("Error generating embedding:", error);
                return [];
            }
        }
    }
    return [];
  });
}
