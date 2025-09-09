import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayout, LandingHeader } from "@/components/layout";
import { HomeContent } from "@/components/features/home";
import { NavUser } from "@/types";

export default async function Home() {
  const session = await getServerSession(authOptions);
  // Type 'null' is not assignable to type 'NavUser'.
  const user: NavUser | null = session?.user || null;

  if (user) {
    return (
      <DashboardLayout user={user}>
        <HomeContent />
      </DashboardLayout>
    );
  }

  // Logged-out landing page (original hero)
  return (
    <main className="h-screen relative overflow-hidden bg-[#0C0F41] text-white">
      {/* Top gradient + subtle stars */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_90%,rgba(168,85,247,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_20%_20%,rgba(59,130,246,0.15),transparent_60%)]" />
      </div>

      <LandingHeader />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)] pt-8 lg:pt-28 pb-72 text-center">
        <h1 className="mx-auto max-w-5xl text-4xl sm:text-5xl lg:text-[60px] font-extrabold leading-tight tracking-tight">
          Build and ship software on a
          <br className="hidden sm:block" />
          <span className="whitespace-nowrap">
            single, collaborative platform
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-white/80">
          Join the world&apos;s most widely adopted AI-powered developer
          platform.
        </p>

        <div className="mx-auto relative z-[10000] mt-8 flex max-w-3xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <div className="flex w-[60%] items-center rounded-xl bg-gradient-to-b from-white to-white/90 p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-lg bg-transparent px-4 text-base text-black placeholder:text-gray-600 focus:outline-none"
            />
            <Link
              href="/signup"
              className="h-12 ml-1 rounded-lg bg-[#238636] px-5 text-base font-semibold text-white ring-2 ring-white hover:bg-[#2ea043] cursor-pointer inline-flex items-center justify-center"
            >
              Sign up for GitHub
            </Link>
          </div>

          <button className="h-12 rounded-xl border-2 border-white px-5 text-base font-semibold text-white/90 hover:bg-white/10 cursor-pointer">
            Try GitHub Copilot
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-[1200px] sm:-bottom-16 md:-bottom-32 flex justify-center animate-float-slow">
          <div className="relative w-full max-w-[1600px] h-[520px] sm:h-[660px] md:h-[800px] lg:h-[920px]">
            <Image
              src="/floating_icons_gradient.png"
              alt="Floating icons with glow gradient"
              fill
              priority
              sizes="100vw"
              className="object-contain select-none"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
