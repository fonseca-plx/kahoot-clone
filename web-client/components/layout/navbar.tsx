"use client";

import Link from "next/link";
import { Home, Trophy } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl hover:text-[#850EF6] transition-colors">
            <Trophy className="text-[#7FF60E]" size={32} />
            <span>Kahoot Clone</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              <Home size={20} />
              <span>Início</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}