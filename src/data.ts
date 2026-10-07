import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  House,
  Lock,
  LogOut,
  MapPin,
  MoreHorizontal,
  NotebookPen,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Users,
  X,
  Sheet,
  CalendarDays,
  Presentation,
  Palette,
  TriangleAlert,
} from "lucide-react"
import { ENTS, LOGOS, DEPARTMENTS, deptEnt, isUnreachable } from "./ents"
import type { Ent } from "./ents"
import { CAMILLE, DAYS, DAYS_LONG, NEWS, NOE, TEACHER } from "./data"
import type { Lesson, Person, Profile } from "./data"

/* ---------- styles partagés ---------- */
const glass =
  "backdrop-blur-[14px] bg-white/10 border border-white/20 rounded-[24px] shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
const btnBase =
  "w-full min-h-[54px] rounded-full px-5 text-[17px] font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:opacity-70"
const btnPrimary = `${btnBase} bg-[var(--accent)] text-[#002a4d] font-bold shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:bg-[var(--accent-hover)]`
const btnGlass = `${btnBase} bg-white/10 border border-white/25 text-white backdrop-blur-[14px] hover:bg-white/20`
const iconBtn =
  "size-11 shrink-0 rounded-full bg-white/10 border border-white/25 backdrop-blur-[14px] flex items-center justify-center text-white hover:bg-white/20 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"

const SUBJECT_COLOR: Record<string, string> = {
  Mathématiques: "#2bd16d",
  Français: "#ffd166",
  Anglais: "#9ad1ff",
  "Histoire-Géo": "#ff9f7a",
  SVT: "#7be0c3",
  "Physique-Chimie": "#c4b5fd",
  Espagnol: "#ffb3d1",
  EPS: "#a5f3a0",
  Sport: "#a5f3a0",
  Sciences: "#7be0c3",
  Technologie: "#fcd34d",
  "Arts plastiques": "#f0abfc",
  Musique: "#f0abfc",
}
const dot = (s: string) => SUBJECT_COLOR[s] ?? "#ffffff"
const fr = (n: number) =>
  n.toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })

const PROFILES: {
  id: Profile
  label: string
  hint: string
  icon: ReactNode
  user: string
}[] = [
  {
    id: "parent",
    label: "Parent",
    hint: "Suivre la scolarité de mes enfants",
    icon: <Users size={26} />,
    user: "Parent Exemple",
  },
  {
    id: "teacher",
    label: "Enseignant",
    hint: "Mes classes, devoirs et notes",
    icon: <Presentation size={26} />,
    user: "Mme Exemple",
  },
  {
    id: "student",
    label: "Élève",
    hint: "Mes cours, devoirs et notes",
    icon: <GraduationCap size={26} />,
    user: "Camille Exemple",
  },
]

type Step = "welcome" | "ent" | "login" | "loading" | "customize" | "app"
type Tab = "home" | "courses" | "homework" | "grades" | "more"

/* ---------- petits composants ---------- */
function Footer({ note }: { note?: string }) {
  return (
    <footer className="mt-2 flex flex-col items-center gap-2 text-center">
      {note && (
        <p className="text-[13px] text-white/80 leading-snug max-w-[320px]">
          {note}
        </p>
      )}
      <p className="flex items-center gap-2 text-white font-semibold text-[16px]">
        <Lock size={18} className="text-[color:var(--accent-soft)]" /> Connexion
        sécurisée
      </p>
    </footer>
  )
}

function DemoPill({ children }: { children: ReactNode }) {
  return (
    <p className="w-full rounded-full bg-[var(--bg-to)]/30 border border-white/20 px-4 py-2 text-[13px] font-semibold text-white leading-snug text-center">
      {children}
    </p>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="size-12 rounded-[16px] bg-gradient-to-br from-[color:var(--accent-soft)] to-[color:var(--bg-from)] text-[#002a4d] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
        <School size={26} strokeWidth={2.4} />
      </span>
      <span className="text-[30px] font-bold text-white tracking-tight">
        Compagnon
      </span>
    </div>
  )
}

function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between px-1">
      <h2 className="text-[19px] font-bold text-white">{children}</h2>
      {action}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 min-h-[40px] px-4 rounded-full text-[14px] font-semibold border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 ${
        active
          ? "bg-white text-[color:var(--bg-to)] border-white"
          : "bg-white/10 text-white border-white/25 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  )
}

function Subject({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/90">
      <span
        className="size-2.5 rounded-full"
        style={{ background: dot(name) }}
      />
      {name}
    </span>
  )
}

/* ---------- 1. Accueil / profil ---------- */
function Welcome({ onPick }: { onPick: (p: Profile) => void }) {
  return (
    <div className="fade-up flex flex-col gap-5 flex-1">
      <div className="flex flex-col gap-3 pt-2">
        <Logo />
        <h1 className="text-[34px] leading-[1.08] font-semibold text-white mt-3">
          Toute l’école,
          <br />
          dans une seule appli.
        </h1>
        <p className="text-[16px] text-white/85 leading-snug">
          Retrouvez cours, devoirs et notes en vous connectant à votre ENT. Qui
          êtes-vous ?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PROFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            className={`${glass} p-4 flex items-center gap-4 text-left transition hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60`}
          >
            <span className="size-14 shrink-0 rounded-[18px] bg-white/10 border border-white/20 flex items-center justify-center text-white">
              {p.icon}
            </span>
            <span className="flex-1">
              <span className="block text-[21px] font-bold text-white leading-tight">
                {p.label}
              </span>
              <span className="block text-[14px] text-white/80 leading-snug">
                {p.hint}
              </span>
            </span>
            <ChevronRight className="text-white/70" />
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <DemoPill>Démonstration — aucune connexion réelle</DemoPill>
        <Footer />
      </div>
    </div>
  )
}

/* ---------- 2. Choix de l'ENT ---------- */
type Filter = "all" | "Service" | "Régionale"
const FILTERS: { id: Filter label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "Service", label: "Services" },
  { id: "Régionale", label: "Régionale" },
]

const norm = (s: string) =>
  s.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
const initials = (n: string) =>
  n.replace(/^ENT de /i, "")
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")

function EntLogo({ e, size = 44 }: { e: Ent size?: number }) {
  const [bad, setBad] = useState(false)
  const style = { width: size, height: size }
  if (e.logo && !bad) {
    return (
      <span
        style={style}
        className="shrink-0 rounded-[14px] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] flex items-center justify-center overflow-hidden p-1.5"
      >
        <img
          src={e.logo}
          alt=""
          draggable={false}
          onError={() => setBad(true)}
          className="size-full object-contain"
        />
      </span>
    )
  }
  return (
    <span
      style={style}
      className="shrink-0 rounded-[14px] bg-white/10 border border-white/20 text-white text-[14px] font-bold flex items-center justify-center"
    >
      {initials(e.name) || "?"}
    </span>
  )
}

