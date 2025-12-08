"use client";

import Link from "next/link";
import { Gamepad2, Plus, Trophy, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7FF60E]/10 via-white to-[#850EF6]/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy className="text-[#7FF60E]" size={56} />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#7FF60E] to-[#850EF6] bg-clip-text text-transparent">
              Kahoot Clone
            </h1>
          </div>
          <p className="text-2xl text-gray-600 font-semibold">
            Quiz multiplayer em tempo real
          </p>
        </div>

        {/* Main Actions */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {/* Jogar Card */}
          <Link href="/join">
            <Card 
              hover 
              className="p-8 h-full group cursor-pointer transform transition-all hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="w-20 h-20 bg-gradient-to-br from-[#7FF60E] to-[#7FF60E]/70 rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_8px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform">
                  <Gamepad2 size={40} className="text-black" strokeWidth={2.5} />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-4 group-hover:text-[#7FF60E] transition-colors">
                    Jogar
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Entre em uma sala com um código e comece a jogar instantaneamente
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[#850EF6] font-semibold">
                  <span>Entrar agora</span>
                  <Zap size={20} />
                </div>
              </div>
            </Card>
          </Link>

          {/* Criar Quiz Card */}
          <Link href="/quiz/new">
            <Card 
              hover 
              className="p-8 h-full group cursor-pointer transform transition-all hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="w-20 h-20 bg-gradient-to-br from-[#850EF6] to-[#850EF6]/70 rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_8px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform">
                  <Plus size={40} className="text-white" strokeWidth={2.5} />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-4 group-hover:text-[#850EF6] transition-colors">
                    Criar Quiz
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Crie seu próprio quiz e compartilhe com seus amigos
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[#850EF6] font-semibold">
                  <span>Começar a criar</span>
                  <Zap size={20} />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">Por que jogar?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-[#7FF60E]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-[#7FF60E]" size={32} />
              </div>
              <h4 className="font-bold text-xl mb-2">Tempo Real</h4>
              <p className="text-gray-600">
                Jogue em tempo real com WebSocket
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-[#850EF6]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-[#850EF6]" size={32} />
              </div>
              <h4 className="font-bold text-xl mb-2">Multiplayer</h4>
              <p className="text-gray-600">
                Jogue com amigos e compita no placar
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-[#7FF60E]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-[#7FF60E]" size={32} />
              </div>
              <h4 className="font-bold text-xl mb-2">Competitivo</h4>
              <p className="text-gray-600">
                Sistema de pontuação baseado em velocidade
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="font-semibold">
            Kahoot Clone - Projeto educacional
          </p>
          <p className="text-sm mt-2">
            Feito com Next.js, Socket.IO e Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
