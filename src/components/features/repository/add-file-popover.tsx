"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlusIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddFilePopoverProps {
  children: React.ReactNode;
}

export default function AddFilePopover({ children }: AddFilePopoverProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleCreateNewFile = () => {
    // TODO: Implement create new file functionality
    console.log("Create new file");
    setOpen(false);
  };

  const handleUploadFiles = () => {
    //push to /${username}/${repo}/upload
    const pathParts = window.location.pathname.split("/");
    const username = pathParts[1];
    const repo = pathParts[2];
    router.push(`/${username}/${repo}/upload`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-42 p-1 bg-[#000] border-white/30 rounded-lg text-white shadow-2xl"
        align="start"
        sideOffset={8}
      >
        {/* Create new file */}
        <button
          onClick={handleCreateNewFile}
          className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/10 rounded-md transition-colors"
        >
          <PlusIcon size={16} className="text-white" />
          <span className="text-white">Create new file</span>
        </button>

        {/* Upload files */}
        <button
          onClick={handleUploadFiles}
          className="w-full flex items-center cursor-pointer gap-2 px-3 py-2 text-sm text-left hover:bg-white/10 rounded-md transition-colors"
        >
          <UploadIcon size={16} className="text-white" />
          <span className="text-white">Upload files</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