function EntRow({ e, onPick }: { e: Ent onPick: (e: Ent) => void }) {
  return (
    <li>
      <button
        onClick={() => onPick(e)}
        className="w-full flex items-center gap-3 px-4 py-3 min-h-[64px] text-left hover:bg-white/10 active:bg-white/20 transition focus-visible:outline-none focus-visible:bg-white/20"
      >
        <EntLogo e={e} />
        <span className="flex-1 min-w-0">
          <span className="block text-[16px] font-semibold text-white truncate">
            {e.name}
          </span>
          <span className="block text-[13px] text-white/75 truncate">
            {e.area}
          </span>
        </span>
        <ChevronRight size={20} className="text-white/60 shrink-0" />
      </button>
    </li>
  )
}

function EntPicker({
  profile,
  onBack,
  onPick,
}: {
  profile: Profile
  onBack: () => void
  onPick: (e: Ent) => void
}) {
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const p = PROFILES.find((x) => x.id === profile)!
  const nq = norm(q.trim())

  const brands = useMemo(
    () =>
      ENTS.filter((e) => {
        const okKind =
          filter === "all" ||
          (filter === "Service" ? e.kind === "Service" : e.kind === "Régional")
        return okKind && (!nq || norm(`${e.name} ${e.area}`).includes(nq))
      }),
    [nq, filter],
  )

  const depts = useMemo(() => {
    if (filter === "Service") return []
    if (filter === "all" && nq.length < 2) return []
    return DEPARTMENTS.filter(
      (d) => !nq || norm(`${d.name} ${d.code}`).includes(nq),
    ).map(deptEnt)
  }, [nq, filter])

  const empty = brands.length === 0 && depts.length === 0

  return (
    <div className="fade-up flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button className={iconBtn} onClick={onBack} aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[26px] leading-[1.1] font-semibold text-white">
            Choisissez votre ENT
          </h1>
          <p className="text-[13px] text-white/80">Profil : {p.label}</p>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-5 sm:-mx-9 px-5 sm:px-9 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 -mt-1 flex flex-col gap-3 bg-[var(--bg-from)]/70 backdrop-blur-xl border-b border-white/15">
        <label className="flex items-center gap-3 rounded-full bg-white/15 border border-white/25 px-4 min-h-[50px] focus-within:bg-white/25 focus-within:border-white focus-within:ring-4 focus-within:ring-white/30 transition">
          <Search size={20} className="text-white/80 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              filter === "Régionale"
                ? "Votre département : Essonne, 69…"
                : "Pronote, Skolengo, un département…"
            }
            className="flex-1 min-w-0 bg-transparent outline-none text-white text-[16px] placeholder:text-white/60"
            aria-label="Rechercher un ENT"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Effacer"
              className="text-white/80"
            >
              <X size={18} />
            </button>
          )}
        </label>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              active={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {filter === "all" && !q && (
        <button
          onClick={() => setFilter("Régionale")}
          className={`${glass} p-4 flex items-center gap-4 text-left transition hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60`}
        >
          <span className="size-12 shrink-0 rounded-[16px] bg-[var(--accent)] text-[#002a4d] flex items-center justify-center">
            <MapPin size={24} />
          </span>
          <span className="flex-1">
            <span className="block text-[18px] font-bold text-white leading-tight">
              Mon ENT régional
            </span>
            <span className="block text-[13px] text-white/80 leading-snug">
              Choisissez votre département
            </span>
          </span>
          <ChevronRight className="text-white/70" />
        </button>
      )}

      {empty ? (
        <div className={`${glass} p-6 text-center flex flex-col gap-2`}>
          <p className="text-[18px] font-bold text-white">Aucun résultat</p>
          <p className="text-[14px] text-white/80">
            Essayez un autre mot, ou choisissez « Autre ENT ».
          </p>
        </div>
      ) : (
        <>
          {brands.length > 0 && (
            <ul className={`${glass} overflow-hidden divide-y divide-white/10`}>
              {brands.map((e) => (
                <EntRow key={e.id} e={e} onPick={onPick} />
              ))}
            </ul>
          )}
          {depts.length > 0 && (
            <>
              <SectionTitle
                action={
                  <span className="text-[13px] text-white/75">
                    {depts.length} départements
                  </span>
                }
              >
                Par département
              </SectionTitle>
              <ul
                className={`${glass} overflow-hidden divide-y divide-white/10`}
              >
                {depts.map((e) => (
                  <EntRow key={e.id} e={e} onPick={onPick} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <Footer note="Aucun lien réel avec ces services : démonstration locale." />
    </div>
  )
}

/* ---------- 3. Connexion fictive ---------- */
const DEMO_PASSWORD = "demo1234"

function Login({
  profile,
  ent,
  onBack,
  onSubmit,
}: {
  profile: Profile
  ent: Ent
  onBack: () => void
  onSubmit: (ok: boolean) => void
}) {
  const [id, setId] = useState("")
  const [pw, setPw] = useState("")
  const [show, setShow] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const p = PROFILES.find((x) => x.id === profile)!

  const errors: Record<string, string> = {}
  if (id.trim().length < 3)
    errors.id = "Saisissez un identifiant (3 caractères minimum)."
  if (pw.length < 4)
    errors.pw = "Le mot de passe doit contenir 4 caractères minimum."
  const err = (k: string) => (touched[k] ? errors[k] : undefined)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(errors).length) return setTouched({ id: true, pw: true })
    onSubmit(pw === DEMO_PASSWORD)
  }

  const field = (k: string) =>
    `block rounded-[18px] px-4 pt-2 pb-2.5 bg-white/10 border transition focus-within:bg-white/20 focus-within:border-white focus-within:ring-4 focus-within:ring-white/30 ${
      err(k) ? "border-[#ffb4a8]" : "border-white/25"
    }`
  const input =
    "w-full bg-transparent outline-none text-white text-[18px] font-medium placeholder:text-white/40 min-w-0"

  return (
    <form onSubmit={submit} noValidate className="fade-up flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={iconBtn}
          onClick={onBack}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[28px] leading-[1.1] font-semibold text-white">
          Connexion
        </h1>
      </div>

      <DemoPill>
        Démonstration — aucune connexion réelle. Ne saisissez pas vos vrais
        identifiants.
      </DemoPill>

      <section className={`${glass} p-4 flex items-center gap-3`}>
        <EntLogo e={ent} size={48} />
        <div className="min-w-0">
          <p className="text-[18px] font-bold text-white truncate">
            {ent.name}
          </p>
          <p className="text-[13px] text-white/80 truncate">
            {ent.area} · {p.label}
          </p>
        </div>
      </section>

      <section className={`${glass} p-4 flex flex-col gap-3`}>
        <label className="block">
          <span className={field("id")}>
            <span className="block text-[12px] text-white/80">
              Identifiant fictif
            </span>
            <input
              className={input}
              value={id}
              onChange={(e) => setId(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, id: true }))}
              placeholder="prenom.nom"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </span>
          {err("id") && (
            <span
              role="alert"
              className="block mt-1 px-2 text-[13px] text-[#ffd2ca] font-medium"
            >
              {err("id")}
            </span>
          )}
        </label>
        <label className="block">
          <span className={`${field("pw")} flex items-center gap-2`}>
            <span className="flex-1 min-w-0">
              <span className="block text-[12px] text-white/80">
                Mot de passe fictif
              </span>
              <input
                className={input}
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
                placeholder="••••••••"
                autoComplete="off"
              />
            </span>
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={
                show ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
              className="size-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
          {err("pw") && (
            <span
              role="alert"
              className="block mt-1 px-2 text-[13px] text-[#ffd2ca] font-medium"
            >
              {err("pw")}
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => {
            setId("compte.demo")
            setPw(DEMO_PASSWORD)
            setTouched({})
          }}
          className="self-start inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/25 px-4 min-h-[44px] text-[14px] font-semibold text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        >
          <Sparkles size={16} /> Remplir avec un compte de démonstration
        </button>
      </section>

      <button type="submit" className={btnPrimary}>
        Se connecter <ArrowRight size={20} />
      </button>
      <button type="button" className={btnGlass} onClick={onBack}>
        <ArrowLeft size={20} /> Changer d’ENT
      </button>
      <Footer note="Aucune donnée envoyée ni enregistrée. Les informations affichées sont des exemples." />
    </form>
  )
}

type Failure = "password" | "unreachable" | null

function Connecting({
  ent,
  fail,
  onRetry,
  onChangeEnt,
}: {
  ent: Ent
  fail: Failure
  onRetry: () => void
  onChangeEnt: () => void
}) {
  const steps = [
    "Connexion sécurisée simulée…",
    "Récupération des cours…",
    "Récupération des devoirs…",
    "Récupération des notes…",
  ]
  const [pct, setPct] = useState(0)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const start = performance.now()
    const t = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / 2400)
      const v = Math.round((1 - Math.pow(1 - p, 2)) * 100)
      const stop = fail === "unreachable" ? 24 : 42
      if (fail && v >= stop) {
        setPct(stop)
        setFailed(true)
        window.clearInterval(t)
      } else setPct(v)
    }, 40)
    return () => window.clearInterval(t)
  }, [fail])
  const i = Math.min(steps.length - 1, Math.floor(pct / 26))
  return (
    <div className="fade-up flex-1 flex flex-col items-center justify-center gap-8 text-center">
      <EntLogo e={ent} size={72} />
      <h1 className="text-[26px] font-semibold text-white">{ent.name}</h1>
      <div className="w-full max-w-[300px] flex flex-col gap-3">
        <div
          className="h-3 rounded-full bg-white/15 border border-white/15 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-colors ${
              failed
                ? "bg-[#ff8a7a]"
                : "bg-gradient-to-r from-[color:var(--bg-from)] to-[color:var(--accent-soft)]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {failed ? (
          <div role="alert" className="fade-up flex flex-col gap-1">
            <p className="text-[16px] font-bold text-[#ffd2ca]">
              {fail === "unreachable"
                ? "Impossible de rejoindre ce service"
                : "Mot de passe incorrect, utilisez les détails de démo."}
            </p>
            {fail === "unreachable" && (
              <p className="text-[13px] text-white/85 leading-snug">
                {ent.name} n’a pas pu être rejoint. Réessayez plus tard ou
                choisissez un autre ENT.
              </p>
            )}
          </div>
        ) : (
          <div
            className="flex items-center justify-between text-[14px] text-white/90"
            aria-live="polite"
          >
            <span>{steps[i]}</span>
            <span className="font-semibold tabular-nums">{pct} %</span>
          </div>
        )}
      </div>
      {failed && (
        <div className="w-full max-w-[300px] fade-up">
          <button className={btnGlass} onClick={onRetry}>
            <ArrowLeft size={20} /> Réessayer
          </button>
          {fail === "unreachable" && (
            <button className={`${btnGlass} mt-2`} onClick={onChangeEnt}>
              <RefreshCw size={18} /> Changer d’ENT
            </button>
          )}
        </div>
      )}
      <Footer />
    </div>
  )
}

