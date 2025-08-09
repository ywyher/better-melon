import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton component for individual controls
function ControlSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Section header skeleton
function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Skeleton className="h-5 w-1 rounded-full" />
      <Skeleton className="h-6 w-32" />
    </div>
  );
}

// Main skeleton component
export default function SubtitleStylesSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row gap-3 justify-between mb-4">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-row gap-2">
          <div className="flex flex-row gap-2">
            {/* Segmented Toggle Skeleton */}
            <Skeleton className="h-10 w-32 rounded-md" />
            {/* Transcription Selector Skeleton */}
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
          {/* Delete Button Skeleton */}
          <Skeleton className="h-10 w-10" />
        </div>
      </div>


      {/* Controls Card Skeleton */}
      <Card className="w-full border-none pt-0 shadow-md">
        <CardHeader>
          <CardTitle className="m-0 p-0"></CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-0">
          
          {/* Font Section */}
          <div className="space-y-4">
            <SectionHeaderSkeleton />
            <div className="pl-3 pr-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlSkeleton />
                <ControlSkeleton />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlSkeleton />
              </div>
            </div>
          </div>

          <Separator className="my-2" />
          
          {/* Text Appearance Section */}
          <div className="space-y-4">
            <SectionHeaderSkeleton />
            <div className="pl-3 pr-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlSkeleton />
                <ControlSkeleton />
              </div>
              <ControlSkeleton />
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Background Style Section */}
          <div className="space-y-4">
            <SectionHeaderSkeleton />
            <div className="pl-3 pr-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlSkeleton />
                <ControlSkeleton />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlSkeleton />
                <ControlSkeleton />
              </div>
            </div>
          </div>

          {/* Extras Section */}
          <div className="space-y-4">
            <SectionHeaderSkeleton />
            <div className="pl-3 pr-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ControlSkeleton />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}