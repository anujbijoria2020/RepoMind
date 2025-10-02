"use client";

import React from "react";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ fileReferences }: Props) => {
  const [tab, setTab] = React.useState(fileReferences[0]?.fileName);

  if (fileReferences.length === 0) return null;

  return (
    <div className="max-w-[70vw]">
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="overflow-x-scroll flex gap-2 bg-gray-800 p-1 rounded-md">
          {fileReferences.map((file) => (
            <Tabs.Trigger
              key={file.fileName}
              value={file.fileName}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted dark:text-white",
                { "bg-primary text-primary-foreground": tab === file.fileName }
              )}
            >
              {file.fileName}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {fileReferences.map((file) => (
          <Tabs.Content
            key={file.fileName}
            value={file.fileName}
            className="max-h-[40vh] overflow-scroll max-w-7xl rounded-md border p-3 [&::-webkit-scrollbar]:w-0"
          >
            <SyntaxHighlighter language="typescript" style={atomDark}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
};

export default CodeReferences;