/* ---------- 4. Application connectée ---------- */
type Ctx = {
  profile: Profile
  ent: Ent
  person: Person
  setChild: (n: number) => void
  child: number
  done: Set<string>
  toggle: (id: string) => void
  notify: (m: string) => void
  goto: (t: Tab) => void
  prefs: Prefs
  customize: () => void
}

function todayIndex() {
  const d = new Date().getDay()
  return d >= 1 && d <= 5 ? d - 1 : 0
}

function lessonsFor(c: Ctx, day: number): Lesson[] {
  return c.profile === "teacher"
    ? TEACHER.schedule[day]
    : c.person.schedule[day]
}

function ChildSwitch({ c }: { c: Ctx }) {
  if (c.profile !== "parent") return null
  return (
    <div className="flex gap-2" role="tablist" aria-label="Choisir un enfant">
      {[CAMILLE, NOE].map((p, i) => (
        <Chip key={p.name} active={c.child === i} onClick={() => c.setChild(i)}>
          {p.name} · {p.level}
        </Chip>
      ))}
    </div>
  )
}

function LessonRow({ l, teacher }: { l: Lesson teacher: boolean }) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="w-[52px] shrink-0 text-right pt-0.5">
        <p className="text-[15px] font-bold text-white leading-tight">
          {l.start}
        </p>
        <p className="text-[12px] text-white/65">{l.end}</p>
      </div>
      <div
        className="w-1 rounded-full shrink-0"
        style={{ background: dot(l.subject) }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold text-white leading-tight">
          {l.subject}
        </p>
        <p className="text-[13px] text-white/80 flex items-center gap-1 mt-0.5">
          <MapPin size={13} /> {l.room} · {teacher ? l.who : l.who}
        </p>
      </div>
    </div>
  )
}

