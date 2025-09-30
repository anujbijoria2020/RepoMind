import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { Document } from "@langchain/core/documents";
import pLimit from "p-limit";

const limit = pLimit(3);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const summariseModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const aiSummariseCommit = async (diff: string) => {
  return limit(async () => {
    try {
      const response = await summariseModel.generateContent([
        `You are an expert programmer, and you are trying to summarise a git diff.
         Please summarise the following diff file:
         ${diff}`,
      ]);
      return response.response.text()?.trim() || "No summary generated";
    } catch (error) {
      console.log("Error in aiSummariseCommit:", error);
      return "No summary generated due to error";
    }
  });
};

export const summariseCode = async (doc: Document) => {
  return limit(async () => {
    console.log("getting summary for", doc.metadata.source, "from summarise code gemini.ts");
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
    } catch (error) {
      console.log("Error in summariseCode:", error);
      return "No summary generated due to error";
    }
  });
};

export async function generateEmbedding(summary: string) {
  return limit(async () => {
    try {
      const model = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
      const result = await model.embedContent(summary);
      const embedding = result.embedding;
      return embedding.values;
    } catch (error) {
      console.log("Error generating embedding:", error);
      return [];
    }
  });
}
