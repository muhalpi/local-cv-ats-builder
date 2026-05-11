import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, cvsTable } from "@workspace/db";
import {
  CreateCVBody,
  GetCVParams,
  UpdateCVParams,
  UpdateCVBody,
  DeleteCVParams,
  GetCVHtmlParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cv", async (_req, res): Promise<void> => {
  const cvs = await db
    .select({
      id: cvsTable.id,
      fullName: cvsTable.fullName,
      email: cvsTable.email,
      jobTitle: cvsTable.jobTitle,
      createdAt: cvsTable.createdAt,
      updatedAt: cvsTable.updatedAt,
    })
    .from(cvsTable)
    .orderBy(cvsTable.createdAt);
  res.json(cvs.map(cv => ({
    ...cv,
    createdAt: cv.createdAt.toISOString(),
    updatedAt: cv.updatedAt.toISOString(),
  })));
});

router.post("/cv", async (req, res): Promise<void> => {
  const parsed = CreateCVBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  let cv: typeof cvsTable.$inferSelect;
  try {
    const [inserted] = await db.insert(cvsTable).values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      location: data.location ?? null,
      jobTitle: data.jobTitle,
      summary: data.summary,
      skills: data.skills,
      languages: data.languages,
      workExperience: data.workExperience ?? [],
      education: data.education ?? [],
      extraSections: data.extraSections ?? [],
      linkedinUrl: data.linkedinUrl ?? null,
      portfolioUrl: data.portfolioUrl ?? null,
      profilePhoto: data.profilePhoto ?? null,
      cvLanguage: data.cvLanguage ?? "en",
    }).returning();
    cv = inserted;
  } catch (err: unknown) {
    const cause = err instanceof Error ? (err.cause instanceof Error ? err.cause.message : String(err.cause)) : String(err);
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[CV INSERT ERROR]", msg, "| cause:", cause);
    res.status(500).json({ error: "Failed to save CV", detail: cause || msg });
    return;
  }

  res.status(201).json(serializeCV(cv));
});

router.get("/cv/:id", async (req, res): Promise<void> => {
  const params = GetCVParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cv] = await db
    .select()
    .from(cvsTable)
    .where(eq(cvsTable.id, params.data.id));

  if (!cv) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  res.json(serializeCV(cv));
});

router.patch("/cv/:id", async (req, res): Promise<void> => {
  const params = UpdateCVParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCVBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const updateData: Partial<typeof cvsTable.$inferInsert> = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.skills !== undefined) updateData.skills = data.skills;
  if (data.languages !== undefined) updateData.languages = data.languages;
  if (data.workExperience !== undefined) updateData.workExperience = data.workExperience;
  if (data.education !== undefined) updateData.education = data.education;
  if (data.extraSections !== undefined) updateData.extraSections = data.extraSections ?? [];
  if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
  if (data.portfolioUrl !== undefined) updateData.portfolioUrl = data.portfolioUrl;
  if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
  if (data.cvLanguage !== undefined) updateData.cvLanguage = data.cvLanguage;

  const [cv] = await db
    .update(cvsTable)
    .set(updateData)
    .where(eq(cvsTable.id, params.data.id))
    .returning();

  if (!cv) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  res.json(serializeCV(cv));
});

router.delete("/cv/:id", async (req, res): Promise<void> => {
  const params = DeleteCVParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cv] = await db
    .delete(cvsTable)
    .where(eq(cvsTable.id, params.data.id))
    .returning();

  if (!cv) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/cv/:id/html", async (req, res): Promise<void> => {
  const params = GetCVHtmlParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cv] = await db
    .select()
    .from(cvsTable)
    .where(eq(cvsTable.id, params.data.id));

  if (!cv) {
    res.status(404).json({ error: "CV not found" });
    return;
  }

  const html = generateCVHtml(cv);
  res.json({ html });
});

function serializeCV(cv: typeof cvsTable.$inferSelect) {
  return {
    ...cv,
    createdAt: cv.createdAt.toISOString(),
    updatedAt: cv.updatedAt.toISOString(),
  };
}

const CV_LABELS = {
  en: {
    summary: "Professional Summary",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    present: "Present",
  },
  id: {
    summary: "Ringkasan Profesional",
    experience: "Pengalaman Kerja",
    education: "Pendidikan",
    skills: "Keahlian",
    languages: "Bahasa",
    present: "Sekarang",
  },
} as const;

