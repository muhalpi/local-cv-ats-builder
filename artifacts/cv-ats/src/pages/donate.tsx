import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toDataURL } from "qrcode";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Heart,
  Landmark,
  ShieldCheck,
  QrCode,
  Smartphone,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Language } from "@/lib/i18n";

const OWNER_NAME = "Muhammad Alfi";
const STATIC_QRIS =
  "00020101021126610014COM.GO-JEK.WWW01189360091436973596810210G6973596810303UMI51440014ID.CO.QRIS.WWW0215ID10253734280240303UMI5204504553033605802ID5921Dejitaru Shop, SMBKRP6008SURABAYA61056019562070703A016304C747";

const paymentMethods = [
  { name: "BCA", number: "8620415481", type: "bank" },
  { name: "BRI", number: "313601028277532", type: "bank" },
  { name: "SeaBank", number: "901901068426", type: "bank" },
  {
    name: "ShopeePay / DANA / OVO / GoPay",
    number: "089514317357",
    type: "wallet",
  },
] as const;

const quickAmounts = [5000, 10000, 25000, 50000];

const pageCopy: Record<
  Language,
  {
    backHome: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    recipientLabel: string;
    bankTitle: string;
    bankSubtitle: string;
    bankTransfer: string;
    eWallet: string;
    copyAccount: string;
    qrisTitle: string;
    qrisSubtitle: string;
    amountLabel: string;
    amountPlaceholder: string;
    quickAmountLabel: string;
    qrReadyFor: string;
    qrAlt: string;
    qrLoading: string;
    qrEmpty: string;
    qrFailed: string;
    qrisSafeTitle: string;
    qrisSafeDesc: string;
    qrisSafetyNotes: string[];
    copiedTitle: string;
    copiedDesc: (label: string) => string;
    copyFailedTitle: string;
    copyFailedDesc: string;
  }
> = {
  id: {
    backHome: "Kembali",
    eyebrow: "Dukungan untuk BuatCV",
    title: "Bantu BuatCV tetap gratis dan ringan",
    subtitle:
      "Donasi Anda membantu biaya hosting, perbaikan bug, dan pengembangan alat CV yang tetap sederhana serta menjaga data pengguna tetap lokal.",
    recipientLabel: "a.n.",
    bankTitle: "Rekening dan e-wallet",
    bankSubtitle:
      "Gunakan salah satu tujuan berikut. Semua atas nama Muhammad Alfi.",
    bankTransfer: "Transfer bank",
    eWallet: "E-wallet",
    copyAccount: "Salin nomor",
    qrisTitle: "Donasi via QRIS",
    qrisSubtitle:
      "Masukkan nominal, lalu scan QR dari aplikasi pembayaran yang mendukung QRIS.",
    amountLabel: "Nominal donasi",
    amountPlaceholder: "10000",
    quickAmountLabel: "Nominal cepat",
    qrReadyFor: "QRIS dibuat untuk",
    qrAlt: "Kode QRIS untuk donasi",
    qrLoading: "Menyiapkan QRIS...",
    qrEmpty: "Masukkan nominal untuk membuat QRIS.",
    qrFailed: "QRIS gagal dibuat. Coba ubah nominal.",
    qrisSafeTitle: "QRIS resmi dan aman digunakan",
    qrisSafeDesc:
      "QRIS ini resmi untuk donasi BuatCV dan aman dipindai lewat aplikasi pembayaran tepercaya. Pastikan nama penerima dan nominal sudah benar sebelum konfirmasi.",
    qrisSafetyNotes: [
      "Tidak meminta PIN, password, OTP, atau data pribadi.",
      "Tidak mengunduh file dan tidak mengubah data di perangkat Anda.",
      "Pembayaran tetap dikonfirmasi langsung di aplikasi bank atau e-wallet Anda.",
    ],
    copiedTitle: "Disalin",
    copiedDesc: (label) => `${label} berhasil disalin.`,
    copyFailedTitle: "Gagal menyalin",
    copyFailedDesc: "Browser tidak mengizinkan akses clipboard.",
  },
  en: {
    backHome: "Back",
    eyebrow: "Support BuatCV",
    title: "Help keep BuatCV free and lightweight",
    subtitle:
      "Your donation helps cover hosting, bug fixes, and continued development of a simple CV tool that keeps user data local.",
    recipientLabel: "under",
    bankTitle: "Bank accounts and e-wallet",
    bankSubtitle:
      "Use one of these payment destinations. All are under Muhammad Alfi.",
    bankTransfer: "Bank transfer",
    eWallet: "E-wallet",
    copyAccount: "Copy number",
    qrisTitle: "Donate with QRIS",
    qrisSubtitle:
      "Enter an amount, then scan the QR code from any payment app that supports QRIS.",
    amountLabel: "Donation amount",
    amountPlaceholder: "10000",
    quickAmountLabel: "Quick amount",
    qrReadyFor: "QRIS generated for",
    qrAlt: "QRIS code for donation",
    qrLoading: "Preparing QRIS...",
    qrEmpty: "Enter an amount to generate QRIS.",
    qrFailed: "Failed to generate QRIS. Try changing the amount.",
    qrisSafeTitle: "Official QRIS and safe to use",
    qrisSafeDesc:
      "This official QRIS is for BuatCV donations and is safe to scan from a trusted payment app. Confirm the recipient name and amount before paying.",
    qrisSafetyNotes: [
      "It never asks for your PIN, password, OTP, or personal data.",
      "It does not download files or change data on your device.",
      "Payment confirmation stays inside your bank or e-wallet app.",
    ],
    copiedTitle: "Copied",
    copiedDesc: (label) => `${label} copied successfully.`,
    copyFailedTitle: "Copy failed",
    copyFailedDesc: "The browser did not allow clipboard access.",
  },
};

