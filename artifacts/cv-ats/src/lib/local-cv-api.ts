import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { generateCVPreviewHtml } from "@/lib/generate-cv-html";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  gpa?: string | null;
}

export interface ExtraSectionEntry {
  title: string;
  subtitle?: string | null;
  date?: string | null;
  description?: string | null;
}

export interface ExtraSection {
  sectionTitle: string;
  entries: ExtraSectionEntry[];
}

export interface CVSummary {
  id: number;
  fullName: string;
  email: string;
  jobTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cv {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  jobTitle: string;
  summary: string;
  skills: string[];
  languages: string[];
  workExperience: WorkExperience[];
  education: Education[];
  extraSections: ExtraSection[];
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  profilePhoto?: string | null;
  cvLanguage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCVBody {
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  jobTitle: string;
  summary: string;
  skills: string[];
  languages: string[];
  workExperience: WorkExperience[];
  education: Education[];
  extraSections?: ExtraSection[] | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  profilePhoto?: string | null;
  cvLanguage?: string | null;
}

export interface UpdateCVBody {
  fullName?: string;
  email?: string;
  phone?: string | null;
  location?: string | null;
  jobTitle?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  workExperience?: WorkExperience[];
  education?: Education[];
  extraSections?: ExtraSection[] | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  profilePhoto?: string | null;
  cvLanguage?: string | null;
}

export interface CVHtml {
  html: string;
}

const DB_NAME = "cv-ats-local-db";
const DB_VERSION = 1;
const CVS_STORE = "cvs";

type StoredCV = Cv;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      dbPromise = null;
      reject(
        new Error(
          "IndexedDB is not available in this browser. Please use a modern browser to store CV locally.",
        ),
      );
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CVS_STORE)) {
        db.createObjectStore(CVS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => {
      dbPromise = null;
      reject(request.error ?? new Error("Failed to open local database"));
    };
    request.onblocked = () => {
      dbPromise = null;
      reject(new Error("Local database is blocked by another tab. Close other tabs and try again."));
    };
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  const normalized = asString(value).trim();
  return normalized === "" ? null : normalized;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeWorkExperienceArray(value: unknown): WorkExperience[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const raw = item as Partial<WorkExperience>;
      return {
        company: asString(raw.company).trim(),
        position: asString(raw.position).trim(),
        startDate: asString(raw.startDate).trim(),
        endDate: toNullableString(raw.endDate),
        isCurrent: Boolean(raw.isCurrent),
        description: asString(raw.description).trim(),
      };
    })
    .filter((item) => item.company || item.position || item.description);
}

function normalizeEducationArray(value: unknown): Education[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const raw = item as Partial<Education>;
      return {
        institution: asString(raw.institution).trim(),
        degree: asString(raw.degree).trim(),
        field: asString(raw.field).trim(),
        startDate: asString(raw.startDate).trim(),
        endDate: toNullableString(raw.endDate),
        isCurrent: Boolean(raw.isCurrent),
        gpa: toNullableString(raw.gpa),
      };
    })
    .filter((item) => item.institution || item.degree || item.field);
}

function normalizeExtraSectionsArray(value: unknown): ExtraSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((section) => section && typeof section === "object")
    .map((section) => {
      const rawSection = section as Partial<ExtraSection>;
      const entries = Array.isArray(rawSection.entries)
        ? rawSection.entries
            .filter((entry) => entry && typeof entry === "object")
            .map((entry) => {
              const rawEntry = entry as Partial<ExtraSectionEntry>;
              return {
                title: asString(rawEntry.title).trim(),
                subtitle: toNullableString(rawEntry.subtitle),
                date: toNullableString(rawEntry.date),
                description: toNullableString(rawEntry.description),
              };
            })
            .filter((entry) => entry.title || entry.subtitle || entry.description)
        : [];

      return {
        sectionTitle: asString(rawSection.sectionTitle).trim(),
        entries,
      };
    })
    .filter((section) => section.sectionTitle || section.entries.length > 0);
}

