import { Link } from "wouter";
import { FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span className="inline-block font-bold text-xl tracking-tight text-primary">BuatCV</span>
          </Link>
          <nav className="flex gap-6 text-sm font-medium">
            <Link
              href="/cv"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t.nav.myCVs}
            </Link>
            <Link
              href="/cv/new"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t.nav.createNew}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-muted p-0.5">
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
    </header>
  );
}
