// Shared by the repository validator and the portal packager so both reject the
// same credential shapes.
export const secretPatterns = [
  /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/u,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/u,
  /\bsk-[A-Za-z0-9_-]{20,}\b/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
  /\bmemostem_mcp_[A-Za-z0-9_-]{12,}\b/u,
  /\b(?:DATABASE_URL|CLERK_SECRET_KEY|OPENAI_API_KEY)\s*=\s*[^$'"<\s][^\s]*/u,
];
