'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // or any tooltip library you use

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

  return (
    <TooltipProvider>
      <div className='flex items-center -space-x-1'>
        {members?.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger>
              <img
                src={member.user.imageUrl || ''}
                alt={member.user.firstName!}
                height={30}
                width={30}
                className='rounded-full border-2 border-white shadow-sm cursor-pointer'
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className='flex items-center gap-2'>
                <img
                  src={member.user.imageUrl || ''}
                  alt={member.user.firstName!}
                  className='w-8 h-8 rounded-full'
                />
                <span className='font-medium'>{member.user.firstName} {member.user.lastName}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default TeamMembers