function toIsoDateOrNow(value: unknown): string {
  const raw = asString(value);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function normalizeCreateBody(data: CreateCVBody): Omit<Cv, "id" | "createdAt" | "updatedAt"> {
  return {
    fullName: asString(data.fullName).trim(),
    email: asString(data.email).trim(),
    phone: toNullableString(data.phone),
    location: toNullableString(data.location),
    jobTitle: asString(data.jobTitle).trim(),
    summary: asString(data.summary),
    skills: normalizeStringArray(data.skills),
    languages: normalizeStringArray(data.languages),
    workExperience: normalizeWorkExperienceArray(data.workExperience),
    education: normalizeEducationArray(data.education),
    extraSections: normalizeExtraSectionsArray(data.extraSections),
    linkedinUrl: toNullableString(data.linkedinUrl),
    portfolioUrl: toNullableString(data.portfolioUrl),
    profilePhoto: toNullableString(data.profilePhoto),
    cvLanguage: toNullableString(data.cvLanguage) ?? "en",
  };
}

function normalizeStoredCV(value: unknown): Cv {
  const raw = value as Partial<Cv> | null | undefined;
  const createdAt = toIsoDateOrNow(raw?.createdAt);
  const updatedAt = toIsoDateOrNow(raw?.updatedAt);
  return {
    id: Number(raw?.id ?? 0) || 0,
    fullName: asString(raw?.fullName),
    email: asString(raw?.email),
    phone: toNullableString(raw?.phone),
    location: toNullableString(raw?.location),
    jobTitle: asString(raw?.jobTitle),
    summary: asString(raw?.summary),
    skills: normalizeStringArray(raw?.skills),
    languages: normalizeStringArray(raw?.languages),
    workExperience: normalizeWorkExperienceArray(raw?.workExperience),
    education: normalizeEducationArray(raw?.education),
    extraSections: normalizeExtraSectionsArray(raw?.extraSections),
    linkedinUrl: toNullableString(raw?.linkedinUrl),
    portfolioUrl: toNullableString(raw?.portfolioUrl),
    profilePhoto: toNullableString(raw?.profilePhoto),
    cvLanguage: toNullableString(raw?.cvLanguage) ?? "en",
    createdAt,
    updatedAt,
  };
}

function toCVSummary(cv: Cv): CVSummary {
  return {
    id: cv.id,
    fullName: cv.fullName,
    email: cv.email,
    jobTitle: cv.jobTitle,
    createdAt: cv.createdAt,
    updatedAt: cv.updatedAt,
  };
}

function toCVHtml(cv: Cv): CVHtml {
  return {
    html: generateCVPreviewHtml({
      fullName: cv.fullName,
      email: cv.email,
      phone: cv.phone,
      location: cv.location,
      jobTitle: cv.jobTitle,
      summary: cv.summary,
      skills: cv.skills.join(", "),
      languages: cv.languages.join(", "),
      linkedinUrl: cv.linkedinUrl,
      portfolioUrl: cv.portfolioUrl,
      profilePhoto: cv.profilePhoto,
      cvLanguage: cv.cvLanguage,
      workExperience: cv.workExperience,
      education: cv.education,
      extraSections: cv.extraSections,
    }),
  };
}

async function readAllCVs(): Promise<Cv[]> {
  const db = await getDb();
  const tx = db.transaction(CVS_STORE, "readonly");
  const store = tx.objectStore(CVS_STORE);
  const values = await requestToPromise(store.getAll());
  await waitForTransaction(tx);

  return (values as unknown[])
    .map((item) => normalizeStoredCV(item))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export const listCVs = async (): Promise<CVSummary[]> => {
  const cvs = await readAllCVs();
  return cvs.map(toCVSummary);
};

export const getCV = async (id: number): Promise<Cv> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("CV not found");
  }
  const db = await getDb();
  const tx = db.transaction(CVS_STORE, "readonly");
  const store = tx.objectStore(CVS_STORE);
  const value = await requestToPromise(store.get(id));
  await waitForTransaction(tx);

  if (!value) {
    throw new Error("CV not found");
  }

  return normalizeStoredCV(value);
};

