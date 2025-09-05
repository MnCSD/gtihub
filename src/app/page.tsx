import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import RepoCard from "@/components/repo-card";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user =
    (session?.user as {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null) ?? null;

  if (user) {
    const owner = (user?.name || user?.email || "you").split("@")[0];
    return (
      <main className="min-h-screen bg-[#010409] text-white">
        <Navbar user={user} />

        <div className="px-4 sm:px-6 lg:p-0 py-6 grid grid-cols-1 md:flex min-h-[calc(100vh-56px)]">
          {/* Left sidebar */}
          <div className="xl:col-span-3 h-full w-[340px]">
            <Sidebar owner={owner} ownerImage={user?.image || null} />
          </div>

          {/* Grouped center + right with width constraint */}
          <div className="flex-1 lg:max-w-[1100px] 3xl:max-w-[1540px] mx-auto w-full pt-18">
            <div className="mx-auto lg:max-w-[1230px] max-w-[300px] grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Center feed */}
              <section className="lg:col-span-2 space-y-4">
                <h1 className="text-2xl font-semibold">Home</h1>
                <div className="rounded-lg border border-white/10 bg-[#0d1117] p-3 py-1 flex items-center gap-2">
                  <input
                    className="flex-1 bg-transparent placeholder:text-white/50 focus:outline-none text-sm"
                    placeholder="Ask Copilot"
                  />
                  <button className="rounded  px-3 py-1.5 text-sm">▶</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Create a profile README for me",
                    "Create an issue for a bug",
                    "Get code feedback",
                  ].map((a) => (
                    <button
                      key={a}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
                    >
                      {a}
                    </button>
                  ))}
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0d1117]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-white/60">
                      <div className="inline-flex items-center gap-2">
                        <span>
                          <svg
                            aria-hidden="true"
                            height="16"
                            viewBox="0 0 16 16"
                            version="1.1"
                            width="16"
                            data-view-component="true"
                            fill="currentColor"
                          >
                            <path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"></path>
                          </svg>
                        </span>
                        <span> Trending repositories</span>
                      </div>
                    </div>
                    <button className="text-xs text-white/60 hover:text-white">
                      See more
                    </button>
                  </div>
                  <ul className="p-3 pt-0 px-0 space-y-3">
                    {[
                      {
                        name: "agentscope-ai/agentscope",
                        desc: "AgentScope: Agent-Oriented Programming for Building LLM Applications",
                        lang: "Python",
                        stars: "8.9k",
                      },
                      {
                        name: "LuckyOne7777/ChatGPT-Micro-Cap-Experiment",
                        desc: "This repo powers my blog experiment where ChatGPT manages a real-money micro-cap stock portfolio.",
                        lang: "Python",
                        stars: "5.1k",
                      },
                    ].map((item, index) => (
                      <li
                        key={item.name}
                        className={`rounded ${
                          //if its last no border bottom
                          index === 1 ? "" : "border-b border-white/10"
                        } p-3`}
                      >
                        <div className="mt-2">
                          <RepoCard
                            name={item.name}
                            description={item.desc}
                            language={item.lang}
                            stars={item.stars}
                            compact
                            rightAction={
                              <button className="text-xs rounded border border-white/20 px-1.5 py-0.5 hover:bg-white/10">
                                ☆ Star
                              </button>
                            }
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0d1117]">
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="text-sm text-white/60">
                      <div className="inline-flex items-center gap-2">
                        <span>
                          <svg
                            aria-hidden="true"
                            height="16"
                            viewBox="0 0 16 16"
                            version="1.1"
                            width="16"
                            data-view-component="true"
                            fill="currentColor"
                          >
                            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
                          </svg>
                        </span>
                        <span>Recommended for you</span>
                      </div>
                    </div>
                  </div>

                  <ul className="p-3 pt-0 px-0 space-y-3">
                    {[
                      {
                        name: "yangshun/front-end-interview-handbook",
                        desc: "Front End interview preparation materials for busy engineers (updated for 2025)",
                        lang: "MDX",
                        stars: "43.5k",
                      },
                    ].map((item) => (
                      <li key={item.name} className="rounded p-3">
                        <RepoCard
                          name={item.name}
                          description={item.desc}
                          language={item.lang}
                          stars={item.stars}
                          compact
                          rightAction={
                            <button className="text-xs rounded border border-white/20 px-1.5 py-0.5 hover:bg-white/10">
                              ☆ Star
                            </button>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Right sidebar */}
              <aside className="lg:col-span-1 space-y-4">
                <div className="rounded-lg border border-white/10 bg-[#010409] p-3">
                  <h3 className="text-sm font-semibold text-white/90">
                    Latest changes
                  </h3>
                  <div className="relative pl-4">
                    <div
                      className="absolute left-[9px] top-2 bottom-1 w-px bg-white/20"
                      aria-hidden
                    />
                    <ul className="mt-2 space-y-3 text-sm text-white/70">
                      {[
                        "Improved file navigation and editing in the web UI",
                        "Manage Copilot and users via Enterprise Teams in public preview",
                        "Remote GitHub MCP Server is now generally available",
                      ].map((t, i) => (
                        <li key={i} className="relative pl-2">
                          <span
                            className="absolute -left-3 top-1.5 size-2.5 rounded-full bg-white/60 border border-[#010409]"
                            aria-hidden
                          />
                          <span className="block leading-5">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0d1117] p-3 px-0">
                  <h3 className="text-sm font-semibold text-white/90 pl-3">
                    Explore repositories
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {[
                      {
                        name: "jhlywa / chess.js",
                        lang: "TypeScript",
                        description:
                          "A JavaScript chess library for chess move generation, validation, and engine communication",
                        stars: "4.1k",
                      },
                      {
                        name: "official-stockfish / fishtest",
                        lang: "Python",
                        description:
                          "Distributed testing framework for the Stockfish chess engine",
                        stars: "311",
                      },
                      {
                        name: "excaliburjs / Excalibur",
                        lang: "TypeScript",
                        description:
                          "A JavaScript/TypeScript game engine for making 2D games with HTML5 and WebGL",
                        stars: "2.1k",
                      },
                    ].map((r, index) => (
                      <li
                        key={r.name}
                        className={`rounded border-b border-white/10 p-3 flex flex-col gap-y-3
                            ${index === 2 ? "border-b-0" : "border-b"}
                          `}
                      >
                        <RepoCard
                          name={r.name}
                          description={r.description}
                          language={r.lang}
                          stars={r.stars}
                          compact
                          rightAction={
                            <button className="text-xs rounded border border-white/20 px-1.5 py-0.5 hover:bg-white/10">
                              ☆ Star
                            </button>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
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

      {/* Header */}
      <header className="sticky top-0 z-30 bg-transparent backdrop-blur">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left cluster: Brand + Nav */}
          <div className="flex items-center gap-6 min-w-0">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <Image
                src="/github-mark-white.png"
                alt="Logo"
                width={30}
                height={30}
              />
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
              {[
                "Platform",
                "Solutions",
                "Resources",
                "Open Source",
                "Enterprise",
                "Pricing",
              ].map((item) => (
                <button
                  key={item}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>{item}</span>
                  {item !== "Pricing" && (
                    <svg
                      aria-hidden
                      className="size-3.5 opacity-70"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M5.25 7.75L10 12.5l4.75-4.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right cluster: Search + Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-[#272E49] gap-2 w-[420px] rounded-md border border-white/15 px-3 py-1.5">
              <svg
                aria-hidden
                className="size-4 text-white/60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                className="flex-1 bg-transparent text-sm placeholder:text-white/50 focus:outline-none"
                placeholder="Search or jump to..."
              />
              <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">
                /
              </kbd>
            </div>

            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-md border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10 cursor-pointer"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex rounded-md border border-white/50 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 cursor-pointer"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

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
