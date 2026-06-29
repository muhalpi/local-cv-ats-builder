import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/icon-buatcv-light.png"
              alt="BuatCV"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="inline-block font-bold text-xl tracking-tight text-slate-900">
              BuatCV
            </span>
          </Link>
          <nav className="hidden md:flex gap-7 text-sm font-medium text-slate-500">
            <Link href="/cv" className="transition-colors hover:text-slate-900">
              {t.nav.myCVs}
            </Link>
            <Link
              href="/cv/new"
              className="transition-colors hover:text-slate-900"
            >
              {t.nav.createNew}
            </Link>
            <Link
              href="/donate"
              className="transition-colors hover:text-slate-900"
            >
              {language === "id" ? "Donasi" : "Donate"}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 rounded-full border-slate-200 bg-white/70 px-3 text-slate-700 shadow-sm hover:bg-white"
          >
            <Link href="/donate">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">
                {language === "id" ? "Donasi" : "Donate"}
              </span>
            </Link>
          </Button>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-0.5">
            <Button
              size="sm"
              variant={language === "id" ? "default" : "ghost"}
              className="h-7 rounded-full px-3 text-xs font-semibold"
              onClick={() => setLanguage("id")}
            >
              ID
            </Button>
            <Button
              size="sm"
              variant={language === "en" ? "default" : "ghost"}
              className="h-7 rounded-full px-3 text-xs font-semibold"
              onClick={() => setLanguage("en")}
            >
              EN
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
