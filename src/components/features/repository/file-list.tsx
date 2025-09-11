import { File, Folder } from "lucide-react";
import Link from "next/link";
import { FileItem } from "./types";

interface FileListProps {
  files: FileItem[];
}

export default function FileList({ files }: FileListProps) {
  return (
    <div className="border border-white/20 rounded-b-md overflow-hidden">
      {files.map((item, index) => (
        <div
          key={item.name}
          className={`flex items-center gap-3 p-3 py-2 hover:bg-white/[0.03] ${
            index > 0 ? "border-t border-white/20" : ""
          }`}
        >
          <span className="w-4 text-center text-white/60">
            {item.type === "dir" ? (
              <Folder size={20} color="gray" fill="gray" />
            ) : (
              <File size={20} color="gray" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <Link
              href="#"
              className="text-white hover:underline text-sm hover:text-[#58a6ff]"
            >
              {item.name}
            </Link>
          </div>
          <div className="text-sm text-white/60 min-w-0 max-w-[200px] truncate">
            <Link href="#" className="hover:underline">
              {item.commit}
            </Link>
          </div>
          <div className="text-xs text-white/60 w-24 text-right">
            {item.updated}
          </div>
        </div>
      ))}
    </div>
  );
}