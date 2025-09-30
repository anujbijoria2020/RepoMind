'use client'

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import AskQuestionCard from "../dashboard/AskQuestionCard";
import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const Page = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId } as any);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const question = questions?.[questionIndex];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <AskQuestionCard />

      <h1 className="text-xl font-semibold text-gray-800">Saved Questions</h1>

      <div className="flex flex-col gap-3">
        {questions?.map((q, index) => (
          <Sheet key={q.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                <img
                  src={q.user.imageUrl ?? "/default-avatar.png"}
                  alt={q.user.firstName ?? "user"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-medium text-lg line-clamp-1">{q.question}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-1 ">{q.answer}</p>
                </div>
              </div>
            </SheetTrigger>

            {question && questionIndex === index && (
              <SheetContent className="sm:max-w-[90vw] w-full">
                <SheetHeader className="overflow-y-auto max-h-[80vh]">
                  <SheetTitle className="text-lg font-semibold">{question.question}</SheetTitle>

                  <div className="mt-4 overflow-y-auto max-h-[50vh]">
                    <MDEditor.Markdown
                      source={question.answer}
                      className="overflow-y-auto rounded-xl p-3 bg-gray-50 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-2xl"
                    />
                  </div>

                  <div className="mt-6">
                    <CodeReferences
                      fileReferences={(question.fileReferences ?? []) as { fileName: string; sourceCode: string; summary: string }[]}
                    />
                  </div>
                </SheetHeader>
              </SheetContent>
            )}
          </Sheet>
        ))}
      </div>
    </div>
  );
};

export default Page;
