"use client";

import { useState } from "react";
import { Input, Button } from "../ui";
import { formatRoomCode } from "@/lib/utils";

interface JoinRoomFormProps {
  onSubmit: (displayName: string, roomCode: string) => void;
  loading?: boolean;
}

export default function JoinRoomForm({ onSubmit, loading = false }: JoinRoomFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim() && roomCode.trim()) {
      onSubmit(displayName.trim(), formatRoomCode(roomCode));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Seu Nome</label>
        <Input
          type="text"
          placeholder="Digite seu nome"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={20}
          fullWidth
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Código da Sala</label>
        <Input
          type="text"
          placeholder="ABC123"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="text-2xl text-center font-mono font-bold tracking-wider"
          fullWidth
          required
        />
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Entrar na Sala
      </Button>
    </form>
  );
}