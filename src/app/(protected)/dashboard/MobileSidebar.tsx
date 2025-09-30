"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Bot, Presentation, CreditCard, Plus } from "lucide-react";
import Link from "next/link";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "QnA", url: "/qa", icon: Bot },
  { title: "Meetings", url: "/meetings", icon: Presentation },
  { title: "Billing", url: "/billing", icon: CreditCard },
];

export default function MobileAppSidebar() {
  const { projects, projectId, setProjectId } = useProject();

  return (
    <div className="sm:hidden fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Menu
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
          {/* App Links */}
          <div className="p-2">
            {items.map((item) => (
              <DropdownMenuItem key={item.title} asChild>
                <Link href={item.url} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
                  <item.icon className="size-4" />
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>

          <div className="border-t my-2"></div>

          {/* Projects */}
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Projects</p>
            {projects?.map((project) => (
              <DropdownMenuItem key={project.id} asChild>
                <div
                  onClick={() => setProjectId(project.id)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer",
                    project.id === projectId ? "bg-primary text-white" : "hover:bg-gray-100"
                  )}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-gray-200 text-gray-800 text-sm">
                    {project.name[0]}
                  </div>
                  {project.name}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem asChild>
              <Link href="/create" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
                <Plus className="size-4" /> Create Project
              </Link>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
