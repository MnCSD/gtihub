"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadArea from "./upload-area";

type UploadInterfaceProps = {
  username: string;
  repo: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

export default function UploadInterface({ username, repo, user }: UploadInterfaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Add repository info to form data
      formData.append("username", username);
      formData.append("repo", repo);
      
      // Add files to form data
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload files");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      // Redirect to repository page
      router.push(`/${username}/${repo}`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag-and-drop area */}
      <UploadArea onFilesSelected={handleFilesSelected} />

      {/* Commit form */}
      <div className="grid grid-cols-[40px_1fr] gap-3">
        {/* Avatar placeholder */}
        <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-white/70">
              {(user?.name || user?.email || "").slice(0, 1).toUpperCase() || "?"}
            </span>
          )}
        </div>

        <form
          className="border border-white/20 rounded-md overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <div className="font-semibold">Commit changes</div>
          </div>

          <div className="p-4 space-y-3">
            <input
              name="title"
              defaultValue="Add files via upload"
              placeholder="Add a title"
              className="w-full rounded-md bg-[#0b0f14] border border-white/20 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#58a6ff]"
              required
            />
            <textarea
              name="description"
              placeholder="Add an optional extended description..."
              rows={4}
              className="w-full rounded-md bg-[#0b0f14] border border-white/20 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#58a6ff]"
            />

            <div className="space-y-2 text-sm">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="dest" value="main" defaultChecked className="mt-1" />
                <span>
                  Commit directly to the <span className="px-1 py-0.5 rounded bg-white/10 text-white/90">main</span> branch.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-white/80">
                <input type="radio" name="dest" value="new-branch" className="mt-1" />
                <span>
                  Create a new branch for this commit and start a pull request. <a className="text-[#58a6ff] hover:underline" href="#">Learn more about pull requests</a>.
                </span>
              </label>
            </div>

            {/* File summary */}
            {files.length > 0 && (
              <div className="border border-white/20 rounded-md overflow-hidden bg-white/5">
                <div className="px-4 py-2 text-sm text-white/70 bg-white/5 border-b border-white/10">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </div>
                <div className="max-h-32 overflow-auto">
                  {files.map((file, index) => (
                    <div key={index} className="px-4 py-2 text-sm text-white/90 border-b border-white/10 last:border-b-0">
                      <span className="text-green-400">+</span> {file.name}
                      <span className="text-white/50 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-[#0b0f14] border-t border-white/10 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || files.length === 0}
              className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-md"
            >
              {isSubmitting ? "Uploading..." : "Commit changes"}
            </button>
            <button
              type="button"
              className="text-white/80 hover:text-white text-sm px-3 py-1.5"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}