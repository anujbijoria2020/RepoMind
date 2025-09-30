"use server";
import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { limitFunction } from "p-limit";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  console.log("question is :",question);
  console.log("project id is ",projectId);

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1-("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];


// console.log("result before context is :",result);
// console.log("vector query is :",vectorQuery);

  let context = "";
  for (const doc of result) {
    context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\nsummary of file:${doc.summary}\n\n`;
  }
  console.log("context is :",context);
  

  const limitedFunction = limitFunction(
    async () => {
      try {
        const { textStream } = await streamText({
          model: google("gemini-2.0-flash-lite"),
          prompt: `
You are an AI code assistant answering questions about the codebase.
Audience: technical intern
Traits: expert knowledge, helpful, clever, friendly, kind, inspiring
If the question refers to code or a specific file, provide detailed step-by-step instructions.
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

Use context if available. If the context does not provide the answer, respond with "I am sorry but I don't know the answer."
Do not invent answers outside the context. Answer in markdown with code snippets if needed. Be detailed and accurate.
        `,
        });
        for await (const delta of textStream) {
          stream.update(delta);
        }
      } finally {
        stream.done();
        // console.log("output", stream.value);
        // console.log("files:", result);
      }
    },
    { concurrency: 1 },
  );

  limitedFunction();

  return {
    output: stream.value,
    filesReference: result,
  };
}
