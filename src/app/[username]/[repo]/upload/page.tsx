import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UploadInterface from "@/components/features/repository/upload-interface";

type PageParams = {
  params: Promise<{ username: string; repo: string }>;
};

export default async function UploadFilesPage({ params }: PageParams) {
  const { username, repo } = await params;
  const session = await getServerSession(authOptions);

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    image: session?.user?.image ?? null,
  };

  return (
    <div className="max-w-[980px] mx-auto px-4 py-8 text-white">
      {/* Repository path (breadcrumb-like) */}
      <div className="text-[#58a6ff] text-sm mb-4">
        <span className="hover:underline cursor-default">{username}</span>
        <span className="text-white/40"> / </span>
        <span className="hover:underline cursor-default">{repo}</span>
        <span className="text-white/40"> / </span>
      </div>

      {/* Upload Interface */}
      <UploadInterface username={username} repo={repo} user={user} />
    </div>
  );
}

