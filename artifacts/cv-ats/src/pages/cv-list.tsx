import { Link } from "wouter";
import { useListCVs, getListCVsQueryKey, useDeleteCV } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Trash2, Edit, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CVList() {
  const { data: cvs, isLoading, error } = useListCVs();
  const deleteCV = useDeleteCV();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const l = t.cvList;

  const handleDelete = async (id: number) => {
    deleteCV.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: l.toastDeleted,
          description: l.toastDeletedDesc,
        });
        queryClient.invalidateQueries({ queryKey: getListCVsQueryKey() });
      },
      onError: () => {
        toast({
          title: l.toastDeleteFailed,
          description: l.toastDeleteFailedDesc,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background/50">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{l.title}</h1>
            <p className="text-muted-foreground mt-1">{l.subtitle}</p>
          </div>
          <Link href="/cv/new">
            <Button className="w-full sm:w-auto shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              {l.createNew}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col justify-between">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter className="pt-4 border-t gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 border rounded-xl bg-destructive/5 text-destructive">
            <p>{l.failedLoad}</p>
          </div>
        ) : cvs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-xl bg-card">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">{l.noCVsTitle}</h2>
            <p className="text-muted-foreground max-w-[400px] mb-8">{l.noCVsDesc}</p>
            <Link href="/cv/new">
              <Button size="lg" className="shadow-sm">
                <Plus className="mr-2 h-5 w-5" />
                {l.createFirst}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cvs?.map((cv) => (
              <Card key={cv.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors bg-card shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-primary truncate" title={cv.fullName}>
                    {cv.fullName}
                  </CardTitle>
                  <CardDescription className="font-medium text-foreground truncate" title={cv.jobTitle}>
                    {cv.jobTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground pb-4 space-y-2">
                  <p className="truncate" title={cv.email}>{cv.email}</p>
                  <div className="flex items-center pt-2 text-xs">
                    <Clock className="mr-1.5 h-3 w-3" />
                    {l.updatedAt} {format(new Date(cv.updatedAt), "MMM d, yyyy")}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t gap-2 grid grid-cols-3 bg-muted/20">
                  <Link href={`/cv/${cv.id}`} className="col-span-1">
                    <Button variant="outline" size="sm" className="w-full text-xs" title="View Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/cv/${cv.id}/edit`} className="col-span-1">
                    <Button variant="outline" size="sm" className="w-full text-xs" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground col-span-1" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{l.deleteTitle}</AlertDialogTitle>
                        <AlertDialogDescription>{l.deleteDesc}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{l.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(cv.id)}
                        >
                          {deleteCV.isPending ? l.deleting : l.delete}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
