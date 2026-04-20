import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Zap, Download, HandHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const h = t.home;
  const donationAccounts = [
    { bank: "BCA", number: "8620415481" },
    { bank: "BRI", number: "313601048468537" },
    { bank: "Bank Neo", number: "5859459277402417" },
    { bank: "SeaBank", number: "901901068426" },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-accent/20">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary">
                  {h.title}
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {h.subtitle}
                </p>
              </div>
              <div className="space-x-4 pt-6">
                <Link href="/cv/new">
                  <Button size="lg" className="h-12 px-8 font-medium shadow-md transition-transform hover:-translate-y-1">
                    {h.startCreating}
                  </Button>
                </Link>
                <Link href="/cv">
                  <Button size="lg" variant="outline" className="h-12 px-8 font-medium">
                    {h.viewMyCVs}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <CardTitle>{h.features.ats.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{h.features.ats.desc}</CardDescription>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle>{h.features.fast.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{h.features.fast.desc}</CardDescription>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Download className="h-5 w-5" />
                  </div>
                  <CardTitle>{h.features.pdf.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{h.features.pdf.desc}</CardDescription>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle>{h.features.free.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{h.features.free.desc}</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full pb-12 md:pb-20">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <Card className="border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <HandHeart className="h-5 w-5" />
                  {h.donationTitle}
                </CardTitle>
                <CardDescription>{h.donationSubtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {h.accountNameLabel}: <span className="font-medium text-foreground">{h.accountNameValue}</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {donationAccounts.map((account) => (
                    <div key={account.bank} className="rounded-lg border bg-background px-4 py-3">
                      <p className="text-sm font-semibold text-foreground">{account.bank}</p>
                      <p className="font-mono text-sm text-muted-foreground">{account.number}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} BuatCV. {h.footer}</p>
          <p className="mt-1">{h.attributionLabel} M Alpi.</p>
        </div>
      </footer>
    </div>
  );
}
