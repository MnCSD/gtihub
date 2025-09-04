"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  }
  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Centered auth box */}
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/github-mark-white.png"
              alt="Logo"
              width={40}
              height={40}
            />
          </div>

          <h1 className="text-center text-2xl font-semibold text-white mb-6">
            Sign in to GitHub
          </h1>

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Username/email */}
            <div>
              <label className="block text-sm mb-1">
                Username or email address
              </label>
              <input
                type="text"
                className="w-full h-10 rounded-md bg-[#0d1117] border border-[#30363d] px-3 text-sm text-white placeholder:text-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm">Password</label>
                <a href="#" className="text-sm text-[#58a6ff] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                className="w-full h-10 rounded-md bg-[#0d1117] border border-[#30363d] px-3 text-sm text-white placeholder:text-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 text-[#6e7681]">
              <div className="h-px flex-1 bg-[#30363d]" />
              <span className="text-xs">or</span>
              <div className="h-px flex-1 bg-[#30363d]" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => signIn("google")}
              className="w-full h-10 rounded-md bg-[#21262d] border border-[#30363d] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#2b3138]"
            >
              <GoogleIcon /> Continue with Google
            </button>

            {/* Create account */}
            <p className="text-center text-sm text-[#8b949e]">
              New to GitHub?{" "}
              <a href="/signup" className="text-[#58a6ff] hover:underline">
                Create an account
              </a>
            </p>

            <p className="text-center text-sm">
              <a href="#" className="text-[#58a6ff] hover:underline">
                Sign in with a passkey
              </a>
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-14 border-t border-[#30363d] text-[#8b949e] text-sm flex items-center justify-center px-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Docs
          </a>
          <a href="#" className="hover:text-white">
            Contact GitHub Support
          </a>
          <a href="#" className="hover:text-white">
            Manage cookies
          </a>
          <a href="#" className="hover:text-white">
            Do not share my personal information
          </a>
        </nav>
      </footer>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.746 32.658 29.248 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.817C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.21 35.091 26.735 36 24 36c-5.224 0-9.712-3.317-11.292-7.946l-6.54 5.036C9.467 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.02 12.02 0 01-4.095 5.565l.003-.002 6.191 5.238C36.888 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