type CVLanguage = "en" | "id";
type CVTheme = "blue" | "black";

function parseCvStyle(value?: string | null): { lang: CVLanguage; theme: CVTheme } {
  const raw = (value ?? "en").toLowerCase();
  const [languagePart, themePart] = raw.split(":");
  return {
    lang: languagePart === "id" ? "id" : "en",
    theme: themePart === "black" ? "black" : "blue",
  };
}

function getCvStyles(theme: CVTheme): string {
  const accent = theme === "black" ? "#111111" : "#1e40af";
  const accentSoft = theme === "black" ? "#111111" : "#3b82f6";
  const accentBorder = theme === "black" ? "#d4d4d8" : "#bfdbfe";
  const tagBackground = theme === "black" ? "#f4f4f5" : "#eff6ff";

  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #f1f5f9; }
  body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #1a1a2e; background: #f1f5f9; line-height: 1.5; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 15mm; background: white; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid ${accent}; padding-bottom: 16px; margin-bottom: 24px; }
  .header-main { flex: 1; min-width: 0; }
  .name { font-size: 24pt; font-weight: 700; color: ${accent}; letter-spacing: -0.5px; }
  .job-title { font-size: 13pt; color: ${accentSoft}; font-weight: 500; margin-top: 2px; }
  .photo-frame { width: 30mm; aspect-ratio: 3 / 4; border: 1px solid ${accentBorder}; border-radius: 4px; overflow: hidden; background: #f8fafc; flex-shrink: 0; }
  .photo-frame img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
  .contact { margin-top: 8px; font-size: 9.5pt; color: #475569; display: flex; flex-wrap: wrap; gap: 8px 16px; }
  .contact a { color: #475569; text-decoration: none; }
  .contact-link { color: #475569 !important; }
  section { margin-bottom: 20px; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; border-bottom: 1px solid ${accentBorder}; padding-bottom: 4px; margin-bottom: 12px; font-weight: 700; }
  .summary { color: #374151; font-size: 10.5pt; line-height: 1.6; }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .entry-title { font-weight: 700; font-size: 10.5pt; color: #1a1a2e; }
  .entry-subtitle { color: #475569; font-size: 10pt; }
  .entry-date { font-size: 9.5pt; color: #6b7280; white-space: nowrap; margin-left: 8px; }
  .entry-gpa { margin-top: 2px; font-size: 9.5pt; color: #6b7280; }
  .entry-desc { margin: 6px 0 0 0; padding-left: 18px; font-size: 10pt; color: #374151; line-height: 1.5; list-style-type: disc; }
  .entry-desc li { margin-bottom: 4px; display: list-item; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: ${tagBackground}; border: 1px solid ${accentBorder}; border-radius: 4px; padding: 2px 8px; font-size: 9.5pt; color: ${accent}; }
  @page { size: A4; margin: 16mm 15mm; }
  @media screen {
    body { padding: 24px 0; }
    .page { box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); }
  }
  @media print {
    html, body { width: auto; min-height: auto; background: white; font-size: 10pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { padding: 0; }
    .page { width: auto; min-height: auto; padding: 0; margin: 0; box-shadow: none; }
    section, .entry { break-inside: avoid-page; page-break-inside: avoid; }
    a { color: #475569 !important; }
    .contact-link { color: #475569 !important; }
    .tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;
}

function generateCVHtml(cv: typeof cvsTable.$inferSelect): string {
  const { lang, theme } = parseCvStyle(cv.cvLanguage);
  const labels = CV_LABELS[lang];
  const cvStyles = getCvStyles(theme);

  const extraSectionsHtml = (cv.extraSections as { sectionTitle: string; entries: { title: string; subtitle?: string | null; date?: string | null; description?: string | null }[] }[] | null ?? [])
    .filter(sec => sec.entries.length > 0)
    .map(sec => `
      <section>
        <h2>${escapeHtml(sec.sectionTitle)}</h2>
        ${sec.entries.map(entry => `
          <div class="entry">
            <div class="entry-header">
              <div>
                <div class="entry-title">${escapeHtml(entry.title)}</div>
                ${entry.subtitle ? `<div class="entry-subtitle">${escapeHtml(entry.subtitle)}</div>` : ''}
              </div>
              ${entry.date ? `<div class="entry-date">${escapeHtml(entry.date)}</div>` : ''}
            </div>
            ${entry.description ? `
            <ul class="entry-desc">
              ${entry.description.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => `<li>${escapeHtml(l)}</li>`).join('')}
            </ul>` : ''}
          </div>
        `).join('')}
      </section>
    `).join('');

  const workExpHtml = (cv.workExperience as { company: string; position: string; startDate: string; endDate?: string | null; isCurrent: boolean; description: string }[])
    .map(exp => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${escapeHtml(exp.position)}</div>
            <div class="entry-subtitle">${escapeHtml(exp.company)}</div>
          </div>
          <div class="entry-date">${escapeHtml(exp.startDate)} - ${exp.isCurrent ? labels.present : escapeHtml(exp.endDate ?? '')}</div>
        </div>
        <ul class="entry-desc">
          ${exp.description
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `<li>${escapeHtml(line)}</li>`)
            .join('')}
        </ul>
      </div>
    `).join('');

  const educationHtml = (cv.education as { institution: string; degree: string; field: string; startDate: string; endDate?: string | null; isCurrent: boolean; gpa?: string | null }[])
    .map(edu => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${escapeHtml(edu.degree)} - ${escapeHtml(edu.field)}</div>
            <div class="entry-subtitle">${escapeHtml(edu.institution)}</div>
            ${edu.gpa ? `<div class="entry-gpa">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
          </div>
          <div class="entry-date">${escapeHtml(edu.startDate)} - ${edu.isCurrent ? labels.present : escapeHtml(edu.endDate ?? '')}</div>
        </div>
      </div>
    `).join('');

  const skills = (cv.skills as string[]).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('');
  const languages = (cv.languages as string[]).map(l => `<span class="tag">${escapeHtml(l)}</span>`).join('');

  const stripUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');
  const linksHtml = [
    cv.linkedinUrl ? `<a href="${escapeHtml(cv.linkedinUrl)}" class="contact-link">${escapeHtml(stripUrl(cv.linkedinUrl))}</a>` : '',
    cv.portfolioUrl ? `<a href="${escapeHtml(cv.portfolioUrl)}" class="contact-link">${escapeHtml(stripUrl(cv.portfolioUrl))}</a>` : '',
  ].filter(Boolean).join(' | ');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CV - ${escapeHtml(cv.fullName)}</title>
<style>
  ${cvStyles}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-main">
      <div class="name">${escapeHtml(cv.fullName)}</div>
      <div class="job-title">${escapeHtml(cv.jobTitle)}</div>
      <div class="contact">
        <span>${escapeHtml(cv.email)}</span>
        ${cv.phone ? `<span>${escapeHtml(cv.phone)}</span>` : ''}
        ${cv.location ? `<span>${escapeHtml(cv.location)}</span>` : ''}
        ${linksHtml}
      </div>
    </div>
    ${cv.profilePhoto ? `<div class="photo-frame"><img src="${escapeHtml(cv.profilePhoto)}" alt="Profile Photo" /></div>` : ''}
  </div>

  ${cv.summary ? `
  <section>
    <h2>${labels.summary}</h2>
    <div class="summary">${escapeHtml(cv.summary).replace(/\n/g, '<br>')}</div>
  </section>
  ` : ''}

  ${(cv.workExperience as unknown[]).length > 0 ? `
  <section>
    <h2>${labels.experience}</h2>
    ${workExpHtml}
  </section>
  ` : ''}

  ${(cv.education as unknown[]).length > 0 ? `
  <section>
    <h2>${labels.education}</h2>
    ${educationHtml}
  </section>
  ` : ''}

  ${extraSectionsHtml}

  ${(cv.skills as string[]).length > 0 ? `
  <section>
    <h2>${labels.skills}</h2>
    <div class="tags">${skills}</div>
  </section>
  ` : ''}

  ${(cv.languages as string[]).length > 0 ? `
  <section>
    <h2>${labels.languages}</h2>
    <div class="tags">${languages}</div>
  </section>
  ` : ''}
</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default router;
