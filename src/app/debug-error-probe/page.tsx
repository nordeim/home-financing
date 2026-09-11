export const dynamic = "force-dynamic";

export default function ErrorTestPage() {
  throw new Error("probe-error-boundary");
}
