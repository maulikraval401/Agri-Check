import { useLocation } from 'wouter';
import { ArrowLeft, FileText, AlertTriangle, Scale, UserX, Ban, Mail, Shield } from 'lucide-react';

export default function TermsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="page-enter min-h-screen px-4 py-6 pb-24">
      <button
        onClick={() => navigate(-1 as any)}
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="mt-6 flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
          <FileText size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Terms of Use</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Last updated: October 2026</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm leading-relaxed">
        Agri Check app use karke aap in terms se sehmat hote ho. Kripya dhyaan se padho.
      </p>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Shield size={18} className="text-[hsl(var(--primary))]" />
          1. Ye App Kya Karti Hai
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">Agri Check ek free tool hai jo kisan ko ye services deta hai:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span>Crop disease detection</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span>Weather aur mandi bhav update</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span>Crop calendar aur library</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span>Buyers aur sellers ko jodna (marketplace)</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Scale size={18} className="text-[hsl(var(--primary))]" />
          2. Aapki Zimmedari
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <ul className="space-y-2 text-sm">
            <li>Sahi jaankari dena (phone, naam, fasal details, photos)</li>
            <li>Fake ya misleading listings nahi banana</li>
            <li>Kisi aur ke naam se listing nahi daalna</li>
            <li>Buyer/seller se baat karke hi deal karna</li>
            <li>Advance paisa kabhi nahi dena/lene (fraud se bachne ke liye)</li>
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <AlertTriangle size={18} className="text-[hsl(var(--primary))]" />
          3. App Ki Limits
        </h2>
        <div className="mt-2 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-4">
          <ul className="space-y-2 text-sm text-[#66511b]">
            <li>Agri Check sirf kisan aur buyer ko jodti hai</li>
            <li>Payment, delivery, ya quality ka hum zimmedar nahi</li>
            <li>Disease detection sirf guidance hai — expert advice nahi</li>
            <li>Actual trade APMC ya e-NAM ke through hi karo</li>
            <li>Kisi bhi transaction ka dispute hum handle nahi karte</li>
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Ban size={18} className="text-[hsl(var(--primary))]" />
          4. Spam Aur Misuse
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">Ye cheezein allowed nahi hain:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              <span>10 se zyada active listings ek user se</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              <span>Duplicate listings</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              <span>Fake photos ya galat price</span>
            </li>
            <li className="flex gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              <span>Abusive behaviour ya spam messages</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            Rules todne pe account ban ho sakta hai.
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <UserX size={18} className="text-[hsl(var(--primary))]" />
          5. Account Delete
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">
            Aap kabhi bhi apna account delete kar sakte ho — Profile page pe jaake.
            Account delete hone ke baad saara data hamesha ke liye hat jayega.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-3 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold"
          >
            Profile Page Kholo →
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <FileText size={18} className="text-[hsl(var(--primary))]" />
          6. Terms Me Changes
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">
            Hum ye terms kabhi bhi update kar sakte hain. Bade changes pe app me notify karenge.
            App continue use karna matlab naye terms accept karna.
          </p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Mail size={18} className="text-[hsl(var(--primary))]" />
          7. Sampark
        </h2>
        <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-sm">Koi bhi sawaal ya complaint ke liye:</p>
          <a
            href="mailto:maulikraval401@gmail.com"
            className="mt-2 inline-block text-sm font-bold text-[hsl(var(--primary))] underline"
          >
            maulikraval401@gmail.com
          </a>
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
        <p className="font-bold">📌 Note:</p>
        <p className="mt-1">
          Ye app kisan ke faayde ke liye banayi gayi hai. Kisi bhi dhokhe ki shikayat turant email karo.
        </p>
      </div>
    </div>
  );
      }
