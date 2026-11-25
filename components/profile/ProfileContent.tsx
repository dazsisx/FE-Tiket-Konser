"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Big_Shoulders } from "next/font/google";
import {
  User,
  Mail,
  Ticket,
  LogOut,
  ShieldCheck,
  LayoutGrid,
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Camera,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadAvatar, type AuthUser } from "@/utils/api";
import styles from "./profile.module.css";

/**
 * Profil. Logika (guard login, ganti avatar, tab, keluar) tidak berubah dari
 * versi sebelumnya; hanya tampilan yang disamakan dengan landing, kategori,
 * pilih tiket, checkout, dan status pesanan.
 */

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const n = (i: number) => ({ "--n": i }) as CSSProperties;

type TabId = "overview" | "info" | "riwayat" | "keamanan";

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "overview", label: "Ringkasan", icon: LayoutGrid },
  { id: "info", label: "Info Akun", icon: User },
  { id: "riwayat", label: "Riwayat Pembelian", icon: Ticket },
  { id: "keamanan", label: "Keamanan", icon: ShieldCheck },
];

const ROLE_LABEL: Record<AuthUser["role"], string> = {
  admin: "Administrator",
  admin_offline: "Admin Offline",
  pelanggan: "Pelanggan DR Star",
};

const ROLE_NOTE: Record<AuthUser["role"], string> = {
  admin: "Kamu punya akses untuk mengelola event dan tiket.",
  admin_offline: "Kamu bertugas di penjualan tiket offline dan pemindaian tiket.",
  pelanggan: "Akun kamu aktif dan siap dipakai untuk memesan tiket.",
};

// TODO: ganti dengan jumlah tiket asli dari endpoint riwayat pembelian user
// begitu backend-nya siap.
const JUMLAH_TIKET = 0;

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className={`${display.variable} ${styles.root} pb-16 lg:pb-20`}>
      <div className={styles.grain} aria-hidden="true" />
      {children}
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <Shell>
      <div className={styles.content}>
        <header className={`${styles.hero} pt-6 pb-10 sm:pt-8 sm:pb-14`}>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="h-9 w-28 animate-pulse rounded-full bg-white/15" aria-hidden="true" />
            <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row" aria-hidden="true">
              <div className="h-24 w-24 animate-pulse rounded-full bg-white/15 sm:h-30 sm:w-30" />
              <div className="w-full flex-1 space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-white/15" />
                <div className="h-12 w-2/3 animate-pulse rounded bg-white/15" />
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8" aria-hidden="true">
          <div className={`${styles.skel} h-11 w-full max-w-md`} />
          <div className={`${styles.skel} mt-6 h-64`} />
        </div>
      </div>
    </Shell>
  );
}

function Card({
  i,
  title,
  icon,
  children,
}: {
  i: number;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`${styles.card} ${styles.in}`} style={n(i)}>
      <header className={styles.cardHead}>
        <span className={styles.cardIcon} aria-hidden="true">
          {icon}
        </span>
        <h2 className={`${styles.display} ${styles.cardTitle}`}>{title}</h2>
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.cardIcon} aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className={styles.infoLabel}>{label}</p>
        <p className={styles.infoValue}>{value}</p>
      </div>
    </div>
  );
}

