function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeUrlDisplay(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export interface PreviewData {
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  jobTitle: string;
  summary?: string;
  skills: string;
  languages?: string;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  workExperience: {
    company: string;
    position: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
    isCurrent: boolean;
    gpa?: string | null;
  }[];
}

const CV_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #1a1a2e; background: white; line-height: 1.5; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }
  .header { border-bottom: 2px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px; }
  .name { font-size: 24pt; font-weight: 700; color: #1e40af; letter-spacing: -0.5px; }
  .job-title { font-size: 13pt; color: #3b82f6; font-weight: 500; margin-top: 2px; }
  .contact { margin-top: 8px; font-size: 9.5pt; color: #475569; display: flex; flex-wrap: wrap; gap: 8px 16px; }
  .contact a { color: #475569; text-decoration: none; }
  .contact-link { color: #475569 !important; }
  section { margin-bottom: 20px; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px; margin-bottom: 12px; font-weight: 700; }
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
  .tag { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 2px 8px; font-size: 9.5pt; color: #1e40af; }
  @page { size: A4; margin: 18mm 15mm; }
  @media print {
    body { font-size: 10pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { max-width: 100%; padding: 0; margin: 0; }
    a { color: #475569 !important; }
    .contact-link { color: #475569 !important; }
    .tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

export function generateCVPreviewHtml(data: PreviewData): string {
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const languages = data.languages ? data.languages.split(',').map(s => s.trim()).filter(Boolean) : [];

  const workExpHtml = data.workExperience
    .filter(exp => exp.company || exp.position)
    .map(exp => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${escapeHtml(exp.position || '')}</div>
            <div class="entry-subtitle">${escapeHtml(exp.company || '')}</div>
          </div>
          <div class="entry-date">${escapeHtml(exp.startDate || '')}${exp.startDate ? ' – ' : ''}${exp.isCurrent ? 'Sekarang' : escapeHtml(exp.endDate || '')}</div>
        </div>
        ${exp.description ? `
        <ul class="entry-desc">
          ${exp.description.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => `<li>${escapeHtml(l)}</li>`).join('')}
        </ul>` : ''}
      </div>
    `).join('');

  const educationHtml = data.education
    .filter(edu => edu.institution || edu.degree)
    .map(edu => `
      <div class="entry">
        <div class="entry-header">
          <div>
            <div class="entry-title">${escapeHtml(edu.degree || '')}${edu.field ? ` – ${escapeHtml(edu.field)}` : ''}</div>
            <div class="entry-subtitle">${escapeHtml(edu.institution || '')}</div>
            ${edu.gpa ? `<div class="entry-gpa">IPK: ${escapeHtml(edu.gpa)}</div>` : ''}
          </div>
          <div class="entry-date">${escapeHtml(edu.startDate || '')}${edu.startDate ? ' – ' : ''}${edu.isCurrent ? 'Sekarang' : escapeHtml(edu.endDate || '')}</div>
        </div>
      </div>
    `).join('');

  const skillsHtml = skills.map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('');
  const languagesHtml = languages.map(l => `<span class="tag">${escapeHtml(l)}</span>`).join('');

  const linksHtml = [
    data.linkedinUrl ? `<a href="${escapeHtml(normalizeUrl(data.linkedinUrl))}" class="contact-link">${escapeHtml(normalizeUrlDisplay(data.linkedinUrl))}</a>` : '',
    data.portfolioUrl ? `<a href="${escapeHtml(normalizeUrl(data.portfolioUrl))}" class="contact-link">${escapeHtml(normalizeUrlDisplay(data.portfolioUrl))}</a>` : '',
  ].filter(Boolean).join(' · ');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>${CV_STYLES}</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="name">${escapeHtml(data.fullName || 'Nama Lengkap')}</div>
    <div class="job-title">${escapeHtml(data.jobTitle || 'Posisi / Jabatan')}</div>
    <div class="contact">
      <span>${escapeHtml(data.email || '')}</span>
      ${data.phone ? `<span>${escapeHtml(data.phone)}</span>` : ''}
      ${data.location ? `<span>${escapeHtml(data.location)}</span>` : ''}
      ${linksHtml}
    </div>
  </div>

  ${data.summary ? `
  <section>
    <h2>Ringkasan Profesional</h2>
    <div class="summary">${escapeHtml(data.summary).replace(/\n/g, '<br>')}</div>
  </section>` : ''}

  ${workExpHtml ? `
  <section>
    <h2>Pengalaman Kerja</h2>
    ${workExpHtml}
  </section>` : ''}

  ${educationHtml ? `
  <section>
    <h2>Pendidikan</h2>
    ${educationHtml}
  </section>` : ''}

  ${skillsHtml ? `
  <section>
    <h2>Keahlian</h2>
    <div class="tags">${skillsHtml}</div>
  </section>` : ''}

  ${languagesHtml ? `
  <section>
    <h2>Bahasa</h2>
    <div class="tags">${languagesHtml}</div>
  </section>` : ''}
</div>
</body>
</html>`;
}
