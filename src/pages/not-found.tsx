import { Link } from 'wouter';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-enter grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-md rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#f9e4dc] text-[#9c4936]">
          <AlertCircle size={24} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-[-.03em]">
          404 — Page not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          Yeh page exist nahi karta. Home pe wapas jaao.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
