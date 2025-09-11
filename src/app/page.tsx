import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Brand top left */}
      <div className="fixed top-6 left-8 z-50 text-3xl font-extrabold italic brand-logo tracking-tight select-none pointer-events-none">
        Ruberic
      </div>
      {/* Glassy Navbar */}
      <nav className="sticky top-6 z-40 flex justify-center w-full">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-full w-1/2 h-11 flex items-center justify-between px-3 py-1 text-sm font-medium transition-all duration-300">
          {/* Removed Mailzinos from here */}
          <div className="flex gap-6 items-center pr-6">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#how" className="hover:text-cyan-400 transition-colors">How it works</a>
          </div>
          <HoverBorderGradient as="div" containerClassName="ml-2">
            <Button size="sm" className="rounded-full text-xs border-none">Sign In</Button>
          </HoverBorderGradient>
        </div>
      </nav>
      {/* Hero Section (Ruberic – Documentation Chatbot Assistant) */}
      <section className="flex-1 flex flex-col items-center justify-center pt-16 pb-20 px-6 text-center gap-6">
        <div className="mx-auto mb-3 bg-white/10 text-white/80 rounded-full px-5 py-1 text-xs font-medium backdrop-blur-sm border border-white/20 w-fit">Open‑source • BYOK</div>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight max-w-3xl">A documentation chatbot assistant powered by RAG</h1>
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">Connect your own LLM provider (Bring Your Own Key) and add accurate, fast documentation Q&A to your product. Query Ruberic via simple API endpoints secured by your dashboard API key.</p>
        <div className="flex items-center gap-4 justify-center">
          <Button size="lg" className="rounded-full px-6 py-5 bg-orange-500/90 hover:bg-orange-500/80">Read the Docs</Button>
          <HoverBorderGradient as="div">
            <Button size="lg" variant="outline" className="rounded-full px-6 py-5">Join the Waitlist</Button>
          </HoverBorderGradient>
        </div>
      </section>

      {/* How Ruberic Works */}
      <section id="how" className="px-6 pb-8 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">How it works</h2>
        <p className="text-zinc-300 mb-6 max-w-3xl">Incoming queries are processed through a retrieval‑augmented generation pipeline. Your content is chunked and embedded, relevant passages are retrieved at query time, and composed with the user prompt for grounded responses.</p>
        <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/40">
          <Image src="/ruberic_internal_architecture.png" alt="Ruberic internal architecture" width={1600} height={900} className="w-full h-auto" priority />
        </div>
      </section>

      {/* Ingestion */}
      <section id="features" className="px-6 pt-8 pb-16 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Ingestion</h2>
        <p className="text-zinc-300 max-w-3xl">Start today by uploading documentation as PDFs or DOC files. We’re building crawler support to automatically fetch and keep docs in sync.</p>
      </section>
      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-zinc-800 mt-8">
        &copy; {new Date().getFullYear()} Ruberic. Built with Next.js & shadcn/ui.
      </footer>
    </div>
  );
}
