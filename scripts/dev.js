const { spawn } = require("child_process");

const dev = spawn(
  "npx",
  [
    "concurrently",
    "-k",
    "-n",
    "DOCKER,BACKEND,FRONTEND",
    "-c",
    "blue,green,magenta",
    "npm:docker",
    "npm:backend",
    "npm:frontend",
  ],
  {
    stdio: "inherit",
    shell: false,
    detached: true,
  },
);

let stopping = false;
let cleanupStarted = false;
let devExitCode = 0;

// Normalise les codes de sortie
function normalizeExitCode(code) {
  return Number.isInteger(code) && code > 0 ? code : 1;
}

// Gestion des signaux système
function stop(signal) {
  if (stopping) return;

  stopping = true;

  console.log(`\nSignal ${signal} reçu.`);
  console.log("Arrêt des serveurs...");

  devExitCode = 0;

  try {
    process.kill(-dev.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") {
      console.error("Erreur lors de l'arrêt du groupe :", error);
    }
  }
}

// Interception des signaux
process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

// Erreur de démarrage de concurrently
dev.on("error", (error) => {
  console.error("\nImpossible de démarrer les serveurs :");
  console.error(error);

  devExitCode = 1;
});

// Fin de concurrently
dev.on("close", (code, signal) => {
  if (cleanupStarted) return;
  cleanupStarted = true;

  if (stopping) {
    console.log("\nArrêt des serveurs terminé.");
  } else {
    // Arrêt inattendu : on considère même le code 0 comme une erreur.
    devExitCode = normalizeExitCode(code);

    console.error(
      `\nArrêt inattendu de concurrently (code : ${code}, signal : ${signal}).`,
    );
  }

  console.log("Arrêt et suppression des conteneurs Docker...");

  const cleanup = spawn("docker", ["compose", "down"], {
    stdio: "inherit",
  });

  cleanup.on("error", (error) => {
    console.error("\nErreur pendant le nettoyage Docker :");
    console.error(error);
  });

  cleanup.on("close", (cleanupCode) => {
    const dockerExitCode =
      cleanupCode === 0 ? 0 : normalizeExitCode(cleanupCode);

    if (dockerExitCode !== 0) {
      console.error(`\nLe nettoyage Docker a échoué (code : ${cleanupCode}).`);
    } else {
      console.log("\nNettoyage Docker terminé.");
    }

    const finalExitCode = devExitCode || dockerExitCode;

    if (finalExitCode === 0) {
      console.log("\nEnvironnement arrêté correctement.");
    } else {
      console.error(
        `\nArrêt terminé avec une erreur (code : ${finalExitCode}).`,
      );
    }

    process.exit(finalExitCode);
  });
});
