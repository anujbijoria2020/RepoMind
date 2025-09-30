'use client'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/use-project'
import { DialogTitle } from '@radix-ui/react-dialog';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const InviteButton = () => {
    const {projectId} = useProject();
    const [open,setOpen] = useState(false);
    const [origin,setOrigin] = useState('');

    useEffect(()=>{
      if(typeof window!=='undefined'){
        setOrigin(window.location.origin);
      }
    },[]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Invite Team Member
                </DialogTitle>
            </DialogHeader>
            <p className='text-sm text-gray-500'>
                Ask them to paste this link
            </p>
            <Input readOnly onClick={()=>{
                navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`)
                toast.success("copied to clipboard")
            }}
            value={`${origin}/join/${projectId}`}
            />
        </DialogContent>
      </Dialog>
      <Button onClick={()=>{
        setOpen(true)
      }} size={'sm'}>
        Invite Members
      </Button>
    </>
  )
}

export default InviteButton
