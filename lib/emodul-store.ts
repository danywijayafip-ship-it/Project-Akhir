import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  CARD_BANNER_COLORS,
  type EModulSubmission,
  type OfferingCode,
  type UploadedFileMeta,
} from './emodul-types';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const STORE_PATH = path.join(DATA_DIR, 'submissions.json');

const SEED_SUBMISSIONS: EModulSubmission[] = [
  {
    id: 'emodul-a2a-01',
    studentName: 'Nadia Kartika Putri',
    nim: '240121600412',
    offering: 'Offering A2A',
    topic: 'Desain Pembelajaran',
    title: 'Desain Pesan Pembelajaran Visual untuk Kelas Hybrid',
    description:
      'Panduan praktis merancang tata letak, kontras tipografi, dan hierarki informasi pada bahan ajar digital interaktif.',
    linkUrl: 'https://www.canva.com',
    fileMeta: null,
    accentColor: '#2438C9',
    version: 2,
    submittedAt: '2026-11-10T09:15:00.000Z',
    updatedAt: '2026-11-14T13:40:00.000Z',
    isCuratedSeed: true,
  },
  {
    id: 'emodul-a2b-02',
    studentName: 'Raka Pratama Putra',
    nim: '240121601128',
    offering: 'Offering A2B',
    topic: 'Multimedia Interaktif',
    title: 'E-Modul Eksplorasi Multimedia Pembelajaran Berbasis Flipbook',
    description:
      'Integrasi audio narasi, simulasi alur cerita, dan kuis formatif mandiri dalam satu modul digital interaktif.',
    linkUrl: 'https://heyzine.com',
    fileMeta: null,
    accentColor: '#E08A00',
    version: 1,
    submittedAt: '2026-11-11T11:20:00.000Z',
    updatedAt: '2026-11-15T08:10:00.000Z',
    isCuratedSeed: true,
  },
  {
    id: 'emodul-a2c-03',
    studentName: 'Aulia Rahmawati',
    nim: '240121601845',
    offering: 'Offering A2C',
    topic: 'Microlearning & Video',
    title: 'Strategi Microlearning untuk Modul Praktikum Mahasiswa',
    description:
      'Pemecahan materi kompleks menjadi unit belajar 5 menit lengkap dengan lembar refleksi dan rangkuman visual.',
    linkUrl: 'https://drive.google.com',
    fileMeta: null,
    accentColor: '#0F7B6C',
    version: 2,
    submittedAt: '2026-11-12T15:05:00.000Z',
    updatedAt: '2026-11-16T10:30:00.000Z',
    isCuratedSeed: true,
  },
  {
    id: 'emodul-a2d-04',
    studentName: 'Bagas Adi Nugroho',
    nim: '240121602309',
    offering: 'Offering A2D',
    topic: 'Bahan Ajar Proyek',
    title: 'Pengembangan Bahan Ajar Berbasis Project-Based Learning',
    description:
      'Kerangka kerja penyusunan skenario proyek, panduan aktivitas kelompok kolaboratif, dan lembar refleksi belajar.',
    linkUrl: 'https://www.canva.com',
    fileMeta: null,
    accentColor: '#7A3FC9',
    version: 1,
    submittedAt: '2026-11-18T14:22:00.000Z',
    updatedAt: '2026-11-18T14:22:00.000Z',
    isCuratedSeed: true,
  },
  {
    id: 'emodul-a2e-05',
    studentName: 'Siti Nurhaliza Azizah',
    nim: '240121602914',
    offering: 'Offering A2E',
    topic: 'Asesmen Formatif Digital',
    title: 'Instrumen Asesmen Formatif Digital & Latihan Mandiri',
    description:
      'Merancang bank soal adaptif, kunci pembahasan interaktif, dan latihan penguasaan kompetensi peserta didik.',
    linkUrl: 'https://heyzine.com',
    fileMeta: null,
    accentColor: '#C93B5A',
    version: 1,
    submittedAt: '2026-11-13T08:45:00.000Z',
    updatedAt: '2026-11-17T16:15:00.000Z',
    isCuratedSeed: true,
  },
  {
    id: 'emodul-a2a-06',
    studentName: 'Dimas Wahyu Firmansyah',
    nim: '240121600778',
    offering: 'Offering A2A',
    topic: 'Kurikulum & Inovasi',
    title: 'Kurasi Sumber Belajar Terbuka (OER) dalam E-Modul Adaptif',
    description:
      'Teknik menyusun modul ajar berlisensi terbuka dengan integrasi repositori multimedia dan atribusi akademik.',
    linkUrl: 'https://drive.google.com',
    fileMeta: null,
    accentColor: '#2438C9',
    version: 1,
    submittedAt: '2026-11-14T19:00:00.000Z',
    updatedAt: '2026-11-19T09:50:00.000Z',
    isCuratedSeed: true,
  },
];

