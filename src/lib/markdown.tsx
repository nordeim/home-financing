import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2];
        const external = href.startsWith("http");
        nodes.push(
          <a
            key={key}
            href={href}
            className="text-primary underline-offset-4 hover:underline"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {link[1]}
          </a>,
        );
      }
    }
    key += 1;
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.startsWith("#### ")) {
      blocks.push(
        <h4 key={key++} className="mt-6 font-display text-lg font-semibold text-foreground">
          {inline(line.slice(5))}
        </h4>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-8 font-display text-xl font-semibold text-foreground">
          {inline(line.slice(4))}
        </h3>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-10 font-display text-2xl font-bold text-foreground">
          {inline(line.slice(3))}
        </h2>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="mt-8 font-display text-3xl font-bold text-foreground">
          {inline(line.slice(2))}
        </h1>,
      );
      i += 1;
      continue;
    }
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul key={key++} className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ol key={key++} className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    const para: string[] = [];
    const start = i;
    while (i < lines.length) {
      const current = lines[i] ?? "";
      if (
        current.trim() === "" ||
        current.startsWith("#") ||
        current.trim().startsWith("- ") ||
        /^\s*\d+\.\s+/.test(current)
      ) {
        break;
      }
      para.push(current);
      i += 1;
    }
    if (i === start) {
      // Loop safety (2026-09-11 OOM incident): the break conditions above all
      // match lines the outer loop did not consume (e.g. "####" and deeper
      // hashes once fell through here). Never let the outer loop re-examine
      // the same line — consume it and keep the parser terminating.
      para.push(lines[start] ?? "");
      i += 1;
    }
    blocks.push(
      <p key={key++} className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {inline(para.join(" "))}
      </p>,
    );
  }

  return <div className="max-w-none">{blocks}</div>;
}
