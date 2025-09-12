"use client";

import { useState } from "react";

type CommitFormProps = {
  username: string;
  repo: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

export default function CommitForm({ username, repo, user }: CommitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Wire up to commits API when ready
      // Endpoint: /api/repositories/{username}/{repo}/commits (POST)
      // Build a single commit with uploaded files and default message.
      console.log("Submit commit changes (UI only)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-[40px_1fr] gap-3">
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
          />
          <textarea
            name="description"
            placeholder="Add an optional extended description..."
            rows={4}
            className="w-full rounded-md bg-[#0b0f14] border border-white/20 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-[#58a6ff]"
          />

          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="dest" defaultChecked className="mt-1" />
              <span>
                Commit directly to the <span className="px-1 py-0.5 rounded bg-white/10 text-white/90">main</span> branch.
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer text-white/80">
              <input type="radio" name="dest" className="mt-1" />
              <span>
                Create a new branch for this commit and start a pull request. <a className="text-[#58a6ff] hover:underline" href="#">Learn more about pull requests</a>.
              </span>
            </label>
          </div>
        </div>

        <div className="px-4 py-3 bg-[#0b0f14] border-t border-white/10 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-md"
          >
            {isSubmitting ? "Committing..." : "Commit changes"}
          </button>
          <button
            type="button"
            className="text-white/80 hover:text-white text-sm px-3 py-1.5"
            onClick={() => history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}