'use client'
import { Button } from '@/components/ui/button';
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react'
import React from 'react'
import { toast } from 'sonner';

const ArchiveButton = () => {
    const {projectId} = useProject();
    const archiveButton = api.project.archiveProject.useMutation();

    const refetch = useRefetch();

  return (
    <div>
      <Button onClick={()=>{
        const confirm = window.confirm("Are you sure ,you want to archive this project??");
        if(confirm){
            archiveButton.mutateAsync({
                projectId
            },{
                onSuccess:()=>{
                    toast.success("Project successfully Archived!!");
                    refetch();
                },
                onError:()=>{
                    toast.error("Something went wrong !!")
                }
                
            })
        }
        
      }
      
      } variant='destructive' size={'sm'} className='cursor-pointer'>
        Archive
      </Button>
    </div>
  )
}

export default ArchiveButton