export const createCV = async (createCVBody: CreateCVBody): Promise<Cv> => {
  const db = await getDb();
  const tx = db.transaction(CVS_STORE, "readwrite");
  const store = tx.objectStore(CVS_STORE);
  const now = new Date().toISOString();

  const baseCV = normalizeCreateBody(createCVBody);
  const id = Number(
    await requestToPromise(
      store.add({
        ...baseCV,
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );

  const inserted = await requestToPromise(store.get(id));
  await waitForTransaction(tx);

  if (!inserted) {
    throw new Error("Failed to save CV locally");
  }

  return normalizeStoredCV(inserted);
};

function applyCVPatch(current: Cv, patch: UpdateCVBody): Cv {
  const next: Cv = { ...current };

  if (patch.fullName !== undefined) next.fullName = asString(patch.fullName).trim();
  if (patch.email !== undefined) next.email = asString(patch.email).trim();
  if (patch.phone !== undefined) next.phone = toNullableString(patch.phone);
  if (patch.location !== undefined) next.location = toNullableString(patch.location);
  if (patch.jobTitle !== undefined) next.jobTitle = asString(patch.jobTitle).trim();
  if (patch.summary !== undefined) next.summary = asString(patch.summary);
  if (patch.skills !== undefined) next.skills = normalizeStringArray(patch.skills);
  if (patch.languages !== undefined) next.languages = normalizeStringArray(patch.languages);
  if (patch.workExperience !== undefined) {
    next.workExperience = normalizeWorkExperienceArray(patch.workExperience);
  }
  if (patch.education !== undefined) {
    next.education = normalizeEducationArray(patch.education);
  }
  if (patch.extraSections !== undefined) {
    next.extraSections = normalizeExtraSectionsArray(patch.extraSections);
  }
  if (patch.linkedinUrl !== undefined) next.linkedinUrl = toNullableString(patch.linkedinUrl);
  if (patch.portfolioUrl !== undefined) next.portfolioUrl = toNullableString(patch.portfolioUrl);
  if (patch.profilePhoto !== undefined) next.profilePhoto = toNullableString(patch.profilePhoto);
  if (patch.cvLanguage !== undefined) next.cvLanguage = toNullableString(patch.cvLanguage) ?? "en";

  next.updatedAt = new Date().toISOString();
  return next;
}

export const updateCV = async (id: number, updateCVBody: UpdateCVBody): Promise<Cv> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("CV not found");
  }
  const db = await getDb();
  const tx = db.transaction(CVS_STORE, "readwrite");
  const store = tx.objectStore(CVS_STORE);
  const current = await requestToPromise(store.get(id));

  if (!current) {
    await waitForTransaction(tx);
    throw new Error("CV not found");
  }

  const patched = applyCVPatch(normalizeStoredCV(current), updateCVBody);
  await requestToPromise(store.put(patched));
  await waitForTransaction(tx);
  return patched;
};

export const deleteCV = async (id: number): Promise<void> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("CV not found");
  }
  const db = await getDb();
  const tx = db.transaction(CVS_STORE, "readwrite");
  const store = tx.objectStore(CVS_STORE);
  await requestToPromise(store.delete(id));
  await waitForTransaction(tx);
};

export const getCVHtml = async (id: number): Promise<CVHtml> => {
  const cv = await getCV(id);
  return toCVHtml(cv);
};

type ImportableCVShape = Partial<Cv> & {
  skills?: unknown;
  languages?: unknown;
};

type CVBackupPayload =
  | ImportableCVShape[]
  | {
      version?: string;
      exportedAt?: string;
      cvs?: ImportableCVShape[];
    };

export const exportCVBackup = async (): Promise<string> => {
  const cvs = await readAllCVs();
  return JSON.stringify(
    {
      version: "1",
      exportedAt: new Date().toISOString(),
      cvs,
    },
    null,
    2,
  );
};

function toCreateBodyFromImport(item: ImportableCVShape): CreateCVBody | null {
  const fullName = asString(item.fullName).trim();
  const email = asString(item.email).trim();
  const jobTitle = asString(item.jobTitle).trim();

  if (!fullName || !email || !jobTitle) return null;

  return {
    fullName,
    email,
    phone: toNullableString(item.phone),
    location: toNullableString(item.location),
    jobTitle,
    summary: asString(item.summary),
    skills: normalizeStringArray(item.skills),
    languages: normalizeStringArray(item.languages),
    workExperience: normalizeWorkExperienceArray(item.workExperience),
    education: normalizeEducationArray(item.education),
    extraSections: normalizeExtraSectionsArray(item.extraSections),
    linkedinUrl: toNullableString(item.linkedinUrl),
    portfolioUrl: toNullableString(item.portfolioUrl),
    profilePhoto: toNullableString(item.profilePhoto),
    cvLanguage: toNullableString(item.cvLanguage) ?? "en",
  };
}

function toCreateBodyFromCv(cv: Cv): CreateCVBody {
  return {
    fullName: cv.fullName,
    email: cv.email,
    phone: cv.phone,
    location: cv.location,
    jobTitle: cv.jobTitle,
    summary: cv.summary,
    skills: cv.skills,
    languages: cv.languages,
    workExperience: cv.workExperience,
    education: cv.education,
    extraSections: cv.extraSections,
    linkedinUrl: cv.linkedinUrl,
    portfolioUrl: cv.portfolioUrl,
    profilePhoto: cv.profilePhoto,
    cvLanguage: cv.cvLanguage,
  };
}

function getBodyFingerprint(body: CreateCVBody): string {
  return JSON.stringify({
    fullName: body.fullName.trim().toLowerCase(),
    email: body.email.trim().toLowerCase(),
    phone: toNullableString(body.phone),
    location: toNullableString(body.location),
    jobTitle: body.jobTitle.trim().toLowerCase(),
    summary: body.summary.trim(),
    skills: normalizeStringArray(body.skills),
    languages: normalizeStringArray(body.languages),
    workExperience: normalizeWorkExperienceArray(body.workExperience),
    education: normalizeEducationArray(body.education),
    extraSections: normalizeExtraSectionsArray(body.extraSections),
    linkedinUrl: toNullableString(body.linkedinUrl),
    portfolioUrl: toNullableString(body.portfolioUrl),
    profilePhoto: toNullableString(body.profilePhoto),
    cvLanguage: toNullableString(body.cvLanguage) ?? "en",
  });
}

