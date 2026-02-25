'use client';

import { useEffect, useRef } from 'react';

interface TerminalLine {
    text: string;
    type: 'status' | 'chunk' | 'error';
}

interface TerminalBlockProps {
    lines: TerminalLine[];
    isActive: boolean;
}

export default function TerminalBlock({ lines, isActive }: TerminalBlockProps) {
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div className="overflow-hidden rounded-xl border border-white/20 shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a2e] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
                <span className="ml-3 text-xs font-medium text-slate-400 tracking-wide">
                    SPM Agent — AI Roadmap Generator
                </span>
            </div>

            {/* Terminal body */}
            <div
                ref={terminalRef}
                className="max-h-[400px] min-h-[200px] overflow-y-auto bg-[#0d0d1a] p-5 font-mono text-sm leading-relaxed"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.15) transparent',
                }}
            >
                {lines.map((line, i) => (
                    <div key={i} className="mb-1">
                        {line.type === 'status' ? (
                            <span className="text-cyan-300 font-semibold">{line.text}</span>
                        ) : line.type === 'error' ? (
                            <span className="text-red-400 font-semibold">❌ {line.text}</span>
                        ) : (
                            <span className="text-emerald-300/80">{line.text}</span>
                        )}
                    </div>
                ))}

                {/* Blinking cursor */}
                {isActive && (
                    <span className="inline-block h-4 w-2 animate-pulse bg-cyan-300/90 align-middle" />
                )}
            </div>
        </div>
    );
}
