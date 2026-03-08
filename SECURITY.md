# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you find a security vulnerability in ClarityGuard itself, **please do not open a public issue**.

Report it privately by emailing the maintainer or using [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- A suggested fix if you have one

**Response time:** Security issues are acknowledged within 24 hours and addressed within 72 hours.

## Scope

ClarityGuard is a static analysis tool — it reads `.clar` files and produces reports. It does not execute contracts, make network calls, or store user data. The main attack surface is:

- **Malicious `.clar` files** — crafted inputs that could cause parser crashes or incorrect findings
- **Path traversal** — file paths passed to the CLI

If you discover that a specially crafted Clarity file can crash the scanner, cause it to report false negatives for critical vulnerabilities, or expose filesystem information unexpectedly, please report it.