export const importCVBackup = async (
  rawJson: string,
): Promise<{ imported: number; skipped: number }> => {
  let parsed: CVBackupPayload;
  try {
    parsed = JSON.parse(rawJson) as CVBackupPayload;
  } catch {
    throw new Error("Invalid JSON backup file");
  }

  const incoming = Array.isArray(parsed) ? parsed : parsed.cvs;
  if (!Array.isArray(incoming)) {
    throw new Error("Backup format is invalid");
  }

  let imported = 0;
  let skipped = 0;
  const existingCVs = await readAllCVs();
  const existingFingerprints = new Set(
    existingCVs.map((cv) => getBodyFingerprint(toCreateBodyFromCv(cv))),
  );

  for (const rawItem of incoming) {
    const body = toCreateBodyFromImport(rawItem);
    if (!body) {
      skipped += 1;
      continue;
    }

    const fingerprint = getBodyFingerprint(body);
    if (existingFingerprints.has(fingerprint)) {
      skipped += 1;
      continue;
    }

    await createCV(body);
    existingFingerprints.add(fingerprint);
    imported += 1;
  }

  return { imported, skipped };
};

export const getListCVsQueryKey = () => {
  return ["local-cv", "list"] as const;
};

export const getGetCVQueryKey = (id: number) => {
  return ["local-cv", "item", id] as const;
};

export const getGetCVHtmlQueryKey = (id: number) => {
  return ["local-cv", "html", id] as const;
};

export const getListCVsQueryOptions = <
  TData = Awaited<ReturnType<typeof listCVs>>,
  TError = Error,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof listCVs>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListCVsQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof listCVs>>> = () => listCVs();

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof listCVs>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export function useListCVs<
  TData = Awaited<ReturnType<typeof listCVs>>,
  TError = Error,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof listCVs>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListCVsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const useCreateCV = <
  TError = Error,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createCV>>,
    TError,
    { data: CreateCVBody },
    TContext
  >;
}): UseMutationResult<
  Awaited<ReturnType<typeof createCV>>,
  TError,
  { data: CreateCVBody },
  TContext
> => {
  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof createCV>>,
    { data: CreateCVBody }
  > = async (props) => createCV(props.data);

  return useMutation({
    mutationKey: ["local-cv", "create"],
    mutationFn,
    ...(options?.mutation ?? {}),
  });
};

export const getGetCVQueryOptions = <
  TData = Awaited<ReturnType<typeof getCV>>,
  TError = Error,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCV>>, TError, TData>;
  },
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetCVQueryKey(id);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getCV>>> = () => getCV(id);

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<Awaited<ReturnType<typeof getCV>>, TError, TData> & {
    queryKey: QueryKey;
  };
};

export function useGetCV<
  TData = Awaited<ReturnType<typeof getCV>>,
  TError = Error,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCV>>, TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetCVQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const useUpdateCV = <
  TError = Error,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateCV>>,
    TError,
    { id: number; data: UpdateCVBody },
    TContext
  >;
}): UseMutationResult<
  Awaited<ReturnType<typeof updateCV>>,
  TError,
  { id: number; data: UpdateCVBody },
  TContext
> => {
  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateCV>>,
    { id: number; data: UpdateCVBody }
  > = async (props) => updateCV(props.id, props.data);

  return useMutation({
    mutationKey: ["local-cv", "update"],
    mutationFn,
    ...(options?.mutation ?? {}),
  });
};

export const useDeleteCV = <
  TError = Error,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteCV>>,
    TError,
    { id: number },
    TContext
  >;
}): UseMutationResult<Awaited<ReturnType<typeof deleteCV>>, TError, { id: number }, TContext> => {
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteCV>>, { id: number }> =
    async (props) => deleteCV(props.id);

  return useMutation({
    mutationKey: ["local-cv", "delete"],
    mutationFn,
    ...(options?.mutation ?? {}),
  });
};

export const getGetCVHtmlQueryOptions = <
  TData = Awaited<ReturnType<typeof getCVHtml>>,
  TError = Error,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCVHtml>>, TError, TData>;
  },
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetCVHtmlQueryKey(id);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getCVHtml>>> = () => getCVHtml(id);

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<Awaited<ReturnType<typeof getCVHtml>>, TError, TData> & {
    queryKey: QueryKey;
  };
};

export function useGetCVHtml<
  TData = Awaited<ReturnType<typeof getCVHtml>>,
  TError = Error,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCVHtml>>, TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetCVHtmlQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return { ...query, queryKey: queryOptions.queryKey };
}
