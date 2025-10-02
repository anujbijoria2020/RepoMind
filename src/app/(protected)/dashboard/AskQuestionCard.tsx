"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import { useRef, useState } from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filesReferences, setFilesReferences] =
    useState<{ fileName: string; sourceCode: string; summary: string }[]>();
  const [answer, setAnswer] = useState("");
const saveAnswer = api.project.saveAnswer.useMutation();
const refetch = useRefetch();

  const onSubmit = async (e: React.FormEvent<HTMLInputElement>) => {
    setAnswer('');
    setFilesReferences([]);
    e.preventDefault();
      if (!project?.id) return;
      setLoading(true);
      
      const { output, filesReference } = await askQuestion(
        question,
        project?.id as any,
      );
      setOpen(true);
      
      setFilesReferences(filesReference);
      console.log(output,filesReference);
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
      console.log("projectId",project?.id);
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-scroll">
          <DialogHeader>
            <div className="flex items-center gap-2">
            <DialogTitle>
              <Image src="/image.png" alt="logo.png" width={40} height={40} />
            </DialogTitle>
 <Button variant={'outline'} className="shadow-md" 
 onClick={()=>{
  saveAnswer.mutate({
    projectId:project!.id,
    question,
    answer,
    fileReferences:filesReferences
  },{
    onSuccess:()=>{
      toast.success("Answer Saved!")
      refetch()
    },
    onError:()=>{
      toast.error("Failed to save answer");
    }
  })
 }}
 >
Save Answer
 </Button>

            </div>
          </DialogHeader>

         <MDEditor.Markdown source={answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-y-scroll rounded-xl p-3 [&::-webkit-scrollbar]:w-0 ml-4"/>
        <div className="h-4"></div>
        <CodeReferences fileReferences={filesReferences as {fileName:string,sourceCode:string,summary:string}[]}/>
       <Button type="button" onClick={()=>{
        setOpen(false);
       }} >close</Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit as any}>
            <Textarea placeholder="which file should i edit to change the home page?" 
            spellCheck={false}
            value={question}
            onChange={e=>{setQuestion(e.target.value)}}
            />
            <div className="h-4"></div>
            <Button type="submit" className="">Ask RepoMind</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
