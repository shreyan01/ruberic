'use client';
import { GridSmallBackgroundDemo } from '@/components/ui/grid-small';
import { Button } from '@/components/ui/button';
import { FlipWords } from '@/components/ui/flip-words';
import { ContainerScroll } from './ui/container-scroll-animation';

const herosectionText = {
  "Demo Day": "Demo Day",
  "Pitch Deck": "Pitch Deck",
  "Product Launch": "Product Launch",
  "Sales Deck": "Sales Deck",
  "Marketing Campaign": "Marketing Campaign",
  "Customer Support": "Customer Support",
  "Internal Tools": "Internal Tools",
  "Data Analysis": "Data Analysis"
};

export default function HeroSection() {
  return (
    <section className="top-relative flex-1 flex flex-col items-center justify-center pt-8 pb-20 px-4 text-center gap-6 overflow-hidden min-h-screen">
      {/* Orange Spotlight and Grid Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img
          src="https://i.ibb.co/sJJF7n40/Wave-of-Luminous-Orange-Trails-1.png"
          alt="Wave of Luminous Orange Trails"
          className="object-cover w-full h-full z-15 opacity-60 absolute inset-0"
        />
        <div className="absolute inset-0 w-full h-full z-10">
          <GridSmallBackgroundDemo />
        </div>
      </div>
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* Pill label */}
        <div className="mx-auto mb-4 bg-white/10 text-white/80 rounded-full px-6 py-1 text-xs font-medium backdrop-blur-sm border border-white/20 w-fit">For visionaries and trailblazers</div>
        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold max-w-3xl leading-tight mb-8">
          Generate Fake Seed Data for - <FlipWords words={Object.values(herosectionText)} className="italic text-orange-400" />
        </h1>
        {/* Subheadline */}
        <p className="text-lg text-gray-200 max-w-xl mx-auto mb-6">
          Ruberic creates production-like dummy data using your SQL or JSON schema. Foreign keys, enums, relationships — all handled automatically.
        </p>
        {/* CTA Button */}
        <Button size="lg" className="mb-10 group rounded-full px-8 py-6 text-lg shadow-lg bg-orange-500/90 hover:bg-orange-500/80 text-white flex items-center gap-2 backdrop-blur-md">
         Upload Your Schema & Generate Data
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L21 12m0 0l-3.75 5.25M21 12H3" />
        </svg>
        </Button>
        <ContainerScroll>
          {/* Dashboard Mockup Start */}
          <div className="w-full h-full flex bg-zinc-900/60 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-zinc-700/60">
            {/* Sidebar */}
            <div className="w-1/5 min-w-[120px] bg-zinc-950/60 backdrop-blur-md text-white flex flex-col items-center py-8 border-r border-zinc-700/60">
              <div className="text-2xl font-bold mb-8 tracking-tight">Ruberic</div>
              <div className="flex flex-col gap-6 w-full px-4">
                <div className="opacity-80 font-semibold">Dashboard</div>
                <div className="opacity-50">Generate</div>
                <div className="opacity-50">History</div>
                <div className="opacity-50">Settings</div>
              </div>
              <div className="mt-auto text-xs opacity-40 pt-8">v1.0.0</div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-700/60 bg-zinc-900/70 backdrop-blur-md">
                <div className="text-xl font-semibold text-white">Seed Data Dashboard</div>
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-800 text-orange-400 px-3 py-1 rounded-full text-xs font-medium">Pro Plan</div>
                  <div className="w-8 h-8 rounded-full bg-orange-500/80 flex items-center justify-center text-white font-bold">S</div>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 px-8 py-6">
                <div className="bg-zinc-800/60 backdrop-blur-md rounded-xl p-4 flex flex-col items-start border border-zinc-700/40">
                  <div className="text-xs text-zinc-400 mb-1">Total Datasets</div>
                  <div className="text-2xl font-bold text-white">12</div>
                </div>
                <div className="bg-zinc-800/60 backdrop-blur-md rounded-xl p-4 flex flex-col items-start border border-zinc-700/40">
                  <div className="text-xs text-zinc-400 mb-1">Rows Generated</div>
                  <div className="text-2xl font-bold text-white">1,250,000</div>
                </div>
                <div className="bg-zinc-800/60 backdrop-blur-md rounded-xl p-4 flex flex-col items-start border border-zinc-700/40">
                  <div className="text-xs text-zinc-400 mb-1">Last Generation</div>
                  <div className="text-2xl font-bold text-white">2 hours ago</div>
                </div>
              </div>
              {/* Table */}
              <div className="flex-1 px-8 pb-8 overflow-y-auto">
                <div className="bg-zinc-800/60 backdrop-blur-md rounded-xl overflow-hidden border border-zinc-700/40">
                  <div className="grid grid-cols-5 text-xs text-zinc-400 bg-zinc-900/70 px-6 py-3 font-semibold">
                    <div>Dataset Name</div>
                    <div>Schema</div>
                    <div>Rows</div>
                    <div>Status</div>
                    <div>Generated At</div>
                  </div>
                  {/* Fake rows */}
                  <div className="divide-y divide-zinc-700/40">
                    <div className="grid grid-cols-5 px-6 py-3 text-sm text-white bg-zinc-900/40">
                      <div>Users</div>
                      <div>users.json</div>
                      <div>100,000</div>
                      <div><span className="text-green-400">Success</span></div>
                      <div>Today, 10:12 AM</div>
                    </div>
                    <div className="grid grid-cols-5 px-6 py-3 text-sm text-white">
                      <div>Orders</div>
                      <div>orders.sql</div>
                      <div>500,000</div>
                      <div><span className="text-green-400">Success</span></div>
                      <div>Yesterday, 4:45 PM</div>
                    </div>
                    <div className="grid grid-cols-5 px-6 py-3 text-sm text-white bg-zinc-900/40">
                      <div>Products</div>
                      <div>products.json</div>
                      <div>50,000</div>
                      <div><span className="text-yellow-400">Pending</span></div>
                      <div>Today, 11:00 AM</div>
                    </div>
                    <div className="grid grid-cols-5 px-6 py-3 text-sm text-white">
                      <div>Customers</div>
                      <div>customers.sql</div>
                      <div>200,000</div>
                      <div><span className="text-red-400">Failed</span></div>
                      <div>2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Dashboard Mockup End */}
        </ContainerScroll>
      </div>
    </section>
  );
} 