import React from "react";
import SewingMachine from "@/components/hero/SewingMachine";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SewingMachinePreviewPage() {
  return (
    <div className="min-h-screen bg-[#1F2329] text-[#F7F3EC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background atelier subtle grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "linear-gradient(to right, #C9A24A 1px, transparent 1px), linear-gradient(to bottom, #C9A24A 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Top bar info */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#E8C77A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C9A24A] font-serif border border-[#C9A24A]/40 px-3 py-1 rounded-full bg-[#2E333B]/60">
          Static Vector Artwork Preview
        </span>
      </div>

      {/* Artwork container */}
      <div className="w-full max-w-2xl bg-[#2E333B]/40 border border-[#C9A24A]/30 rounded-lg p-6 sm:p-10 shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#E8C77A] tracking-wide">
            Krish Fashion Academy
          </h2>
          <p className="text-xs text-[#F7F3EC]/70 tracking-widest uppercase mt-1">
            Bespoke Atelier Sewing Machine &amp; Tailor Tools
          </p>
        </div>

        {/* The Static SVG Sewing Machine */}
        <SewingMachine />

        {/* Component breakdown */}
        <div className="mt-8 pt-6 border-t border-[#C9A24A]/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-[11px] text-[#F7F3EC]/80 uppercase tracking-widest">
          <div className="bg-[#1F2329]/60 p-2.5 rounded border border-[#C9A24A]/15">
            <span className="block text-[#E8C77A] font-semibold mb-1">Base &amp; Head</span>
            Cast-iron line art
          </div>
          <div className="bg-[#1F2329]/60 p-2.5 rounded border border-[#C9A24A]/15">
            <span className="block text-[#E8C77A] font-semibold mb-1">Mechanisms</span>
            Handwheel &amp; Needle
          </div>
          <div className="bg-[#1F2329]/60 p-2.5 rounded border border-[#C9A24A]/15">
            <span className="block text-[#E8C77A] font-semibold mb-1">Fabric &amp; Stitches</span>
            Silk drape + stitch line
          </div>
          <div className="bg-[#1F2329]/60 p-2.5 rounded border border-[#C9A24A]/15">
            <span className="block text-[#E8C77A] font-semibold mb-1">Floating Tools</span>
            Shears, Tape, Spool, Pin
          </div>
        </div>
      </div>

      <div className="mt-6 text-center z-10">
        <p className="text-xs text-[#E8C77A]/75 tracking-wider font-light">
          Awaiting confirmation before binding GSAP DrawSVG, needle reciprocating loop, and floating tool physics.
        </p>
      </div>
    </div>
  );
}
