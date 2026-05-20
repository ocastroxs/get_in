import Loader from "@/components/ui/carreagar";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Loader />
      </div>
    </div>
  );
}
