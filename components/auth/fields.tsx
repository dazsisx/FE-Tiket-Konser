"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import styles from "./auth.module.css";

/* ---------- kolom isian ---------- */

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export function Field({ id, label, icon, trailing, className = "", ...input }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={id}
          className={`${styles.input} ${trailing ? styles.inputTrail : ""} ${className}`}
          style={icon ? undefined : { paddingLeft: "1rem" }}
          {...input}
        />
        {trailing && <span className={styles.trail}>{trailing}</span>}
      </div>
    </div>
  );
}

/** Kolom kata sandi dengan tombol tampil/sembunyikan. */
export function PasswordField({
  id,
  label,
  ...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { id: string; label: string }) {
  const [show, setShow] = useState(false);

  return (
    <Field
      id={id}
      label={label}
      type={show ? "text" : "password"}
      icon={<Lock size={18} />}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className={styles.eye}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
      {...input}
    />
  );
}

/* ---------- checkbox ---------- */

export function CheckField({
  id,
  label,
  ...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { id: string; label: ReactNode }) {
  return (
    <label htmlFor={id} className={styles.check}>
      <input id={id} type="checkbox" className={styles.checkBox} {...input} />
      <span>{label}</span>
    </label>
  );
}

/* ---------- tombol kirim ---------- */

export function SubmitButton({
  loading = false,
  loadingText = "Memproses...",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; loadingText?: string }) {
  return (
    <button type="submit" className={styles.submit} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <Loader2 size={18} className={styles.spinIcon} />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}

/* ---------- pesan galat ---------- */

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className={styles.alert}>
      <AlertCircle size={17} />
      <span>{children}</span>
    </div>
  );
}

/* ---------- petunjuk kecil ---------- */

export function Hint({ tone, children }: { tone?: "ok" | "bad"; children: ReactNode }) {
  return (
    <p className={styles.hint} data-tone={tone}>
      {children}
    </p>
  );
}

/* ---------- kekuatan kata sandi ---------- */

const LEVEL_LABEL = ["", "Lemah", "Cukup", "Bagus", "Kuat"];

export function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const level =
    1 +
    (password.length >= 10 ? 1 : 0) +
    (/[A-Za-z]/.test(password) && /\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password)) ? 1 : 0);

  return (
    <div className={styles.meter} data-level={level} aria-live="polite">
      <div className={styles.meterBars} aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={styles.meterBar} data-on={n <= level} />
        ))}
      </div>
      <span className={styles.meterLabel}>{LEVEL_LABEL[level]}</span>
    </div>
  );
}