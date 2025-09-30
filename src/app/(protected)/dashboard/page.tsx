"use client";

import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLinkIcon, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commitlog"
import AskQuestionCard from "./AskQuestionCard";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archiveButton";
import InviteButton from "./InviteButton";
import TeamMembers from "./TeamMembers";
import MobileAppSidebar from "./MobileSidebar";

export default function Page() {
  const { project } = useProject();
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* github link */}
        <div className="bg-primary min-w-full rounded-md px-4 py-3">
            <div className="flex items-center">
                <Github className="size-5 text-white"/>
                <div className="ml-2">
                 <p className="text-sm font-medium text-white">
                    This project is linked to {" "}
                    <Link href={project?.githubUrl??''} className="inline-flex items-center text-white/80 hover:underline">
                    {project?.githubUrl}
                    <ExternalLinkIcon/>
                    </Link>
                 </p>
                </div>
            </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
            <TeamMembers/>
            <InviteButton/>
            <ArchiveButton/>
        </div>
      </div>

{/* cards */}
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 ">
            <AskQuestionCard/>
            <MeetingCard/>
        </div>
      </div>

{/* commit log history */}
      <div className="mt-8">
      <CommitLog/>
      </div>
    </div>
  );
}
