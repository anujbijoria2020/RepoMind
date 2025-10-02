'use client'

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, Presentation } from 'lucide-react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import useProject from '@/hooks/use-project';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import useRefetch from '@/hooks/use-refetch';

export default function MeetingCard() {
    const {project}  = useProject();
    
   const processMeeting = useMutation({
    mutationFn:async(data:{meetingUrl:string,meetingId:string,projectId:string})=>{
        const {meetingUrl,projectId,meetingId} = data;
     const response = await axios.post("/api/process-meeting",{meetingUrl,projectId,meetingId})
     return response.data;
    }

   });

  const [isUploading, setIsUploading] = useState(false);
const refetch = useRefetch();

  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const uploadMeeting = api.project.uploadMeeting.useMutation()


  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      setProgress(0);
      const file = acceptedFiles[0];
   if(!file )return;
      try {
        const downloadUrl = await uploadFileToCloudinary(file as File, setProgress);
         uploadMeeting.mutate({
            projectId:project!.id,
            meetingUrl:downloadUrl,
            name:file!.name
         },
        {
            onSuccess:(meeting)=>{
                toast.success("Meeting uploaded successfully")
                router.push("/meetings");

                processMeeting.mutateAsync({meetingUrl:downloadUrl,meetingId:meeting.id,projectId:project!.id}) 

                refetch();
            },
            onError:()=> {
                toast.error("Something went wrong")
            },
        }
        )
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-4" {...getRootProps()}>
      {!isUploading  && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white text-center">Upload Your Meeting</h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Drag & drop your audio file here or click below to select
          </p>
          <div className="mt-6">
            <Button>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload
              <input type="file" {...getInputProps()} hidden />
            </Button>
          </div>
        </>
      )}

 

{isUploading && (
  <div className="flex flex-col items-center justify-center w-full text-center">
    <div className="w-20 h-20">
      <CircularProgressbar
        value={progress}
        text={`${progress}%`}
        styles={buildStyles({
          pathColor: "#2563eb dark:color-",
          textColor: "#2563eb",
          textSize: '20px',
          trailColor: '#e5e7eb'
        })}
      />
    </div>
    <p className="text-sm text-gray-500 mt-2">Uploading your audio...</p>
  </div>
)}


    </Card>
  );
}
