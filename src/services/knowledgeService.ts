import fs from "fs";
import path from "path";

export function getKnowledgeBase(): string {
  const srcPath = path.join(
    process.cwd(),
    "src",
    "knowledge",
    "soko-aerial.txt",
  );
  const rootPath = path.join(process.cwd(), "knowledge", "soko-aerial.txt");

  if (fs.existsSync(srcPath)) {
    return fs.readFileSync(srcPath, "utf-8");
  }

  if (fs.existsSync(rootPath)) {
    return fs.readFileSync(rootPath, "utf-8");
  }

  console.warn(
    `Knowledge base file not found at ${srcPath} or ${rootPath}. Returning empty string.`,
  );
  return "";
}
