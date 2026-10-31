import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const agora = new Date();

const timestamp = [
  agora.getFullYear(),
  String(agora.getMonth() + 1).padStart(2, "0"),
  String(agora.getDate()).padStart(2, "0")
].join("-") + "_" + [
  String(agora.getHours()).padStart(2, "0"),
  String(agora.getMinutes()).padStart(2, "0"),
  String(agora.getSeconds()).padStart(2, "0")
].join("-");

const arquivoSaida = path.join(
  rootDir,
  `estrutura_projeto_${timestamp}.txt`
);

const pastasIgnoradas = [
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  ".vscode",
  ".idea",
  "uploads"
];

const extensoesPermitidas = [
  ".ts",
  ".tsx",
  ".json",
  ".md",
  ".css",
  ".sql",
  ".yml",
  ".yaml"
];

const tamanhoMaximoArquivo = 30 * 1024;

let estrutura = "";
let codigo = "";

function ignorarPasta(nome) {
  return pastasIgnoradas.includes(nome);
}

function ignorarArquivo(nome) {
  return (
    nome === ".env" ||
    nome.startsWith(".env.") ||
    nome === "pnpm-lock.yaml" ||
    nome === "package-lock.json" ||
    nome === "yarn.lock" ||
    nome.endsWith(".js") ||
    nome.endsWith(".map") ||
    nome.endsWith(".log")
  );
}

function processar(item, nivel = 0) {
  const nome = path.basename(item);

  if (!fs.existsSync(item)) {
    return;
  }

  const stat = fs.statSync(item);

  if (stat.isDirectory()) {
    if (ignorarPasta(nome)) {
      return;
    }

    estrutura += `${"  ".repeat(nivel)}[DIR] ${nome}\n`;

    const filhos = fs
      .readdirSync(item)
      .sort((a, b) => a.localeCompare(b));

    for (const filho of filhos) {
      processar(
        path.join(item, filho),
        nivel + 1
      );
    }

    return;
  }

  if (ignorarArquivo(nome)) {
    return;
  }

  estrutura += `${"  ".repeat(nivel)}${nome}\n`;

  const extensao = path.extname(nome);

  if (!extensoesPermitidas.includes(extensao)) {
    return;
  }

  if (stat.size > tamanhoMaximoArquivo) {
    codigo += `
================================================================================
ARQUIVO: ${path.relative(rootDir, item)}
================================================================================

[ARQUIVO IGNORADO - ACIMA DE 30KB]

================================================================================
FIM DO ARQUIVO
================================================================================
`;
    return;
  }

  try {
    const conteudo = fs.readFileSync(
      item,
      "utf8"
    );

    codigo += `
================================================================================
ARQUIVO: ${path.relative(rootDir, item)}
================================================================================

${conteudo}

================================================================================
FIM DO ARQUIVO
================================================================================
`;
  } catch (error) {
    codigo += `
================================================================================
ARQUIVO: ${path.relative(rootDir, item)}
================================================================================

[ERRO AO LER ARQUIVO]

================================================================================
FIM DO ARQUIVO
================================================================================
`;
  }
}

console.log("Gerando estrutura e código...");

processar(rootDir);

const resultado =
  "==================== ESTRUTURA ====================\n\n" +
  estrutura +
  "\n\n\n==================== CODIGO ====================\n" +
  codigo;

fs.writeFileSync(
  arquivoSaida,
  resultado,
  "utf8"
);

console.log("✅ Arquivo gerado:");
console.log(arquivoSaida);