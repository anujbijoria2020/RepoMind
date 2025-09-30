"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const Page = () => {
  const { register, handleSubmit, reset, watch } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();

  const repoUrl = watch("repoUrl");
  const githubToken = watch("githubToken");

  const hasEnoughCredits = checkCredits?.data
    ? checkCredits.data.fileCount! <= checkCredits.data.userCredits
    : false;

  function onSubmit(data: FormInput) {
    if (!checkCredits.data) {
      toast.error("Please check credits first");
      return;
    }

    if (!hasEnoughCredits) {
      toast.error("Insufficient credits to create project");
      return;
    }

    createProject.mutate(
      {
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken!,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          reset();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center gap-12 justify-center">
        <img src="/create.png" alt="Create Project" className="h-56 w-auto" />
      </div>

      <div className="mt-6">
        <h1 className="font-semibold text-2xl">Link your Github Repository</h1>
        <p className="text-sm text-muted-foreground">
          Enter the URL of your repository to link it to RepoMind
        </p>
      </div>

      <div className="mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project Name"
            required
          />

          <Input
            {...register("repoUrl", { required: true })}
            placeholder="URL of your repository"
            required
          />

          <Input
            {...register("githubToken")}
            placeholder="Github Token (optional)"
          />

          {checkCredits.data && (
            <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <p className="text-sm">
                  You will be charged <strong>{checkCredits.data.fileCount!}</strong> credits
                </p>
              </div>
              <p className="text-sm text-green-800">
                You have <strong>{checkCredits.data.userCredits}</strong> credits remaining.
              </p>
            </div>
          )}

          {!checkCredits.data ? (
            <Button
              type="button"
              onClick={() =>
                checkCredits.mutate({
                  githubUrl: repoUrl,
                  githubToken,
                })
              }
              disabled={checkCredits.isPending || !repoUrl}
            >
              {checkCredits.isPending ? "Checking..." : "Check Credits"}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={createProject.isPending || !hasEnoughCredits}
            >
              {hasEnoughCredits
                ? createProject.isPending
                  ? "Creating..."
                  : "Create Project"
                : "Insufficient Credits"}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Page;
