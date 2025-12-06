import { io } from "socket.io-client";

const WS_URL = "http://localhost:4000";

// === Helper ===========
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === Teste principal ===
async function runTest() {
  console.log("=".repeat(60));
  console.log("Iniciando teste do WebSocket Server...\n");
  console.log("=".repeat(60));

  // Simular 3 clientes
  const host = io(WS_URL);
  const playerA = io(WS_URL);
  const playerB = io(WS_URL);

  const ROOM_CODE = "LIXZLV"; // código da sala de teste pré-criada no REST API
  let ROOM_ID = ""; // será capturado ao entrar na sala

  // ======== Registrar eventos básicos ========
  function registerBasicEvents(client: any, name: string) {
    client.on("connect", () => console.log(`✅ [${name}] conectado:`, client.id));
    client.on("disconnect", () => console.log(`❌ [${name}] desconectado.`));
    client.on("error", (msg: any) => console.log(`⚠️  [${name}] ERROR:`, msg));
  }

  registerBasicEvents(host, "HOST");
  registerBasicEvents(playerA, "PLAYER A");
  registerBasicEvents(playerB, "PLAYER B");

  // ======== Eventos de sala ========

  host.on("room:joined", (data: any) => {
    console.log("\n🚪 [HOST] Entrou na sala:", data);
    ROOM_ID = data.roomId; // Captura o roomId
  });

  playerA.on("room:joined", (data: any) => {
    console.log("🚪 [PLAYER A] Entrou na sala:", data);
  });

  playerB.on("room:joined", (data: any) => {
    console.log("🚪 [PLAYER B] Entrou na sala:", data);
  });

  host.on("room:player_list", (d: any) => {
    console.log("\n👥 [HOST] Lista de jogadores:", d.players.map((p: any) => p.displayName));
  });

  playerA.on("room:player_list", (d: any) => {
    console.log("👥 [PLAYER A] Lista de jogadores:", d.players.map((p: any) => p.displayName));
  });

  playerB.on("room:player_list", (d: any) => {
    console.log("👥 [PLAYER B] Lista de jogadores:", d.players.map((p: any) => p.displayName));
  });

  // ======== Eventos de jogo ========

  host.on("game:question", (q: any) => {
    console.log("\n" + "=".repeat(60));
    console.log(`❓ [HOST] PERGUNTA #${q.questionId}`);
    console.log(`   Texto: ${q.text}`);
    console.log(`   Alternativas:`, q.choices);
    console.log(`   Tempo limite: ${q.timeLimitSeconds}s`);
    console.log("=".repeat(60));
  });

  playerA.on("game:question", (q: any) => {
    console.log(`\n❓ [PLAYER A] PERGUNTA: ${q.text}`);

    // Responder sempre alternativa 0 após 1s
    setTimeout(() => {
      console.log("   ➡️  [PLAYER A] Respondendo: alternativa 0");
      playerA.emit("game:answer", {
        roomId: ROOM_ID, // Usar o roomId capturado
        questionId: q.questionId,
        selectedIndex: 0,
        timeMs: 1000
      });
    }, 1000);
  });

  playerB.on("game:question", (q: any) => {
    console.log(`❓ [PLAYER B] PERGUNTA: ${q.text}`);

    // Responder sempre alternativa 1 após 2s
    setTimeout(() => {
      console.log("   ➡️  [PLAYER B] Respondendo: alternativa 1");
      playerB.emit("game:answer", {
        roomId: ROOM_ID, // Usar o roomId capturado
        questionId: q.questionId,
        selectedIndex: 1,
        timeMs: 2000
      });
    }, 2000);
  });

  playerA.on("game:answer_result", (d: any) => {
    const emoji = d.correct ? "✅" : "❌";
    console.log(`   ${emoji} [PLAYER A] Resultado: ${d.correct ? "CORRETO" : "ERRADO"} | Pontos: ${d.points}`);
  });

  playerB.on("game:answer_result", (d: any) => {
    const emoji = d.correct ? "✅" : "❌";
    console.log(`   ${emoji} [PLAYER B] Resultado: ${d.correct ? "CORRETO" : "ERRADO"} | Pontos: ${d.points}`);
  });

  host.on("game:leaderboard", (d: any) => {
    console.log("\n🏆 [HOST] LEADERBOARD:");
    d.leaderboard.forEach((p: any, i: number) => {
      console.log(`   ${i + 1}. ${p.displayName} - ${p.score} pontos`);
    });
  });

  host.on("game:question_end", (d: any) => {
    console.log(`\n⏱️  [HOST] Fim da pergunta ${d.questionId} | Resposta correta: ${d.correctIndex}`);
  });

  host.on("game:finished", (d: any) => {
    console.log("\n" + "=".repeat(60));
    console.log("🏁 [HOST] JOGO FINALIZADO!");
    console.log("🏆 LEADERBOARD FINAL:");
    d.leaderboard.forEach((p: any, i: number) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
      console.log(`   ${medal} ${i + 1}. ${p.displayName} - ${p.score} pontos`);
    });
    console.log("=".repeat(60));
    
    // Desconectar todos
    setTimeout(() => {
      host.disconnect();
      playerA.disconnect();
      playerB.disconnect();
      process.exit(0);
    }, 1000);
  });

  playerA.on("game:finished", (d: any) => {
    console.log("\n🏁 [PLAYER A] Jogo finalizado!");
  });

  playerB.on("game:finished", (d: any) => {
    console.log("🏁 [PLAYER B] Jogo finalizado!");
  });

  // ======== Fluxo do Teste ========

  console.log("\n⏳ Aguardando conexão dos clients...");
  await wait(1500);

  console.log("\n▶️  HOST entrando na sala...");
  host.emit("room:join", { code: ROOM_CODE, displayName: "Professor" });

  await wait(1000);

  console.log("▶️  PLAYER A entrando na sala...");
  playerA.emit("room:join", { code: ROOM_CODE, displayName: "Jogador A" });

  await wait(1000);

  console.log("▶️  PLAYER B entrando na sala...");
  playerB.emit("room:join", { code: ROOM_CODE, displayName: "Jogador B" });

  await wait(2000);

  console.log("\n🎮 HOST iniciando o jogo...");
  host.emit("host:start", { roomId: ROOM_ID }); // Passar roomId, não code

  // Timeout de segurança (60s)
  setTimeout(() => {
    console.error("\n⏰ TIMEOUT: Teste excedeu 60 segundos");
    process.exit(1);
  }, 60000);
}

// Tratamento de erros
process.on("unhandledRejection", (error) => {
  console.error("\n❌ Erro não tratado:", error);
  process.exit(1);
});

runTest().catch((error) => {
  console.error("\n❌ Erro ao executar teste:", error);
  process.exit(1);
});