export default function ProfileContent() {
  const { user, isLoading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  const initials =
    user.nama
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const roleLabel = ROLE_LABEL[user.role] ?? ROLE_LABEL.pelanggan;
  const roleNote = ROLE_NOTE[user.role] ?? ROLE_NOTE.pelanggan;
  const isStaff = user.role === "admin" || user.role === "admin_offline";

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Pilih file gambar yang valid.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ukuran avatar maksimal 5MB.");
      return;
    }
    try {
      setAvatarLoading(true);
      updateUser(await uploadAvatar(file));
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Avatar gagal diperbarui.");
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <Shell>
      <div className={styles.content}>
        {/* ===== hero profil ===== */}
        <header className={`${styles.hero} pt-6 pb-10 sm:pt-8 sm:pb-14`}>
          <div className={styles.glowA} aria-hidden="true" />
          <div className={styles.glowB} aria-hidden="true" />
          <div className={styles.heroShade} aria-hidden="true" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link href="/" className={styles.back}>
              <Home size={15} aria-hidden="true" />
              Beranda
            </Link>

            <div className={`${styles.heroMain} mt-8`}>
              <div className={`${styles.avatarWrap} ${styles.in}`} style={n(0)}>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className={styles.avatar}
                  aria-label="Ganti foto profil"
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="Avatar profil" />
                  ) : (
                    <span className={styles.display}>{initials}</span>
                  )}
                  <span className={styles.avatarHover} aria-hidden="true">
                    Ganti foto
                  </span>
                  {avatarLoading && (
                    <span className={styles.avatarBusy} role="status" aria-label="Mengunggah foto">
                      <span className={styles.spinner} />
                    </span>
                  )}
                </button>
                <span className={styles.camera} aria-hidden="true">
                  <Camera size={14} />
                </span>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    void handleAvatarChange(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="min-w-0">
                <span className={`${styles.kicker} ${styles.in}`} style={n(1)}>
                  {roleLabel}
                </span>
                <h1 className={`${styles.display} ${styles.title} ${styles.in}`} style={n(2)}>
                  {user.nama}
                </h1>
                <ul className={`${styles.meta} ${styles.in}`} style={n(3)}>
                  <li className={styles.metaRow}>
                    <Mail size={16} aria-hidden="true" />
                    {user.email}
                  </li>
                  {isStaff && (
                    <li>
                      <span className={styles.badge}>
                        <BadgeCheck size={13} aria-hidden="true" />
                        Admin
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          {avatarError && (
            <p role="alert" className={styles.alert}>
              {avatarError}
            </p>
          )}

          {/* ===== tab ===== */}
          <div className={styles.tabs} role="tablist" aria-label="Bagian profil">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls="panel-profil"
                  onClick={() => setActiveTab(tab.id)}
                  className={styles.tab}
                >
                  <Icon size={16} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ===== isi tab ===== */}
          <div
            key={activeTab}
            id="panel-profil"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="mt-6"
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card i={0} title="Ringkasan akun" icon={<User size={16} />}>
                    <InfoRow icon={User} label="Nama Lengkap" value={user.nama} />
                    <InfoRow icon={Mail} label="Email" value={user.email} />
                    <InfoRow icon={BadgeCheck} label="Tipe Akun" value={roleLabel} />
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <section className={`${styles.card} ${styles.in} p-5`} style={n(1)}>
                    <p className={styles.statLabel}>Status akun</p>
                    <p className={`${styles.display} ${styles.statValue}`}>{roleLabel}</p>
                    <p className={styles.statText}>{roleNote}</p>
                  </section>

                  <section className={`${styles.card} ${styles.in} p-5`} style={n(2)}>
                    <p className={styles.statLabel}>Tiket dibeli</p>
                    <p className={`${styles.display} ${styles.statValue} ${styles.statBig}`}>{JUMLAH_TIKET}</p>
                    <button type="button" onClick={() => setActiveTab("riwayat")} className={styles.link}>
                      Lihat riwayat
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "info" && (
              <Card i={0} title="Informasi dasar" icon={<User size={16} />}>
                <div className={styles.tiles}>
                  <div className={styles.tile}>
                    <p className={styles.infoLabel}>Nama Lengkap</p>
                    <p className={styles.infoValue}>{user.nama}</p>
                  </div>
                  <div className={styles.tile}>
                    <p className={styles.infoLabel}>Email</p>
                    <p className={styles.infoValue}>{user.email}</p>
                  </div>
                </div>
                {/* TODO: tambahkan field nomor HP / lokasi di sini begitu
                    backend menyediakan data & endpoint update profil. */}
                <p className={styles.tileNote}>
                  Informasi tambahan seperti nomor HP dan lokasi akan tersedia setelah kamu melengkapi profil.
                </p>
              </Card>
            )}

            {activeTab === "riwayat" && (
              <Card i={0} title="Riwayat pembelian" icon={<Ticket size={16} />}>
                {/* TODO: map dari data order user setelah endpoint backend siap */}
                <div className={styles.empty}>
                  <span className={styles.emptyIcon} aria-hidden="true">
                    <Ticket size={22} />
                  </span>
                  <p className={`${styles.display} ${styles.emptyTitle}`}>Belum ada tiket yang dibeli</p>
                  <p className={styles.emptyText}>Tiket yang kamu beli akan muncul di sini</p>
                  <Link href="/" className={`${styles.go} ${styles.emptyBtn}`}>
                    Jelajahi Event
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            )}

            {activeTab === "keamanan" && (
              <div className="flex flex-col gap-6">
                <Card i={0} title="Keamanan akun" icon={<ShieldCheck size={16} />}>
                  <div className={styles.setting}>
                    <div className={styles.settingMain}>
                      <span className={styles.cardIcon} aria-hidden="true">
                        <KeyRound size={16} />
                      </span>
                      <div>
                        <p className={styles.settingTitle}>
                          Kata Sandi
                          <span className={styles.pill}>
                            <CheckCircle2 size={11} aria-hidden="true" />
                            Terlindungi
                          </span>
                        </p>
                        <p className={styles.settingText}>
                          Atur ulang kata sandi kapan saja lewat verifikasi email.
                        </p>
                      </div>
                    </div>
                    <Link href="/auth/forgot-password" className={styles.ghost}>
                      Ubah Kata Sandi
                    </Link>
                  </div>
                </Card>

                <Card i={1} title="Keluar" icon={<LogOut size={16} />}>
                  <div className={styles.setting}>
                    <div>
                      <p className={styles.settingTitle}>Keluar dari Akun</p>
                      <p className={styles.settingText}>Kamu akan keluar dari sesi ini di perangkat ini.</p>
                    </div>
                    <button type="button" onClick={logout} className={`${styles.ghost} ${styles.danger}`}>
                      <LogOut size={16} aria-hidden="true" />
                      Keluar
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}