import { useParams, useLocation } from "wouter";
import { useGetCVHtml, getGetCVHtmlQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Edit, ArrowLeft, FileText, Printer } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";

export default function CVDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const { data: cvHtml, isLoading, error } = useGetCVHtml(id, {
    query: {
      enabled: !!id,
      queryKey: getGetCVHtmlQueryKey(id)
    }
  });

  const handlePrint = () => {
    if (!cvHtml?.html || !printFrameRef.current?.contentWindow) return;

    const printDocument = printFrameRef.current.contentWindow.document;
    printDocument.open();
    printDocument.write(cvHtml.html);
    printDocument.close();

    window.setTimeout(() => {
      printFrameRef.current?.contentWindow?.focus();
      printFrameRef.current?.contentWindow?.print();
    }, 250);
  };

  if (!id || isNaN(id)) {
    setLocation("/cv");
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background/50">
      <Navbar />
      
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-6 md:py-8">
        <div className="mb-6 rounded-2xl border bg-card p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
            <Link href="/cv" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to CVs
            </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-primary">CV Preview</h1>
                  <p className="text-sm text-muted-foreground">
                    Simpan sebagai PDF dari dokumen CV asli, bukan dari halaman aplikasi.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href={`/cv/${id}/edit`} className="w-full">
                <Button variant="outline" className="w-full shadow-sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit CV
                </Button>
              </Link>
              <Button onClick={handlePrint} className="w-full shadow-sm" disabled={!cvHtml?.html || isLoading}>
                <Printer className="mr-2 h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 font-medium">
              <Download className="h-4 w-4" />
              Dokumen CV
            </span>
            <span>Gunakan tombol “Save as PDF” agar hasilnya rapi seperti dokumen.</span>
          </div>
          {isLoading ? (
            <div className="p-8 sm:p-12 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-px w-full my-6" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-px w-full my-6" />
              <div className="space-y-6">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              <p>Failed to load CV preview. The CV might not exist.</p>
              <Button variant="outline" className="mt-4" onClick={() => setLocation("/cv")}>
                Return to My CVs
              </Button>
            </div>
          ) : (
            <iframe
              srcDoc={cvHtml?.html || ""}
              title="CV Document Preview"
              className="h-[calc(100vh-230px)] min-h-[640px] w-full bg-white"
            />
          )}
        </div>
      </main>

      <iframe
        ref={printFrameRef}
        title="Print CV"
        className="fixed bottom-0 right-0 h-0 w-0 border-0 opacity-0"
        aria-hidden="true"
      />
    </div>
  );
}
