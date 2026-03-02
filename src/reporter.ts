/**
 * ClarityGuard - Report Formatter
 * Outputs analysis results as colored terminal output or JSON.
 */

import { AnalysisResult } from "./analyzer";
import { Finding, Severity } from "./detectors/index";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

function severityColor(severity: Severity): string {
  switch (severity) {
    case "critical":
      return colors.bgRed + colors.white + colors.bold;
    case "high":
      return colors.red + colors.bold;
    case "medium":
      return colors.yellow;
    case "low":
      return colors.cyan;
    case "info":
      return colors.dim;
  }
}

function severityIcon(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "[!!!]";
    case "high":
      return "[!!]";
    case "medium":
      return "[!]";
    case "low":
      return "[~]";
    case "info":
      return "[i]";
  }
}

function formatFinding(finding: Finding, index: number): string {
  const color = severityColor(finding.severity);
  const icon = severityIcon(finding.severity);
  const lines: string[] = [];

  lines.push(
    `  ${color}${icon} #${index + 1} ${finding.title}${colors.reset}`
  );
  lines.push(
    `     ${colors.dim}Severity: ${finding.severity.toUpperCase()} | Line: ${finding.line} | Detector: ${finding.detector}${colors.reset}`
  );
  lines.push(`     ${finding.description}`);

  if (finding.recommendation) {
    lines.push(
      `     ${colors.green}Fix: ${finding.recommendation}${colors.reset}`
    );
  }

  return lines.join("\n");
}

export function formatTerminal(results: AnalysisResult[]): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(
    `${colors.bold}${colors.cyan}  ClarityGuard v0.1.0 — Clarity Smart Contract Security Scanner${colors.reset}`
  );
  lines.push(
    `${colors.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  lines.push("");

  let totalFindings = 0;
  let totalCritical = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  let totalLow = 0;
  let totalInfo = 0;

  for (const result of results) {
    lines.push(
      `${colors.bold}  File: ${result.file}${colors.reset}`
    );
    lines.push(
      `${colors.dim}  ──────────────────────────────────────────────${colors.reset}`
    );

    if (result.stats.parseErrors.length > 0) {
      for (const err of result.stats.parseErrors) {
        lines.push(`  ${colors.red}Parse Error: ${err}${colors.reset}`);
      }
      lines.push("");
      continue;
    }

    if (result.findings.length === 0) {
      lines.push(
        `  ${colors.green}No issues found.${colors.reset}`
      );
      lines.push("");
      continue;
    }

    result.findings.forEach((finding, i) => {
      lines.push(formatFinding(finding, i));
      lines.push("");
    });

    totalFindings += result.stats.totalFindings;
    totalCritical += result.stats.critical;
    totalHigh += result.stats.high;
    totalMedium += result.stats.medium;
    totalLow += result.stats.low;
    totalInfo += result.stats.info;
  }

  // Summary
  lines.push(
    `${colors.dim}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  lines.push(`${colors.bold}  Summary${colors.reset}`);
  lines.push(`  Files scanned: ${results.length}`);
  lines.push(`  Total findings: ${totalFindings}`);

  const summaryParts: string[] = [];
  if (totalCritical > 0)
    summaryParts.push(
      `${colors.bgRed}${colors.white} ${totalCritical} CRITICAL ${colors.reset}`
    );
  if (totalHigh > 0)
    summaryParts.push(
      `${colors.red}${totalHigh} High${colors.reset}`
    );
  if (totalMedium > 0)
    summaryParts.push(
      `${colors.yellow}${totalMedium} Medium${colors.reset}`
    );
  if (totalLow > 0)
    summaryParts.push(`${colors.cyan}${totalLow} Low${colors.reset}`);
  if (totalInfo > 0)
    summaryParts.push(`${colors.dim}${totalInfo} Info${colors.reset}`);

  if (summaryParts.length > 0) {
    lines.push(`  ${summaryParts.join(" | ")}`);
  }

  lines.push("");

  if (totalCritical > 0 || totalHigh > 0) {
    lines.push(
      `  ${colors.red}${colors.bold}Action required: Fix critical and high severity issues before deployment.${colors.reset}`
    );
  } else if (totalFindings === 0) {
    lines.push(
      `  ${colors.green}${colors.bold}All clear! No issues detected.${colors.reset}`
    );
  } else {
    lines.push(
      `  ${colors.yellow}Review medium/low findings before deployment.${colors.reset}`
    );
  }

  lines.push("");

  return lines.join("\n");
}

export function formatJSON(results: AnalysisResult[]): string {
  return JSON.stringify(
    {
      tool: "ClarityGuard",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      results,
      summary: {
        filesScanned: results.length,
        totalFindings: results.reduce(
          (sum, r) => sum + r.stats.totalFindings,
          0
        ),
        critical: results.reduce((sum, r) => sum + r.stats.critical, 0),
        high: results.reduce((sum, r) => sum + r.stats.high, 0),
        medium: results.reduce((sum, r) => sum + r.stats.medium, 0),
        low: results.reduce((sum, r) => sum + r.stats.low, 0),
        info: results.reduce((sum, r) => sum + r.stats.info, 0),
      },
    },
    null,
    2
  );
}