function Home({ c }: { c: Ctx }) {
  const teacher = c.profile === "teacher"
  const day = todayIndex()
  const lessons = lessonsFor(c, day)
  const next = lessons[0]
  const pending = c.person.homework.filter((h) => !c.done.has(h.id) && !h.done)
  const last = c.person.grades[0]
  const name = PROFILES.find((p) => p.id === c.profile)!.user
  const news = NEWS[c.profile]
  const toGrade = TEACHER.work.reduce((a, w) => a + w.handed, 0)

  return (
    <div className="fade-up flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <span className="size-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
          <UserRound size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] leading-[1.1] font-semibold text-white truncate">
            Bonjour, {c.prefs.nickname.trim() || name.split(" ")[0]}
          </h1>
          <p className="text-[13px] text-white/80 truncate">
            {DAYS_LONG[day]} · {c.ent.name}
          </p>
        </div>
        <button
          className={iconBtn}
          aria-label="Notifications"
          onClick={() => c.notify("Notifications : démonstration")}
        >
          <Bell size={20} />
        </button>
      </header>

      <ChildSwitch c={c} />

      <section className={`${glass} p-4 flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <SectionTitle>
            {teacher ? "Prochain cours" : "Prochain cours"}
          </SectionTitle>
          <span className="text-[11px] font-semibold rounded-full bg-white/10 px-2 py-1 text-white">
            Aujourd’hui
          </span>
        </div>
        {next ? (
          <LessonRow l={next} teacher={teacher} />
        ) : (
          <p className="text-white/85">Aucun cours aujourd’hui.</p>
        )}
        <button
          className="text-[14px] font-semibold text-white flex items-center gap-1 self-start min-h-[36px]"
          onClick={() => c.goto("courses")}
        >
          Voir l’emploi du temps <ArrowRight size={16} />
        </button>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => c.goto("homework")}
          className={`${glass} p-4 text-left flex flex-col gap-1 active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60`}
        >
          <NotebookPen size={22} className="text-[#ffd166]" />
          <p className="text-[34px] font-bold text-white leading-none mt-1">
            {teacher ? toGrade : pending.length}
          </p>
          <p className="text-[13px] text-white/85 leading-snug">
            {teacher
              ? "copies à corriger"
              : pending.length > 1
                ? "devoirs à faire"
                : "devoir à faire"}
          </p>
        </button>
        <button
          onClick={() => c.goto("grades")}
          className={`${glass} p-4 text-left flex flex-col gap-1 active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60`}
        >
          <TrendingUp size={22} className="text-[color:var(--accent-soft)]" />
          <p className="text-[34px] font-bold text-white leading-none mt-1">
            {teacher ? fr(TEACHER.classes[0].avg) : fr(last.value)}
            <span className="text-[16px] font-semibold text-white/70">/20</span>
          </p>
          <p className="text-[13px] text-white/85 leading-snug">
            {teacher ? `moyenne ${TEACHER.classes[0].name}` : `${last.subject}`}
          </p>
        </button>
      </div>

      {c.prefs.showNews && (
        <section className="flex flex-col gap-3">
          <SectionTitle>Dernières nouvelles</SectionTitle>
          <ul className={`${glass} divide-y divide-white/10 overflow-hidden`}>
            {news.map((n, i) => (
              <li key={i} className="p-4 flex gap-3">
                <span className="size-9 shrink-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Bell size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] text-white leading-snug">
                    {n.text}
                  </p>
                  <p className="text-[12px] text-white/70 mt-1">
                    {n.from} · {n.when}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Courses({ c }: { c: Ctx }) {
  const [day, setDay] = useState(todayIndex())
  const teacher = c.profile === "teacher"
  const lessons = lessonsFor(c, day)
  const tools = [
    { icon: <BookOpen size={20} />, label: "Cahier de textes" },
    { icon: <Sheet size={20} />, label: "Documents partagés" },
    { icon: <CalendarDays size={20} />, label: "Calendrier de l’année" },
  ]
  return (
    <div className="fade-up flex flex-col gap-4">
      <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
        Cours
      </h1>
      <ChildSwitch c={c} />
      <div className="grid grid-cols-5 gap-2" role="tablist">
        {DAYS.map((d, i) => (
          <button
            key={d}
            role="tab"
            aria-selected={day === i}
            onClick={() => setDay(i)}
            className={`min-h-[52px] rounded-[16px] text-[15px] font-semibold border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 ${
              day === i
                ? "bg-white text-[color:var(--bg-to)] border-white"
                : "bg-white/10 text-white border-white/25"
            }`}
          >
            {d}
            {i === todayIndex() && (
              <span className="block mx-auto mt-0.5 size-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        ))}
      </div>
      <section key={day} className={`${glass} p-4 flex flex-col gap-4 fade-up`}>
        <SectionTitle
          action={
            <span className="text-[13px] text-white/75">
              {lessons.length} cours
            </span>
          }
        >
          {DAYS_LONG[day]}
        </SectionTitle>
        {lessons.map((l, i) => (
          <LessonRow key={i} l={l} teacher={teacher} />
        ))}
      </section>
      <SectionTitle>Ressources</SectionTitle>
      <ul className={`${glass} divide-y divide-white/10 overflow-hidden`}>
        {tools.map((t) => (
          <li key={t.label}>
            <button
              onClick={() => c.notify(`${t.label} : démonstration`)}
              className="w-full flex items-center gap-3 px-4 min-h-[60px] text-left text-white hover:bg-white/10 transition"
            >
              <span className="size-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                {t.icon}
              </span>
              <span className="flex-1 text-[16px] font-semibold">
                {t.label}
              </span>
              <ChevronRight size={20} className="text-white/60" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Homework({ c }: { c: Ctx }) {
  const [tab, setTab] = useState<"todo" | "done">("todo")
  if (c.profile === "teacher") {
    return (
      <div className="fade-up flex flex-col gap-4">
        <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
          Devoirs donnés
        </h1>
        {TEACHER.work.map((w) => {
          const pct = Math.round((w.handed / w.total) * 100)
          return (
            <section key={w.id} className={`${glass} p-4 flex flex-col gap-3`}>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-bold text-white">
                  {w.cls}
                </span>
                <span className="text-[13px] text-white/80 flex items-center gap-1">
                  <Clock size={14} /> Pour {w.due.toLowerCase()}
                </span>
              </div>
              <p className="text-[17px] font-semibold text-white leading-snug">
                {w.title}
              </p>
              <div>
                <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-soft)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[13px] text-white/85 mt-1.5">
                  {w.handed} / {w.total} rendus
                </p>
              </div>
              <button
                className={btnGlass}
                onClick={() => c.notify("Correction : démonstration")}
              >
                Corriger les copies
              </button>
            </section>
          )
        })}
      </div>
    )
  }
  const items = c.person.homework
  const isDone = (id: string, base: boolean) => (c.done.has(id) ? !base : base)
  const todo = items.filter((h) => !isDone(h.id, h.done))
  const dn = items.filter((h) => isDone(h.id, h.done))
  const shown = tab === "todo" ? todo : dn
  return (
    <div className="fade-up flex flex-col gap-4">
      <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
        Devoirs
      </h1>
      <ChildSwitch c={c} />
      <div className="flex gap-2">
        <Chip active={tab === "todo"} onClick={() => setTab("todo")}>
          À faire ({todo.length})
        </Chip>
        <Chip active={tab === "done"} onClick={() => setTab("done")}>
          Faits ({dn.length})
        </Chip>
      </div>
      {shown.length === 0 && (
        <div
          className={`${glass} p-8 text-center flex flex-col items-center gap-2`}
        >
          <span className="size-14 rounded-full bg-[var(--accent)] text-[#002a4d] flex items-center justify-center">
            <Check size={28} strokeWidth={3} />
          </span>
          <p className="text-[18px] font-bold text-white">
            {tab === "todo" ? "Tout est fait !" : "Rien de fait pour l’instant"}
          </p>
        </div>
      )}
      {shown.map((h) => {
        const d = isDone(h.id, h.done)
        return (
          <section
            key={h.id}
            className={`${glass} p-4 flex gap-3 items-start fade-up`}
          >
            <button
              onClick={() => c.toggle(h.id)}
              aria-label={d ? "Marquer à faire" : "Marquer comme fait"}
              aria-pressed={d}
              className={`size-11 shrink-0 rounded-full border-2 flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 ${
                d
                  ? "bg-[var(--accent)] border-[color:var(--accent)] text-[#002a4d]"
                  : "border-white/50 text-transparent hover:bg-white/10"
              }`}
            >
              <Check size={22} strokeWidth={3} />
            </button>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Subject name={h.subject} />
              <p
                className={`text-[16px] font-semibold leading-snug ${
                  d ? "text-white/60 line-through" : "text-white"
                }`}
              >
                {h.title}
              </p>
              <p className="text-[13px] text-white/80 flex items-center gap-1">
                <Clock size={13} /> Pour : {h.due.toLowerCase()}
              </p>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Grades({ c }: { c: Ctx }) {
  if (c.profile === "teacher") {
    return (
      <div className="fade-up flex flex-col gap-4">
        <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
          Notes des classes
        </h1>
        {TEACHER.classes.map((k) => (
          <section key={k.id} className={`${glass} p-4 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[22px] font-bold text-white leading-none">
                  {k.name}
                </p>
                <p className="text-[13px] text-white/80 mt-1">
                  {k.students} élèves · {k.last}
                </p>
              </div>
              <p className="text-[34px] font-bold text-white leading-none">
                {fr(k.avg)}
                <span className="text-[15px] text-white/70">/20</span>
              </p>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/15">
              <div
                className="absolute inset-y-0 rounded-full bg-[var(--accent-soft)]/90"
                style={{
                  left: `${(k.low / 20) * 100}%`,
                  right: `${100 - (k.best / 20) * 100}%`,
                }}
              />
              <div
                className="absolute -top-1 size-4.5 w-1 h-4.5 rounded-full bg-white"
                style={{ left: `${(k.avg / 20) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[13px] text-white/85">
              <span>Min. {fr(k.low)}</span>
              <span>Moyenne {fr(k.avg)}</span>
              <span>Max. {fr(k.best)}</span>
            </div>
          </section>
        ))}
        <button
          className={btnGlass}
          onClick={() => c.notify("Saisie des notes : démonstration")}
        >
          <NotebookPen size={18} /> Saisir des notes
        </button>
      </div>
    )
  }
  const g = c.person.grades
  const coef = g.reduce((a, x) => a + x.coef, 0)
  const avg = g.reduce((a, x) => a + x.value * x.coef, 0) / coef
  const cavg = g.reduce((a, x) => a + x.classAvg * x.coef, 0) / coef
  const diff = avg - cavg
  return (
    <div className="fade-up flex flex-col gap-4">
      <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
        Notes
      </h1>
      <ChildSwitch c={c} />
      <section className={`${glass} p-5 flex items-center gap-5`}>
        <div className="size-[104px] shrink-0 rounded-full border-[6px] border-[color:var(--accent-soft)] bg-white/10 flex flex-col items-center justify-center">
          <span className="text-[34px] font-bold text-white leading-none">
            {fr(avg)}
          </span>
          <span className="text-[12px] text-white/75">sur 20</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-bold text-white">Moyenne générale</p>
          <p className="text-[14px] text-white/85 leading-snug">
            {c.prefs.showClassAvg
              ? `${diff >= 0 ? "+" : "−"}${fr(Math.abs(diff))} point${
                  Math.abs(diff) >= 2 ? "s" : ""
                } par rapport à la classe (${fr(cavg)})`
              : "Moyenne pondérée par les coefficients"}
          </p>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--accent-soft)]">
            <Star size={14} /> {c.person.name}, {c.person.level}
          </span>
        </div>
      </section>
      <SectionTitle>Dernières évaluations</SectionTitle>
      <ul className="flex flex-col gap-3">
        {g.map((x, i) => (
          <li key={i} className={`${glass} p-4 flex flex-col gap-2`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Subject name={x.subject} />
                <p className="text-[16px] font-semibold text-white leading-snug mt-0.5">
                  {x.title}
                </p>
                <p className="text-[12px] text-white/70">
                  {x.date} · coef. {x.coef}
                </p>
              </div>
              <p className="text-[26px] font-bold text-white leading-none shrink-0">
                {fr(x.value)}
                <span className="text-[13px] text-white/70">/20</span>
              </p>
            </div>
            <div
              className="relative h-2 rounded-full bg-white/15"
              aria-label={`Moyenne de la classe ${fr(x.classAvg)}`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(x.value / 20) * 100}%`,
                  background: dot(x.subject),
                }}
              />
              {c.prefs.showClassAvg && (
                <div
                  className="absolute -top-1 w-0.5 h-4 bg-white"
                  style={{ left: `${(x.classAvg / 20) * 100}%` }}
                />
              )}
            </div>
            {c.prefs.showClassAvg && (
              <p className="text-[12px] text-white/70">
                Trait blanc : moyenne de la classe ({fr(x.classAvg)})
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function More({
  c,
  onEnt,
  onLogout,
}: {
  c: Ctx
  onEnt: () => void
  onLogout: () => void
}) {
  const p = PROFILES.find((x) => x.id === c.profile)!
  const rows = [
    {
      icon: <Palette size={20} />,
      label: "Personnaliser",
      sub: "Thème, couleur, taille, accueil",
      onClick: c.customize,
    },
    {
      icon: <RefreshCw size={20} />,
      label: "Changer d’ENT",
      sub: c.ent.name,
      onClick: onEnt,
    },
    {
      icon: <ShieldCheck size={20} />,
      label: "Confidentialité",
      sub: "Aucune donnée collectée",
      onClick: () => c.notify("Aucune donnée n’est collectée ni enregistrée"),
    },
  ]
  return (
    <div className="fade-up flex flex-col gap-4">
      <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
        Plus
      </h1>
      <section className={`${glass} p-4 flex items-center gap-4`}>
        <span className="size-14 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white shrink-0">
          {p.icon}
        </span>
        <div className="min-w-0">
          <p className="text-[20px] font-bold text-white truncate">{p.user}</p>
          <p className="text-[13px] text-white/80 truncate">
            {p.label} · {c.ent.name}
          </p>
        </div>
      </section>
      <ul className={`${glass} divide-y divide-white/10 overflow-hidden`}>
        {rows.map((r) => (
          <li key={r.label}>
            <button
              onClick={r.onClick}
              className="w-full flex items-center gap-3 px-4 min-h-[68px] text-left text-white hover:bg-white/10 transition"
            >
              <span className="size-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                {r.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[16px] font-semibold">
                  {r.label}
                </span>
                <span className="block text-[13px] text-white/75 truncate">
                  {r.sub}
                </span>
              </span>
              <ChevronRight size={20} className="text-white/60" />
            </button>
          </li>
        ))}
      </ul>
      <button className={btnGlass} onClick={onLogout}>
        <LogOut size={18} /> Se déconnecter
      </button>
      <DemoPill>
        Démonstration — données d’exemple, aucune connexion réelle
      </DemoPill>
      <Footer />
    </div>
  )
}

const TABS: { id: Tab label: string icon: ReactNode }[] = [
  { id: "home", label: "Accueil", icon: <House size={22} /> },
  { id: "courses", label: "Cours", icon: <BookOpen size={22} /> },
  { id: "homework", label: "Devoirs", icon: <NotebookPen size={22} /> },
  { id: "grades", label: "Notes", icon: <GraduationCap size={22} /> },
  { id: "more", label: "Plus", icon: <MoreHorizontal size={22} /> },
]

/* ---------- chargement initial ---------- */
function useAssetsLoader() {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const tasks: Promise<unknown>[] = [
      ...LOGOS.map(
        (src) =>
          new Promise<void>((res) => {
            const img = new Image()
            img.onload = img.onerror = () => res()
            img.src = src
          }),
      ),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ]
    const DURATION = 4800
    const start = performance.now()
    let n = 0
    let real = 0
    tasks.forEach((t) =>
      t.then(() => {
        n++
        real = n / tasks.length
      }),
    )
    const tick = window.setInterval(() => {
      const timed = Math.min((performance.now() - start) / DURATION, 1)
      if (alive) setProgress(Math.min(real, timed))
    }, 80)
    const minDelay = new Promise((r) => window.setTimeout(r, DURATION))
    Promise.all([...tasks, minDelay]).then(() => {
      if (!alive) return
      setProgress(1)
      setReady(true)
    })
    return () => {
      alive = false
      window.clearInterval(tick)
    }
  }, [])
  return { progress, ready }
}

function Splash({
  progress,
  ready,
  leaving,
  onDismiss,
}: {
  progress: number
  ready: boolean
  leaving: boolean
  onDismiss: () => void
}) {
  const pct = Math.round(progress * 100)
  const orbit = ENTS.filter((e) => e.logo).slice(0, 8)
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] bg-gradient-to-b from-[color:var(--bg-from)] to-[color:var(--bg-to)] flex flex-col items-center justify-center gap-10 px-8 transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative size-[260px] flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-white/15" />
        <span className="absolute inset-6 rounded-full border border-dashed border-white/15" />
        <div className="absolute inset-0 orbit">
          {orbit.map((e, i) => {
            const a = (i / orbit.length) * 2 * Math.PI
            return (
              <span
                key={e.id}
                className="absolute left-1/2 top-1/2 size-9 -ml-[18px] -mt-[18px]"
                style={{
                  transform: `translate(${Math.cos(a) * 118}px, ${Math.sin(a) * 118}px)`,
                }}
              >
                <span className="orbit-rev block size-9 rounded-[11px] bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                  <img
                    src={e.logo}
                    alt=""
                    className="size-full object-contain"
                  />
                </span>
              </span>
            )
          })}
        </div>
        <span className="pulse-soft size-24 rounded-[30px] bg-gradient-to-br from-[color:var(--accent-soft)] to-[color:var(--bg-from)] text-[#002a4d] flex items-center justify-center shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
          <School size={50} strokeWidth={2.3} />
        </span>
      </div>
      <div className="w-full max-w-[280px] flex flex-col items-center gap-3">
        <p className="text-[30px] font-bold text-white tracking-tight">
          Compagnon
        </p>
        <div
          className="w-full h-2 rounded-full bg-white/15 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--accent-soft)] transition-[width] duration-300"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        </div>
        <p className="text-[13px] text-white/85">Chargement des ENT… {pct} %</p>
      </div>
      {ready && !leaving && (
        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center px-6 fade-up">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="warn-title"
            aria-describedby="warn-desc"
            className="w-full max-w-[360px] rounded-[28px] bg-[var(--bg-to)]/90 backdrop-blur-xl border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 flex flex-col gap-4 text-white"
          >
            <span className="size-12 rounded-full bg-[#ffd166] text-[#002a4d] flex items-center justify-center">
              <TriangleAlert size={26} />
            </span>
            <h2 id="warn-title" className="text-[22px] font-bold leading-tight">
              Avertissement
            </h2>
            <div
              id="warn-desc"
              className="flex flex-col gap-2 text-[15px] text-white/90 leading-snug"
            >
              <p>
                Cette version est une démo, vous ne pouvez pas y saisir de vraies
                informations.
              </p>
              <p>
                Cette démonstration est disponible sur le web, si vous êtes
                détenteur de Dark Reader ou d'une extension du même style,
                veuillez le désactiver pour éviter des problèmes de 
                couleur, qui peuvent dégrader l'expérienceu 
              </p>
            </div>
            <button autoFocus className={btnPrimary} onClick={onDismiss}>
              J’ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- racine ---------- */
/* ---------- personnalisation ---------- */
type Prefs = {
  theme: number
  accent: number
  scale: number
  startTab: Tab
  nickname: string
  showNews: boolean
  showClassAvg: boolean
  calm: boolean
}
const DEFAULT_PREFS: Prefs = {
  theme: 0,
  accent: 0,
  scale: 1,
  startTab: "home",
  nickname: "",
  showNews: true,
  showClassAvg: true,
  calm: false,
}
const THEMES = [
  { name: "Lagon", from: "#41adcc", to: "#003b6c" },
  { name: "Crépuscule", from: "#8b7ad8", to: "#2a1b5c" },
  { name: "Forêt", from: "#4cb98a", to: "#0b3d3a" },
  { name: "Corail", from: "#f08a7a", to: "#6b1f4a" },
  { name: "Ardoise", from: "#6b8199", to: "#16212e" },
]
const ACCENTS = [
  { name: "Vert", base: "#1db45a", hover: "#25c766", soft: "#2bd16d" },
  { name: "Jaune", base: "#f5b82e", hover: "#ffc94d", soft: "#ffd166" },
  { name: "Rose", base: "#f06292", hover: "#f77fa6", soft: "#ff8fb3" },
  { name: "Orange", base: "#ff8a4c", hover: "#ff9d69", soft: "#ffab7d" },
  { name: "Ciel", base: "#5cc8ff", hover: "#7ad3ff", soft: "#9ad1ff" },
]
const SCALES = [
  { v: 1, label: "Normale" },
  { v: 1.12, label: "Grande" },
  { v: 1.25, label: "Très grande" },
]
const START_TABS: { id: Tab label: string }[] = [
  { id: "home", label: "Accueil" },
  { id: "courses", label: "Cours" },
  { id: "homework", label: "Devoirs" },
  { id: "grades", label: "Notes" },
]

function themeVars(p: Prefs) {
  const t = THEMES[p.theme],
    a = ACCENTS[p.accent]
  return {
    "--bg-from": t.from,
    "--bg-to": t.to,
    "--accent": a.base,
    "--accent-hover": a.hover,
    "--accent-soft": a.soft,
  } as React.CSSProperties
}

function Toggle({
  on,
  onChange,
  label,
  hint,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="w-full flex items-center gap-3 px-4 min-h-[64px] text-left text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:ring-inset"
    >
      <span className="flex-1 min-w-0">
        <span className="block text-[16px] font-semibold">{label}</span>
        <span className="block text-[13px] text-white/75">{hint}</span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full border border-white/25 transition-colors ${
          on ? "bg-[var(--accent)]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${
            on ? "left-[30px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  )
}

function Customize({
  initial,
  first,
  onDone,
  onSkip,
}: {
  initial: Prefs
  first: boolean
  onDone: (p: Prefs) => void
  onSkip: () => void
}) {
  const [p, setP] = useState<Prefs>(initial)
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setP((x) => ({ ...x, [k]: v }))
  const choice = (active: boolean) =>
    `min-h-[44px] rounded-full px-4 text-[14px] font-semibold border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 ${
      active
        ? "bg-white text-[color:var(--bg-to)] border-white"
        : "bg-white/10 text-white border-white/25 hover:bg-white/20"
    }`
  const a = ACCENTS[p.accent],
    t = THEMES[p.theme]

  return (
    <div className="fade-up flex flex-col gap-5" style={themeVars(p)}>
      <header className="flex flex-col gap-2">
        {first && (
          <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[13px] font-semibold text-white">
            <Check size={14} /> ENT connecté
          </span>
        )}
        <h1 className="text-[30px] leading-[1.1] font-semibold text-white">
          Personnalise ton Compagnon
        </h1>
        <p className="text-[15px] text-white/85 leading-snug">
          Choisis l’apparence et ce que tu veux voir en premier. Tu pourras tout
          modifier plus tard dans « Plus ».
        </p>
      </header>

      <section
        aria-label="Aperçu"
        className={`${glass} p-4 flex items-center gap-3`}
      >
        <span
          className="size-12 shrink-0 rounded-full flex items-center justify-center text-[#002a4d]"
          style={{ background: a.base }}
        >
          <Check size={24} strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold text-white truncate">
            Bonjour, {p.nickname.trim() || "toi"}
          </p>
          <p className="text-[13px] text-white/80">
            Thème {t.name} · accent {a.name.toLowerCase()}
          </p>
        </div>
        <span
          className="h-8 w-14 rounded-full border border-white/25"
          style={{ background: `linear-gradient(180deg, ${t.from}, ${t.to})` }}
          aria-hidden
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Thème</SectionTitle>
        <div
          className="grid grid-cols-5 gap-2"
          role="radiogroup"
          aria-label="Thème"
        >
          {THEMES.map((x, i) => (
            <button
              key={x.name}
              role="radio"
              aria-checked={p.theme === i}
              aria-label={x.name}
              onClick={() => set("theme", i)}
              className={`flex flex-col items-center gap-1.5 focus-visible:outline-none`}
            >
              <span
                className={`h-14 w-full rounded-[16px] border-2 transition ${
                  p.theme === i ? "border-white scale-105" : "border-white/25"
                }`}
                style={{
                  background: `linear-gradient(180deg, ${x.from}, ${x.to})`,
                }}
              />
              <span className="text-[11px] font-semibold text-white/90">
                {x.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Couleur d’accent</SectionTitle>
        <div
          className="flex gap-3"
          role="radiogroup"
          aria-label="Couleur d’accent"
        >
          {ACCENTS.map((x, i) => (
            <button
              key={x.name}
              role="radio"
              aria-checked={p.accent === i}
              aria-label={x.name}
              onClick={() => set("accent", i)}
              className={`size-12 rounded-full flex items-center justify-center border-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 ${
                p.accent === i ? "border-white scale-110" : "border-white/30"
              }`}
              style={{ background: x.base }}
            >
              {p.accent === i && (
                <Check size={20} strokeWidth={3} className="text-[#002a4d]" />
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Taille du texte</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SCALES.map((x) => (
            <button
              key={x.v}
              aria-pressed={p.scale === x.v}
              onClick={() => set("scale", x.v)}
              className={choice(p.scale === x.v)}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Page de démarrage</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {START_TABS.map((x) => (
            <button
              key={x.id}
              aria-pressed={p.startTab === x.id}
              onClick={() => set("startTab", x.id)}
              className={choice(p.startTab === x.id)}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Prénom d’affichage</SectionTitle>
        <input
          value={p.nickname}
          onChange={(e) => set("nickname", e.target.value.slice(0, 20))}
          maxLength={20}
          placeholder="Ex. Léa (facultatif)"
          aria-label="Prénom d’affichage"
          className="w-full min-h-[54px] rounded-full bg-white/10 border border-white/25 backdrop-blur-[14px] px-5 text-[16px] text-white placeholder:text-white/60 focus:outline-none focus:ring-4 focus:ring-white/60"
        />
      </section>

      <ul className={`${glass} divide-y divide-white/10 overflow-hidden`}>
        <li>
          <Toggle
            on={p.showNews}
            onChange={(v) => set("showNews", v)}
            label="Dernières nouvelles"
            hint="Afficher les actualités sur l’accueil"
          />
        </li>
        <li>
          <Toggle
            on={p.showClassAvg}
            onChange={(v) => set("showClassAvg", v)}
            label="Moyenne de la classe"
            hint="Comparer les notes à la classe"
          />
        </li>
        <li>
          <Toggle
            on={p.calm}
            onChange={(v) => set("calm", v)}
            label="Mode calme"
            hint="Réduire les animations"
          />
        </li>
      </ul>

      <div className="flex flex-col gap-3">
        <button className={btnPrimary} onClick={() => onDone(p)}>
          {first ? "Continuer" : "Enregistrer"} <ArrowRight size={20} />
        </button>
        <button className={btnGlass} onClick={onSkip}>
          {first ? "Passer" : "Annuler"}
        </button>
      </div>
      <DemoPill>
        Réglages gardés seulement le temps de la session — rien n’est enregistré
      </DemoPill>
      <Footer />
    </div>
  )
}

export default function App() {
  const { progress, ready } = useAssetsLoader()
  const [splashGone, setSplashGone] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    if (!dismissed) return
    const t = window.setTimeout(() => setSplashGone(true), 500)
    return () => window.clearTimeout(t)
  }, [dismissed])
  const [step, setStep] = useState<Step>("welcome")
  const [failure, setFailure] = useState<Failure>(null)
  const [profile, setProfile] = useState<Profile>("student")
  const [ent, setEnt] = useState<Ent | null>(null)
  const [tab, setTab] = useState<Tab>("home")
  const [child, setChild] = useState(0)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [toast, setToast] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step, tab])

  const notify = (m: string) => {
    setToast(m)
    timers.current.push(window.setTimeout(() => setToast(null), 2200))
  }

  const startLogin = (ok: boolean) => {
    const down = ent ? isUnreachable(ent) : false
    setFailure(down ? "unreachable" : ok ? null : "password")
    setStep("loading")
    setTab("home")
    if (ok && !down)
      timers.current.push(window.setTimeout(() => setStep("customize"), 2700))
  }

  const person: Person =
    profile === "parent" ? (child === 0 ? CAMILLE : NOE) : CAMILLE
  const ctx: Ctx | null = ent
    ? {
        profile,
        ent,
        person,
        child,
        setChild,
        done,
        toggle: (id) =>
          setDone((s) => {
            const n = new Set(s)
            n.has(id) ? n.delete(id) : n.add(id)
            return n
          }),
        notify,
        goto: setTab,
        prefs,
        customize: () => {
          setTab("more")
          setStep("customize")
        },
      }
    : null

  const inApp = step === "app" && ctx

  return (
    <div
      data-calm={prefs.calm ? "" : undefined}
      style={themeVars(prefs)}
      className="min-h-[100dvh] bg-gradient-to-b from-[color:var(--bg-from)] to-[color:var(--bg-to)] bg-fixed"
    >
      {!splashGone && (
        <Splash
          progress={progress}
          ready={ready}
          leaving={dismissed}
          onDismiss={() => setDismissed(true)}
        />
      )}
      <main
        style={{ zoom: prefs.scale }}
        className={`mx-auto w-full max-w-[460px] min-h-[100dvh] flex flex-col gap-4 px-5 sm:px-9 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] text-white ${
          inApp ? "pb-32" : "pb-8"
        }`}
      >
        {step === "welcome" && (
          <Welcome
            onPick={(p) => {
              setProfile(p)
              setStep("ent")
            }}
          />
        )}
        {step === "ent" && (
          <EntPicker
            profile={profile}
            onBack={() => setStep("welcome")}
            onPick={(e) => {
              setEnt(e)
              setStep("login")
            }}
          />
        )}
        {step === "login" && ent && (
          <Login
            profile={profile}
            ent={ent}
            onBack={() => setStep("ent")}
            onSubmit={startLogin}
          />
        )}
        {step === "loading" && ent && (
          <Connecting
            ent={ent}
            fail={failure}
            onRetry={() => setStep("login")}
            onChangeEnt={() => setStep("ent")}
          />
        )}
        {step === "customize" && ent && (
          <Customize
            initial={prefs}
            first={tab !== "more"}
            onDone={(p) => {
              setPrefs(p)
              if (tab !== "more") setTab(p.startTab)
              setStep("app")
            }}
            onSkip={() => setStep("app")}
          />
        )}
        {inApp && (
          <div key={tab + child} className="flex flex-col gap-4">
            {tab === "home" && <Home c={ctx} />}
            {tab === "courses" && <Courses c={ctx} />}
            {tab === "homework" && <Homework c={ctx} />}
            {tab === "grades" && <Grades c={ctx} />}
            {tab === "more" && (
              <More
                c={ctx}
                onEnt={() => setStep("ent")}
                onLogout={() => {
                  setStep("welcome")
                  setEnt(null)
                  setDone(new Set())
                  setChild(0)
                }}
              />
            )}
          </div>
        )}
      </main>

      {inApp && (
        <nav
          aria-label="Navigation principale"
          className="fixed bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto max-w-[460px] px-5 pb-4">
            <ul className="flex items-center justify-between gap-1 rounded-full bg-[var(--bg-to)]/70 backdrop-blur-xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-2">
              {TABS.map((t) => (
                <li key={t.id} className="flex-1">
                  <button
                    onClick={() => setTab(t.id)}
                    aria-current={tab === t.id ? "page" : undefined}
                    className={`w-full min-h-[56px] rounded-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 ${
                      tab === t.id
                        ? "bg-white text-[color:var(--bg-to)]"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed z-50 left-1/2 -translate-x-1/2 ${
            inApp ? "bottom-28" : "bottom-6"
          } fade-up rounded-full bg-white text-[color:var(--bg-to)] px-5 py-3 text-[14px] font-semibold shadow-xl max-w-[90vw] text-center`}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
