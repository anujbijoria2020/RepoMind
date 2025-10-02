'use client'

import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React from 'react'
import MeetingCard from '../dashboard/meeting-card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';

const Page = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery({ projectId }, {
    refetchInterval: 5000
  });

  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const refetch = useRefetch();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <MeetingCard />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Meetings</h1>
      </div>

      {isLoading && (
        <div className="text-gray-500">Loading meetings...</div>
      )}

      {!isLoading && meetings?.length === 0 && (
        <div className="text-gray-500">No meetings found.</div>
      )}

      <ul className="space-y-4">
        {meetings?.map(meeting => (
          <li
            key={meeting.id}
            className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:shadow-md transition-shadow duration-200"
          >
            {/* Meeting Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/meetings/${meeting.id}`}
                  className="text-lg font-semibold text-gray-800 truncate hover:underline"
                >
                  {meeting.name}
                </Link>

                {meeting.status === "PROCESSING" && (
                  <Badge className="bg-yellow-500 text-white">Processing...</Badge>
                )}
                {meeting.status === "COMPLETED" && (
                  <Badge className="bg-green-500 text-white">Completed</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <p>Created: {new Date(meeting.createdAt).toLocaleDateString()}</p>
                <p>{meeting.issues?.length ?? 0} issues</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link href={`/meetings/${meeting.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  deleteMeeting.mutateAsync({ meetingId: meeting.id }, {
                    onSuccess: () => {
                      toast.success("Meeting deleted!");
                      refetch();
                    }
                  });
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
