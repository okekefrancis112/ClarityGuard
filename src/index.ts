#!/usr/bin/env node

/**
 * ClarityGuard — Clarity Smart Contract Security Scanner
 *
 * Usage:
 *   clarityguard scan <file-or-directory>   Scan Clarity contracts for vulnerabilities
 *   clarityguard scan <path> --json         Output results as JSON
 *   clarityguard detectors                  List all available detectors
 *   clarityguard --help                     Show help
 */

import * as fs from "fs";
import * as path from "path";
import { analyze, analyzeMultiple, getDetectorList } from "./analyzer";
import { formatTerminal, formatJSON } from "./reporter";

const VERSION = "0.1.0";

function printHelp(): void {
  console.log(`
  ClarityGuard v${VERSION} — Clarity Smart Contract Security Scanner

  USAGE:
    clarityguard scan <file-or-directory>    Scan .clar files for vulnerabilities
    clarityguard scan <path> --json          Output results as JSON
    clarityguard detectors                   List all available detectors
    clarityguard --help                      Show this help message
    clarityguard --version                   Show version

  EXAMPLES:
    clarityguard scan contracts/
    clarityguard scan my-contract.clar
    clarityguard scan contracts/ --json > report.json
    clarityguard detectors

  ABOUT:
    ClarityGuard statically analyzes Clarity smart contracts to detect
    security vulnerabilities, code quality issues, and potential bugs
    before deployment to Stacks mainnet.

    https://github.com/clarityguard/clarityguard
`);
}

function printVersion(): void {
  console.log(`ClarityGuard v${VERSION}`);
}

function printDetectors(): void {
  const detectors = getDetectorList();
  const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
  };

  const severityColor: Record<string, string> = {
    critical: colors.red + colors.bold,
    high: colors.red,
    medium: colors.yellow,
    low: colors.cyan,
    info: colors.dim,
  };

  console.log(
    `\n${colors.bold}${colors.cyan}  ClarityGuard Detectors (${detectors.length} total)${colors.reset}\n`
  );

  for (const d of detectors) {
    const color = severityColor[d.severity] || "";
    console.log(
      `  ${color}[${d.severity.toUpperCase().padEnd(8)}]${colors.reset} ${colors.bold}${d.id}${colors.reset}`
    );
    console.log(`               ${colors.dim}${d.description}${colors.reset}`);
    console.log("");
  }
}

function findClarityFiles(target: string): string[] {
  const stat = fs.statSync(target);

  if (stat.isFile()) {
    if (target.endsWith(".clar")) {
      return [target];
    }
    console.error(`Error: '${target}' is not a .clar file.`);
    process.exit(1);
  }

  if (stat.isDirectory()) {
    const files: string[] = [];
    function walk(dir: string): void {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".clar")) {
          files.push(fullPath);
        }
      }
    }
    walk(target);
    return files;
  }

  console.error(`Error: '${target}' is not a file or directory.`);
  process.exit(1);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    printVersion();
    process.exit(0);
  }

  if (args[0] === "detectors") {
    printDetectors();
    process.exit(0);
  }

  if (args[0] === "scan") {
    if (args.length < 2) {
      console.error("Error: Please specify a file or directory to scan.");
      console.error("Usage: clarityguard scan <file-or-directory>");
      process.exit(1);
    }

    const target = args[1];
    const jsonOutput = args.includes("--json");

    if (!fs.existsSync(target)) {
      console.error(`Error: '${target}' does not exist.`);
      process.exit(1);
    }

    const files = findClarityFiles(target);

    if (files.length === 0) {
      console.error(`Error: No .clar files found in '${target}'.`);
      process.exit(1);
    }

    const inputs = files.map((f) => ({
      source: fs.readFileSync(f, "utf-8"),
      filename: f,
    }));

    const results = analyzeMultiple(inputs);

    if (jsonOutput) {
      console.log(formatJSON(results));
    } else {
      console.log(formatTerminal(results));
    }

    // Exit with error code if critical/high findings
    const hasCritical = results.some((r) => r.stats.critical > 0);
    const hasHigh = results.some((r) => r.stats.high > 0);
    if (hasCritical || hasHigh) {
      process.exit(1);
    }

    process.exit(0);
  }

  console.error(`Error: Unknown command '${args[0]}'.`);
  console.error("Run 'clarityguard --help' for usage.");
  process.exit(1);
}

main();