async function ensureStorage(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(SEED_SUBMISSIONS, null, 2), 'utf8');
  }
}

export async function listSubmissions(): Promise<EModulSubmission[]> {
  await ensureStorage();
  const raw = await fs.readFile(STORE_PATH, 'utf8');
  const items = JSON.parse(raw) as EModulSubmission[];
  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export interface SaveUploadedFileInput {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}

export async function saveUploadedFile(
  input: SaveUploadedFileInput
): Promise<UploadedFileMeta> {
  await ensureStorage();
  const ext = path.extname(input.originalName).toLowerCase();
  const safeBase = path
    .basename(input.originalName, ext)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .slice(0, 48);
  const fileId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBase}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, fileId);
  await fs.writeFile(targetPath, input.buffer);
  return {
    fileId,
    originalName: input.originalName,
    mimeType: input.mimeType || 'application/octet-stream',
    sizeBytes: input.buffer.byteLength,
  };
}

export async function readUploadedFile(
  fileId: string
): Promise<{ buffer: Buffer; filePath: string } | null> {
  await ensureStorage();
  const sanitized = path.basename(fileId);
  const targetPath = path.join(UPLOADS_DIR, sanitized);
  try {
    const buffer = await fs.readFile(targetPath);
    return { buffer, filePath: targetPath };
  } catch {
    return null;
  }
}

export interface UpsertSubmissionInput {
  studentName: string;
  nim: string;
  offering: OfferingCode;
  topic: string;
  title: string;
  description: string;
  linkUrl: string;
  fileMeta: UploadedFileMeta | null;
}

export async function upsertSubmissionByNim(
  input: UpsertSubmissionInput
): Promise<{ submission: EModulSubmission; replacedPrevious: boolean }> {
  await ensureStorage();
  const items = await listSubmissions();
  const normalizedNim = input.nim.trim().toLowerCase();
  const existingIndex = items.findIndex(
    (item) => item.nim.trim().toLowerCase() === normalizedNim
  );
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    const previous = items[existingIndex];
    const updated: EModulSubmission = {
      ...previous,
      studentName: input.studentName.trim(),
      nim: input.nim.trim(),
      offering: input.offering,
      topic: input.topic.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      linkUrl: input.linkUrl.trim(),
      fileMeta: input.fileMeta ?? previous.fileMeta,
      version: previous.version + 1,
      updatedAt: now,
      isCuratedSeed: false,
    };
    items[existingIndex] = updated;
    await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), 'utf8');
    return { submission: updated, replacedPrevious: true };
  }

  const colorIndex = items.length % CARD_BANNER_COLORS.length;
  const created: EModulSubmission = {
    id: `emodul-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    studentName: input.studentName.trim(),
    nim: input.nim.trim(),
    offering: input.offering,
    topic: input.topic.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    linkUrl: input.linkUrl.trim(),
    fileMeta: input.fileMeta,
    accentColor: CARD_BANNER_COLORS[colorIndex],
    version: 1,
    submittedAt: now,
    updatedAt: now,
    isCuratedSeed: false,
  };
  items.unshift(created);
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), 'utf8');
  return { submission: created, replacedPrevious: false };
}
