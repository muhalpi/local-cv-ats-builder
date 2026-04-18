import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useForm, useFieldArray, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCV, useUpdateCV, useGetCV, getGetCVQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ChevronRight, ChevronLeft, Save, Eye, CheckCircle2, XCircle } from "lucide-react";
import { generateCVPreviewHtml } from "@/lib/generate-cv-html";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n";

type CVLanguageOption = "en" | "id";
type CVThemeOption = "blue" | "black";

function parseCvStyleValue(cvLanguageValue?: string | null): { cvLanguage: CVLanguageOption; cvTheme: CVThemeOption } {
  const raw = (cvLanguageValue ?? "en").toLowerCase();
  const [languagePart, themePart] = raw.split(":");
  return {
    cvLanguage: languagePart === "id" ? "id" : "en",
    cvTheme: themePart === "black" ? "black" : "blue",
  };
}

function composeCvStyleValue(cvLanguage: CVLanguageOption, cvTheme: CVThemeOption): string {
  return cvTheme === "black" ? `${cvLanguage}:black` : cvLanguage;
}

const MAX_PROFILE_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

function makeSchema(v: Translations["cvForm"]["validation"]) {
  const workExperienceSchema = z.object({
    company: z.string().min(1, v.companyRequired),
    position: z.string().min(1, v.positionRequired),
    startDate: z.string().min(1, v.startDateRequired),
    endDate: z.string().optional().nullable(),
    isCurrent: z.boolean().default(false),
    description: z.string().min(1, v.descriptionRequired),
  });

  const educationSchema = z.object({
    institution: z.string().min(1, v.institutionRequired),
    degree: z.string().min(1, v.degreeRequired),
    field: z.string().min(1, v.fieldRequired),
    startDate: z.string().min(1, v.startDateRequired),
    endDate: z.string().optional().nullable(),
    isCurrent: z.boolean().default(false),
    gpa: z.string().optional().nullable(),
  });

  const extraSectionEntrySchema = z.object({
    title: z.string().min(1, v.titleRequired),
    subtitle: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
  });

  const extraSectionSchema = z.object({
    sectionTitle: z.string().min(1, v.sectionNameRequired),
    entries: z.array(extraSectionEntrySchema),
  });

  return z.object({
    fullName: z.string().min(2, v.fullNameRequired),
    email: z.string().email(v.emailInvalid),
    phone: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    jobTitle: z.string().min(2, v.jobTitleRequired),
    summary: z.string().min(10, v.summaryRequired),
    skills: z.string().min(1, v.skillsRequired),
    languages: z.string().optional(),
    linkedinUrl: z.string().optional().or(z.literal("")).nullable().refine((val) => {
      if (!val) return true;
      try { new URL(/^https?:\/\//i.test(val) ? val : `https://${val}`); return true; } catch { return false; }
    }, v.invalidUrl),
    portfolioUrl: z.string().optional().or(z.literal("")).nullable().refine((val) => {
      if (!val) return true;
      try { new URL(/^https?:\/\//i.test(val) ? val : `https://${val}`); return true; } catch { return false; }
    }, v.invalidUrl),
    profilePhoto: z.string().optional().nullable(),
    cvLanguage: z.enum(["en", "id"]).default("en"),
    cvTheme: z.enum(["blue", "black"]).default("blue"),
    workExperience: z.array(workExperienceSchema),
    education: z.array(educationSchema),
    extraSections: z.array(extraSectionSchema),
  });
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

function ExtraSectionItem({
  sectionIndex,
  control,
  onRemove,
  f,
}: {
  sectionIndex: number;
  control: Control<FormValues>;
  onRemove: () => void;
  f: Translations["cvForm"]["fields"];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `extraSections.${sectionIndex}.entries`,
  });

  return (
    <Card className="relative border-border shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <CardHeader className="pb-3 pr-12">
        <FormField
          control={control}
          name={`extraSections.${sectionIndex}.sectionTitle`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{f.sectionName}</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Certifications" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, entryIndex) => (
          <Card key={field.id} className="relative bg-muted/20 shadow-none">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => remove(entryIndex)}
              disabled={fields.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6 pr-12 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`extraSections.${sectionIndex}.entries.${entryIndex}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.title}</FormLabel>
                      <FormControl>
                        <Input placeholder="AWS Certified Cloud Practitioner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`extraSections.${sectionIndex}.entries.${entryIndex}.subtitle`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.subtitle}</FormLabel>
                      <FormControl>
                        <Input placeholder="Amazon Web Services" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={`extraSections.${sectionIndex}.entries.${entryIndex}.date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.datePeriod}</FormLabel>
                    <FormControl>
                      <Input placeholder="2024" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`extraSections.${sectionIndex}.entries.${entryIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.descriptionOptional}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add short bullet points relevant to the position you're applying for."
                        className="h-24 resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>{f.descriptionHintOptional}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={() => append({ title: "", subtitle: "", date: "", description: "" })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CVForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const cf = t.cvForm;
  const f = cf.fields;

  const id = params.id ? parseInt(params.id, 10) : undefined;
  const isEditing = !!id;

  const [activeStep, setActiveStep] = useState(0);

  const STEPS = [
    { id: "personal", title: cf.steps.personal },
    { id: "summary", title: cf.steps.summary },
    { id: "experience", title: cf.steps.experience },
    { id: "education", title: cf.steps.education },
    { id: "extra", title: cf.steps.extra },
    { id: "review", title: cf.steps.review },
  ];

  const schema = useMemo(() => makeSchema(cf.validation), [language]);

  const { data: initialData, isLoading: isLoadingInitial } = useGetCV(id as number, {
    query: {
      enabled: isEditing,
      queryKey: getGetCVQueryKey(id as number),
    }
  });

  const createCV = useCreateCV();
  const updateCV = useUpdateCV();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      jobTitle: "",
      summary: "",
      skills: "",
      languages: "",
      linkedinUrl: "",
      portfolioUrl: "",
      profilePhoto: "",
      cvLanguage: "en" as "en" | "id",
      cvTheme: "blue" as "blue" | "black",
      workExperience: [],
      education: [],
      extraSections: [],
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "extraSections",
  });

  useEffect(() => {
    if (initialData) {
      const { cvLanguage, cvTheme } = parseCvStyleValue(initialData.cvLanguage);
      form.reset({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        location: initialData.location || "",
        jobTitle: initialData.jobTitle || "",
        summary: initialData.summary || "",
        skills: initialData.skills ? initialData.skills.join(", ") : "",
        languages: initialData.languages ? initialData.languages.join(", ") : "",
        linkedinUrl: initialData.linkedinUrl || "",
        portfolioUrl: initialData.portfolioUrl || "",
        profilePhoto: initialData.profilePhoto || "",
        cvLanguage,
        cvTheme,
        workExperience: initialData.workExperience || [],
        education: initialData.education || [],
        extraSections: (initialData.extraSections as { sectionTitle: string; entries: { title: string; subtitle?: string | null; date?: string | null; description?: string | null }[] }[]) || [],
      });
    }
  }, [initialData, form]);

  const normalizeUrl = (url: string | null | undefined) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });

  const handleProfilePhotoUpload = async (file: File | undefined, onChange: (value: string) => void) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: language === "id" ? "Format foto tidak valid" : "Invalid photo format",
        description: language === "id" ? "Pilih file gambar (PNG, JPG, atau WEBP)." : "Please choose an image file (PNG, JPG, or WEBP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
      toast({
        title: language === "id" ? "Ukuran foto terlalu besar" : "Photo file is too large",
        description: language === "id" ? "Maksimum ukuran file adalah 2 MB." : "Maximum allowed size is 2 MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast({
        title: language === "id" ? "Gagal membaca foto" : "Failed to read photo",
        description: language === "id" ? "Coba unggah ulang dengan file lain." : "Please try uploading another file.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    const apiData = {
      ...values,
      linkedinUrl: normalizeUrl(values.linkedinUrl),
      portfolioUrl: normalizeUrl(values.portfolioUrl),
      profilePhoto: values.profilePhoto || null,
      skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      languages: values.languages ? values.languages.split(",").map(s => s.trim()).filter(Boolean) : [],
      cvLanguage: composeCvStyleValue(values.cvLanguage, values.cvTheme),
    };

    try {
      if (isEditing) {
        await updateCV.mutateAsync({ id: id as number, data: apiData });
        toast({ title: cf.toast.updated, description: cf.toast.updatedDesc });
        setLocation(`/cv/${id}`);
      } else {
        const result = await createCV.mutateAsync({ data: apiData });
        toast({ title: cf.toast.created, description: cf.toast.createdDesc });
        setLocation(`/cv/${result.id}`);
      }
    } catch (error) {
      toast({
        title: cf.toast.errorTitle,
        description: error instanceof Error ? error.message : cf.toast.errorDesc,
        variant: "destructive",
      });
    }
  };

  const validateStep = async (stepIndex: number) => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (stepIndex === 0) fieldsToValidate = ["fullName", "email", "phone", "location", "jobTitle", "linkedinUrl", "portfolioUrl", "profilePhoto", "cvLanguage", "cvTheme"];
    else if (stepIndex === 1) fieldsToValidate = ["summary", "skills", "languages"];
    else if (stepIndex === 2) fieldsToValidate = ["workExperience"];
    else if (stepIndex === 3) fieldsToValidate = ["education"];
    else if (stepIndex === 4) fieldsToValidate = ["extraSections"];
    return await form.trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    if (!await validateStep(activeStep)) return;
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSubmitting = createCV.isPending || updateCV.isPending;

  const watchedValues = form.watch();
  const PRESET_SECTIONS = translations[watchedValues.cvLanguage ?? "en"].cvForm.presetSections;

  const previewHtml = useMemo(
    () => generateCVPreviewHtml(watchedValues),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      watchedValues.fullName, watchedValues.email, watchedValues.phone, watchedValues.location,
      watchedValues.jobTitle, watchedValues.summary, watchedValues.skills, watchedValues.languages,
      watchedValues.linkedinUrl, watchedValues.portfolioUrl, watchedValues.profilePhoto, watchedValues.cvLanguage, watchedValues.cvTheme,
      JSON.stringify(watchedValues.workExperience), JSON.stringify(watchedValues.education),
      JSON.stringify(watchedValues.extraSections),
    ]
  );
  const previewDocument = useMemo(
    () => previewHtml.replace(
      "</style>",
      `html, body { scrollbar-width: none; }
       html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
       .page { min-height: 0 !important; }</style>`,
    ),
    [previewHtml],
  );

  const IFRAME_SCALE = 0.693;
  const IFRAME_WIDTH = 820;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(1120);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const h = iframe.contentDocument.documentElement.scrollHeight;
    if (h > 0) setIframeHeight(h);
  }, []);

  const atsChecks = useMemo(() => {
    const v = watchedValues;
    if (language === "id") {
      return [
        { label: "Nama lengkap diisi", ok: !!v.fullName?.trim() },
        { label: "Jabatan diisi", ok: !!v.jobTitle?.trim() },
        { label: "Alamat email tersedia", ok: !!v.email?.trim() },
        { label: "Nomor telepon tersedia", ok: !!v.phone?.trim() },
        { label: "Lokasi tersedia", ok: !!v.location?.trim() },
        { label: "Ringkasan profesional ditulis", ok: (v.summary?.trim().length ?? 0) >= 50 },
        { label: "Minimal 3 keahlian tercantum", ok: v.skills.split(",").map(s => s.trim()).filter(Boolean).length >= 3 },
        { label: "Minimal 1 pengalaman kerja", ok: v.workExperience.length > 0 },
        { label: "Pengalaman kerja memiliki deskripsi", ok: v.workExperience.every(e => e.description?.trim().length > 0) },
        { label: "Minimal 1 entri pendidikan", ok: v.education.length > 0 },
        { label: "URL LinkedIn tersedia", ok: !!v.linkedinUrl?.trim() },
      ];
    }
    return [
      { label: "Full name filled in", ok: !!v.fullName?.trim() },
      { label: "Job title filled in", ok: !!v.jobTitle?.trim() },
      { label: "Email address provided", ok: !!v.email?.trim() },
      { label: "Phone number provided", ok: !!v.phone?.trim() },
      { label: "Location provided", ok: !!v.location?.trim() },
      { label: "Professional summary written", ok: (v.summary?.trim().length ?? 0) >= 50 },
      { label: "At least 3 skills listed", ok: v.skills.split(",").map(s => s.trim()).filter(Boolean).length >= 3 },
      { label: "At least 1 work experience", ok: v.workExperience.length > 0 },
      { label: "Work experience has descriptions", ok: v.workExperience.every(e => e.description?.trim().length > 0) },
      { label: "At least 1 education entry", ok: v.education.length > 0 },
      { label: "LinkedIn URL provided", ok: !!v.linkedinUrl?.trim() },
    ];
  }, [
    language,
    watchedValues.fullName, watchedValues.jobTitle, watchedValues.email, watchedValues.phone,
    watchedValues.location, watchedValues.summary, watchedValues.skills,
    JSON.stringify(watchedValues.workExperience), JSON.stringify(watchedValues.education),
    watchedValues.linkedinUrl,
  ]);

  if (isEditing && isLoadingInitial) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-background/50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background/50">
      <Navbar />
      <main className="flex-1 px-3 py-5 sm:px-4 lg:py-6">
        <div className="mx-auto max-w-[1320px]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
            {isEditing ? cf.editTitle : cf.createTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 md:text-base">{cf.formSubtitle}</p>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,680px)_minmax(520px,1fr)]">
          <div className="min-w-0">

        {/* Stepper */}
        <div className="mb-5 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
            style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                  idx <= activeStep 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${idx <= activeStep ? "text-foreground" : "text-muted-foreground"}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && activeStep < STEPS.length - 1) {
                e.preventDefault();
              }
            }}
            className="space-y-8"
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 px-5 py-4">
                <CardTitle>{STEPS[activeStep].title}</CardTitle>
                <CardDescription>
                  {activeStep === 0 && cf.stepDescriptions.personal}
                  {activeStep === 1 && cf.stepDescriptions.summary}
                  {activeStep === 2 && cf.stepDescriptions.experience}
                  {activeStep === 3 && cf.stepDescriptions.education}
                  {activeStep === 4 && cf.stepDescriptions.extra}
                  {activeStep === 5 && cf.stepDescriptions.review}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pt-5">

                {/* ─── Step 0: Personal Info ─── */}
                <div className={activeStep === 0 ? "space-y-5" : "hidden"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.fullName}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.jobTitle}</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.email}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.phone}</FormLabel>
                          <FormControl>
                            <Input placeholder="+62 812 3456 7890" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.location}</FormLabel>
                          <FormControl>
                            <Input placeholder="Jakarta, Indonesia" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.linkedinUrl}</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/johndoe" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.portfolioUrl}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://johndoe.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profilePhoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.profilePhoto}</FormLabel>
                        <FormDescription>{f.profilePhotoHint}</FormDescription>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                          <div className="h-32 w-24 overflow-hidden rounded-md border bg-muted/30 shrink-0">
                            {field.value ? (
                              <img src={field.value} alt="Profile preview" className="h-full w-full object-cover object-center" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                                3 x 4
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={async (event) => {
                                await handleProfilePhotoUpload(event.target.files?.[0], field.onChange);
                                event.currentTarget.value = "";
                              }}
                            />
                            <p className="text-xs text-muted-foreground">{f.profilePhotoSizeHint}</p>
                            {field.value ? (
                              <Button type="button" variant="outline" onClick={() => field.onChange("")}>
                                {f.removePhoto}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.cvLanguageLabel}</FormLabel>
                        <FormDescription>{f.cvLanguageHint}</FormDescription>
                        <div className="flex gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => field.onChange("en")}
                            className={`flex-1 flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors cursor-pointer ${
                              field.value === "en"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <span className="text-xl">🇬🇧</span>
                            <div>
                              <p className="text-sm font-semibold">{f.cvLanguageEn}</p>
                              <p className="text-xs opacity-70">Work Experience · Education · Skills</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("id")}
                            className={`flex-1 flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors cursor-pointer ${
                              field.value === "id"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <span className="text-xl">🇮🇩</span>
                            <div>
                              <p className="text-sm font-semibold">{f.cvLanguageId}</p>
                              <p className="text-xs opacity-70">Pengalaman Kerja · Pendidikan · Keahlian</p>
                            </div>
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvTheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.cvThemeLabel}</FormLabel>
                        <FormDescription>{f.cvThemeHint}</FormDescription>
                        <div className="flex gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => field.onChange("blue")}
                            className={`flex-1 rounded-lg border-2 p-3 text-left transition-colors cursor-pointer ${
                              field.value === "blue"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <p className="text-sm font-semibold">{f.cvThemeBlue}</p>
                            <p className="text-xs opacity-70">{language === "id" ? "Aksen biru klasik" : "Classic blue accents"}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("black")}
                            className={`flex-1 rounded-lg border-2 p-3 text-left transition-colors cursor-pointer ${
                              field.value === "black"
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <p className="text-sm font-semibold">{f.cvThemeBlack}</p>
                            <p className="text-xs opacity-70">{language === "id" ? "Gaya hitam netral" : "Neutral black style"}</p>
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ─── Step 1: Summary & Skills ─── */}
                <div className={activeStep === 1 ? "space-y-5" : "hidden"}>
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.professionalSummary}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={f.summaryPlaceholder}
                            className="h-28 resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {language === "id"
                            ? "Tulis 2–4 kalimat yang merangkum latar belakang dan tujuan profesional Anda."
                            : "Write 2-4 sentences summarizing your professional background and goals."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.skills}</FormLabel>
                        <FormControl>
                          <Input placeholder={f.skillsPlaceholder} {...field} />
                        </FormControl>
                        <FormDescription>{f.skillsHint}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.languages}</FormLabel>
                        <FormControl>
                          <Input placeholder={f.languagesPlaceholder} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>{f.languagesHint}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ─── Step 2: Work Experience ─── */}
                <div className={activeStep === 2 ? "space-y-5" : "hidden"}>
                  {expFields.map((field, index) => (
                    <Card key={field.id} className="relative border-border shadow-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeExp(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardContent className="pt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.company`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.company}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tech Corp" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.position`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.position}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Frontend Developer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.startDate}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jan 2020" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`workExperience.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.endDate}</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Present" 
                                    {...field} 
                                    value={field.value || ""} 
                                    disabled={form.watch(`workExperience.${index}.isCurrent`)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.isCurrent`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) form.setValue(`workExperience.${index}.endDate`, "");
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>{f.isCurrent}</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{f.description}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="• Developed new features using React..." 
                                  className="h-28 resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>{f.descriptionHint}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendExp({ company: "", position: "", startDate: "", endDate: "", isCurrent: false, description: "" })}
                    className="w-full border-dashed border-2 py-6 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {cf.buttons.addExperience}
                  </Button>
                </div>

                {/* ─── Step 3: Education ─── */}
                <div className={activeStep === 3 ? "space-y-5" : "hidden"}>
                  {eduFields.map((field, index) => (
                    <Card key={field.id} className="relative border-border shadow-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeEdu(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardContent className="pt-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.institution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.institution}</FormLabel>
                                <FormControl>
                                  <Input placeholder="University of Jakarta" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.degree`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.degree}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bachelor of Science" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.field`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>{f.field}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Computer Science" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.startDate`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>{f.startDate}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Aug 2016" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                <FormLabel>{f.endDate}</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="May 2020" 
                                    {...field} 
                                    value={field.value || ""} 
                                    disabled={form.watch(`education.${index}.isCurrent`)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`education.${index}.gpa`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{f.gpa}</FormLabel>
                                <FormControl>
                                  <Input placeholder="3.8/4.0" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`education.${index}.isCurrent`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-8">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (checked) form.setValue(`education.${index}.endDate`, "");
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    {language === "id" ? "Saya masih belajar di sini" : "I currently study here"}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendEdu({ institution: "", degree: "", field: "", startDate: "", endDate: "", isCurrent: false, gpa: "" })}
                    className="w-full border-dashed border-2 py-6 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {cf.buttons.addEducation}
                  </Button>
                </div>

                {/* ─── Step 4: Extra Sections ─── */}
                <div className={activeStep === 4 ? "space-y-5" : "hidden"}>
                  <div>
                    <p className="text-sm font-medium mb-3 text-muted-foreground">
                      {language === "id" ? "Pilih bagian untuk ditambahkan:" : "Choose a section to add:"}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_SECTIONS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          className="justify-start h-auto py-2 text-sm"
                          onClick={() => appendSection({ sectionTitle: preset, entries: [{ title: "", subtitle: "", date: "", description: "" }] })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                          {preset}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="justify-start h-auto py-2 text-sm border-dashed"
                        onClick={() => appendSection({ sectionTitle: "", entries: [{ title: "", subtitle: "", date: "", description: "" }] })}
                      >
                        <Plus className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        {language === "id" ? "Bagian Kustom" : "Custom Section"}
                      </Button>
                    </div>
                  </div>

                  {sectionFields.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p className="text-sm">
                        {language === "id"
                          ? "Klik salah satu opsi di atas untuk menambahkan bagian tambahan."
                          : "Click one of the options above to add an extra section."}
                      </p>
                      <p className="text-xs mt-1">
                        {language === "id"
                          ? "Langkah ini opsional — lewati jika tidak diperlukan."
                          : "This step is optional — skip it if not needed."}
                      </p>
                    </div>
                  )}

                  {sectionFields.map((sectionField, sectionIndex) => (
                    <ExtraSectionItem
                      key={sectionField.id}
                      sectionIndex={sectionIndex}
                      control={form.control}
                      onRemove={() => removeSection(sectionIndex)}
                      f={f}
                    />
                  ))}
                </div>

                {/* ─── Step 5: Review ─── */}
                <div className={activeStep === 5 ? "space-y-6" : "hidden"}>
                  {(() => {
                    const passed = atsChecks.filter(c => c.ok).length;
                    const total = atsChecks.length;
                    const pct = Math.round((passed / total) * 100);
                    const color = pct >= 90 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-destructive";
                    const bgColor = pct >= 90 ? "bg-green-50 border-green-200" : pct >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
                    const scoreLabel = language === "id" ? "Skor Kesiapan ATS" : "ATS Readiness Score";
                    const statusMsg = pct >= 90
                      ? (language === "id" ? "Luar biasa! CV Anda sudah dioptimalkan dengan baik." : "Excellent! Your CV is well-optimized.")
                      : pct >= 60
                      ? (language === "id" ? "Bagus. Lengkapi item yang tersisa untuk meningkatkan skor Anda." : "Good start. Complete the remaining items to improve your score.")
                      : (language === "id" ? "Isi lebih banyak kolom untuk meningkatkan skor ATS Anda." : "Fill in more fields to improve your ATS score.");
                    const checksLabel = language === "id" ? "pemeriksaan lulus" : "checks passed";
                    return (
                      <Card className={`border shadow-sm ${bgColor}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{scoreLabel}</CardTitle>
                            <span className={`text-2xl font-bold ${color}`}>{pct}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all ${pct >= 90 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-destructive"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <CardDescription className="mt-1">{passed}/{total} {checksLabel} — {statusMsg}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {atsChecks.map((c) => (
                              <li key={c.label} className="flex items-center gap-2 text-sm">
                                {c.ok
                                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                  : <XCircle className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
                                <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">{language === "id" ? "Nama Lengkap" : "Full Name"}</p>
                          <p className="font-medium">{form.watch("fullName") || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{cf.review.jobTitle}</p>
                          <p className="font-medium">{form.watch("jobTitle") || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{cf.review.email}</p>
                          <p className="font-medium">{form.watch("email") || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{cf.review.phone}</p>
                          <p className="font-medium">{form.watch("phone") || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{cf.review.location}</p>
                          <p className="font-medium">{form.watch("location") || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{cf.review.linkedin}</p>
                          <p className="font-medium break-all">{form.watch("linkedinUrl") || "-"}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">{cf.review.summary}</p>
                        <p className="mt-1 whitespace-pre-wrap">{form.watch("summary") || "-"}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">{cf.review.skills}</p>
                        <p className="mt-1">{form.watch("skills") || "-"}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">{cf.review.languages}</p>
                        <p className="mt-1">{form.watch("languages") || "-"}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">{cf.review.workExperience}</p>
                        <div className="mt-2 space-y-3">
                          {expFields.length > 0 ? (
                            expFields.map((_, index) => {
                              const item = form.watch(`workExperience.${index}`);
                              return (
                                <div key={index} className="rounded-lg border p-4">
                                  <p className="font-medium">{item?.position || "-"} {item?.company ? `at ${item.company}` : ""}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item?.startDate || "-"} {item?.endDate ? ` - ${item.endDate}` : item?.isCurrent ? ` - ${cf.review.present}` : ""}
                                  </p>
                                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                    {(item?.description || "")
                                      .split(/\n+/)
                                      .map((line) => line.trim())
                                      .filter(Boolean)
                                      .map((line, bulletIndex) => (
                                        <li key={bulletIndex} className="flex gap-2">
                                          <span className="shrink-0">•</span>
                                          <span className="min-w-0 whitespace-pre-wrap break-words">{line}</span>
                                        </li>
                                      ))}
                                    {!item?.description ? <li>-</li> : null}
                                  </ul>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm text-muted-foreground">{cf.review.noExperience}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">{cf.review.education}</p>
                        <div className="mt-2 space-y-3">
                          {eduFields.length > 0 ? (
                            eduFields.map((_, index) => {
                              const item = form.watch(`education.${index}`);
                              return (
                                <div key={index} className="rounded-lg border p-4">
                                  <p className="font-medium">{item?.degree || "-"}{item?.field ? ` · ${item.field}` : ""}</p>
                                  <p className="text-sm text-muted-foreground">{item?.institution || "-"}</p>
                                  {item?.gpa && (
                                    <p className="text-sm text-muted-foreground">GPA: {item.gpa}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {item?.startDate || "-"} {item?.endDate ? ` - ${item.endDate}` : item?.isCurrent ? ` - ${cf.review.present}` : ""}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm text-muted-foreground">{cf.review.noEducation}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">{cf.review.extraSections}</p>
                        <div className="mt-2 space-y-3">
                          {sectionFields.length > 0 ? (
                            sectionFields.map((_, sectionIndex) => {
                              const section = form.watch(`extraSections.${sectionIndex}`);
                              return (
                                <div key={sectionIndex} className="rounded-lg border p-4">
                                  <p className="font-medium">{section?.sectionTitle || "-"}</p>
                                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                    {section?.entries?.length ? section.entries.map((entry, entryIndex) => (
                                      <div key={entryIndex}>
                                        <p className="font-medium text-foreground">{entry.title || "-"}</p>
                                        <p>{[entry.subtitle, entry.date].filter(Boolean).join(" · ") || "-"}</p>
                                        {entry.description && <p className="whitespace-pre-wrap">{entry.description}</p>}
                                      </div>
                                    )) : <p>{cf.review.noItems}</p>}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm text-muted-foreground">{cf.review.noExtra}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  {cf.stepFooter(activeStep + 1, STEPS.length, activeStep === STEPS.length - 1)}
                </div>
                <div className="flex w-full gap-2 sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={activeStep === 0 || isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {cf.buttons.back}
                </Button>
                
                {activeStep < STEPS.length - 2 ? (
                  <Button type="button" onClick={nextStep} disabled={isSubmitting} className="flex-1 sm:flex-none">
                    {cf.buttons.next}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : activeStep === STEPS.length - 2 ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      const isValid = await validateStep(activeStep);
                      if (isValid) {
                        setActiveStep(STEPS.length - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {cf.buttons.reviewCV}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {cf.buttons.saving}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {cf.buttons.saveCV}
                      </>
                    )}
                  </Button>
                )}
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>

          </div>{/* end form column */}

          {/* Live Preview Panel */}
          <div className="hidden xl:flex min-w-0 flex-col sticky top-4">
            <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 border-b text-sm font-medium text-muted-foreground flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                {cf.buttons.livePreview}
                </span>
                <span className="text-[11px] font-normal">{cf.buttons.livePreviewScroll}</span>
              </div>
              <div className="max-h-[calc(100vh-150px)] overflow-y-auto overflow-x-hidden bg-slate-100 p-4 overscroll-contain">
                <div
                  className="mx-auto overflow-hidden"
                  style={{
                    width: `${Math.round(IFRAME_WIDTH * IFRAME_SCALE)}px`,
                    height: `${Math.round(iframeHeight * IFRAME_SCALE)}px`,
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={previewDocument}
                    title="CV Preview"
                    onLoad={handleIframeLoad}
                    scrolling="no"
                    style={{
                      width: `${IFRAME_WIDTH}px`,
                      height: `${iframeHeight}px`,
                      border: 'none',
                      transform: `scale(${IFRAME_SCALE})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">{cf.buttons.previewUpdates}</p>
          </div>

        </div>{/* end flex split */}
        </div>{/* end max-w container */}
      </main>
    </div>
  );
}