type TlvItem = [tag: string, value: string];

function tlv(tag: string, value: string) {
  return `${tag}${String(value.length).padStart(2, "0")}${value}`;
}

function parseTlv(payload: string): TlvItem[] {
  const items: TlvItem[] = [];
  let index = 0;

  while (index < payload.length) {
    const tag = payload.slice(index, index + 2);
    const length = Number.parseInt(payload.slice(index + 2, index + 4), 10);
    const value = payload.slice(index + 4, index + 4 + length);

    if (tag.length !== 2 || Number.isNaN(length) || value.length !== length) {
      throw new Error("Invalid QRIS payload.");
    }

    items.push([tag, value]);
    index += 4 + length;
  }

  return items;
}

function crc16(data: string) {
  let crc = 0xffff;

  for (let i = 0; i < data.length; i += 1) {
    crc ^= data.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function makeQrisNominal(staticQris: string, amount: number) {
  const normalizedAmount = Math.trunc(amount);

  if (normalizedAmount < 1) {
    throw new Error("Invalid donation amount.");
  }

  const payload = staticQris.trim().replace(/6304[0-9A-Fa-f]{4}$/, "");
  const items = parseTlv(payload);
  let result = "";

  for (const [tag, rawValue] of items) {
    let value = rawValue;

    if (tag === "01") {
      value = "12";
    }

    if (tag === "54") {
      continue;
    }

    result += tlv(tag, value);

    if (tag === "53") {
      result += tlv("54", String(normalizedAmount));
    }
  }

  result += "6304";
  return result + crc16(result);
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function cleanAmount(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, 9);
}

export default function Donate() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const copy = pageCopy[language];
  const [amount, setAmount] = useState("10000");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");

  const amountNumber = useMemo(
    () => Number.parseInt(amount || "0", 10),
    [amount],
  );
  const isValidAmount = Number.isFinite(amountNumber) && amountNumber > 0;

  const qrisPayload = useMemo(() => {
    if (!isValidAmount) return "";
    return makeQrisNominal(STATIC_QRIS, amountNumber);
  }, [amountNumber, isValidAmount]);

  useEffect(() => {
    let isActive = true;

    if (!qrisPayload) {
      setQrDataUrl("");
      setQrError("");
      return () => {
        isActive = false;
      };
    }

    setQrDataUrl("");
    setQrError("");

    toDataURL(qrisPayload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: {
        dark: "#0f172aff",
        light: "#ffffffff",
      },
    })
      .then((url) => {
        if (isActive) setQrDataUrl(url);
      })
      .catch(() => {
        if (isActive) setQrError(copy.qrFailed);
      });

    return () => {
      isActive = false;
    };
  }, [copy.qrFailed, qrisPayload]);

  const copyToClipboard = async (value: string, label: string) => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable.");
      await navigator.clipboard.writeText(value);
      toast({
        title: copy.copiedTitle,
        description: copy.copiedDesc(label),
      });
    } catch {
      toast({
        title: copy.copyFailedTitle,
        description: copy.copyFailedDesc,
      });
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden text-slate-900">
      <Navbar />

      <main>
        <section className="border-b border-slate-200/80 bg-white/75">
          <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Button
              asChild
              variant="ghost"
              className="mb-8 h-9 rounded-full px-3 text-slate-600 hover:text-slate-950"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {copy.backHome}
              </Link>
            </Button>

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                <Heart className="h-4 w-4" />
                {copy.eyebrow}
              </div>
              <h1 className="max-w-3xl break-words text-3xl font-extrabold leading-tight tracking-normal text-slate-950 sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mt-5 max-w-2xl break-words text-base leading-7 text-slate-600 sm:text-lg">
                {copy.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="container mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section aria-labelledby="donation-accounts" className="min-w-0">
              <div className="mb-5">
                <h2
                  id="donation-accounts"
                  className="text-2xl font-bold tracking-normal text-slate-950"
                >
                  {copy.bankTitle}
                </h2>
                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                  {copy.bankSubtitle}
                </p>
              </div>

              <div className="grid gap-4">
                {paymentMethods.map((method) => {
                  const isWallet = method.type === "wallet";
                  const Icon = isWallet ? Smartphone : Landmark;

                  return (
                    <Card
                      key={method.name}
                      className="min-w-0 overflow-hidden rounded-lg border-slate-200 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                              isWallet
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-sky-200 bg-sky-50 text-sky-700"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-500">
                              {isWallet ? copy.eWallet : copy.bankTransfer}
                            </p>
                            <h3 className="mt-1 break-words text-lg font-bold leading-tight tracking-normal text-slate-950">
                              {method.name}
                            </h3>
                            <p className="mt-2 break-all font-mono text-2xl font-bold tracking-normal text-slate-900">
                              {method.number}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              {copy.recipientLabel} {OWNER_NAME}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 shrink-0 rounded-lg bg-white"
                          onClick={() =>
                            copyToClipboard(method.number, method.name)
                          }
                          aria-label={`${copy.copyAccount} ${method.name}`}
                          title={`${copy.copyAccount} ${method.name}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            <Card className="min-w-0 overflow-hidden rounded-lg border-slate-200 bg-white/90 p-5 text-slate-900 shadow-sm sm:p-6">
              <section aria-labelledby="donation-qris" className="min-w-0">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="donation-qris"
                      className="break-words text-2xl font-bold tracking-normal"
                    >
                      {copy.qrisTitle}
                    </h2>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {copy.qrisSubtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Label
                    htmlFor="donation-amount"
                    className="text-sm font-semibold text-slate-800"
                  >
                    {copy.amountLabel}
                  </Label>
                  <div className="mt-2 flex min-w-0">
                    <div className="flex h-12 items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-600">
                      Rp
                    </div>
                    <Input
                      id="donation-amount"
                      inputMode="numeric"
                      value={amount}
                      placeholder={copy.amountPlaceholder}
                      onChange={(event) =>
                        setAmount(cleanAmount(event.target.value))
                      }
                      className="h-12 min-w-0 rounded-l-none border-slate-200 bg-white text-base font-semibold text-slate-950 placeholder:text-slate-400 focus-visible:ring-sky-400"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
                      {copy.quickAmountLabel}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {quickAmounts.map((value) => (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={
                            amountNumber === value ? "default" : "outline"
                          }
                          className={`h-10 min-w-0 rounded-lg px-2 text-xs font-bold ${
                            amountNumber === value
                              ? "border-sky-600 bg-sky-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                          onClick={() => setAmount(String(value))}
                        >
                          {formatRupiah(value)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 2xl:grid-cols-[300px_1fr]">
                  <div className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm sm:max-w-[300px] 2xl:mx-0">
                    {qrError ? (
                      <p className="max-w-48 text-sm font-semibold leading-6 text-red-600">
                        {qrError}
                      </p>
                    ) : qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={copy.qrAlt}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <p className="max-w-48 text-sm font-semibold leading-6 text-slate-500">
                        {isValidAmount ? copy.qrLoading : copy.qrEmpty}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">
                        {copy.qrReadyFor}
                      </p>
                      <p className="mt-1 text-3xl font-extrabold tracking-normal text-slate-950">
                        {formatRupiah(isValidAmount ? amountNumber : 0)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold tracking-normal text-slate-950">
                            {copy.qrisSafeTitle}
                          </h3>
                          <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                            {copy.qrisSafeDesc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {copy.qrisSafetyNotes.map((note) => (
                          <div
                            key={note}
                            className="flex items-start gap-2 text-sm leading-6 text-slate-700"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                            <span className="min-w-0 break-words">{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
