"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { COPY, PRIVACY_SECTIONS, TERMS_SECTIONS, type LegalVariant } from "@/components/legal";
import styles from "./auth.module.css";

type Props = {
  open: boolean;
  tab: LegalVariant;
  onTabChange: (tab: LegalVariant) => void;
  onClose: () => void;
  /** dipanggil saat tombol "Saya Mengerti & Setuju" ditekan */
  onAgree: () => void;
};

/**
 * Dialog Syarat & Ketentuan / Kebijakan Privasi. Memakai <dialog> bawaan
 * browser: latar belakang otomatis di-blur lewat ::backdrop, fokus terkunci
 * di dalam dialog, dan tombol Esc menutupnya. Isi diambil dari
 * components/legal supaya sama dengan halaman /terms dan /privacy.
 */
export default function LegalDialog({ open, tab, onTabChange, onClose, onAgree }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const sections = tab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const copy = COPY[tab];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Kunci scroll halaman selama dialog terbuka.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="legal-title"
      onClose={onClose}
      // klik di area gelap (backdrop) menutup dialog
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialogCard}>
        <div className={styles.dialogHead}>
          <div>
            <p className={styles.dialogKicker}>{copy.label}</p>
            <h2 id="legal-title" className={`${styles.display} ${styles.dialogTitle}`}>
              {copy.title}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className={styles.dialogClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Dokumen legal">
          {(["terms", "privacy"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => onTabChange(t)}
              className={styles.tabBtn}
            >
              {t === "terms" ? "Syarat & Ketentuan" : "Kebijakan Privasi"}
            </button>
          ))}
        </div>

        <div className={styles.dialogBody} tabIndex={0}>
          <p className={styles.dialogLead}>{copy.description}</p>

          <ol className={styles.legalList}>
            {sections.map(({ icon: Icon, title, content }, i) => (
              <li key={title} className={styles.legalItem}>
                <span className={styles.legalIcon}>
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className={styles.legalTitle}>
                    {i + 1}. {title}
                  </h3>
                  {Array.isArray(content) ? (
                    <ul className={styles.legalBullets}>
                      {content.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.legalText}>{content}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

               <div className={styles.dialogFoot}>
          <button type="button" onClick={onAgree} className={styles.dialogAgree}>
            Saya Mengerti &amp; Setuju
          </button>
        </div>
      </div>
    </dialog>
  );
}