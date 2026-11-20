"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navigation = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLink({ item, active = false, onClick, wide = false }: { item: (typeof navigation)[number]; active?: boolean; onClick: () => void; wide?: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`relative inline-flex min-h-11 ${wide ? "w-auto rounded-none px-2.5" : "w-full rounded-lg px-3"} items-center whitespace-nowrap text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy ${
        active
          ? "font-semibold text-ceda-burgundy after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-full after:bg-ceda-burgundy"
          : `text-slate-700 hover:bg-surface-muted hover:text-ceda-burgundy ${wide ? "hover:bg-transparent" : ""}`
      }`}
    >
      {item.label}
    </Link>
  );
}

function ActiveNavigationLink({ item, onClick, wide }: { item: (typeof navigation)[number]; onClick: () => void; wide: boolean }) {
  const pathname = usePathname();
  return <NavigationLink item={item} active={isCurrentPath(pathname, item.href)} onClick={onClick} wide={wide} />;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const links = session?.user ? [...navigation.slice(0, 1), { label: "Dashboard", href: "/dashboard" }, ...navigation.slice(1)] : navigation;

  useEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;
    const update = () => {
      const available = row.clientWidth;
      const needed = measure.scrollWidth;
      const nextWide = needed <= available;
      setWide((current) => current === nextWide ? current : nextWide);
      if (nextWide) setMobileMenuOpen(false);
    };
    const observer = new ResizeObserver(update);
    observer.observe(row);
    observer.observe(measure);
    update();
    return () => observer.disconnect();
  }, [session?.user, links.length]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  async function signOut() {
    await authClient.signOut();
    setMobileMenuOpen(false);
    router.refresh();
  }

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: PointerEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setProfileOpen(false); profileRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); } };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div ref={rowRef} className="relative mx-auto flex min-h-[68px] max-w-[1380px] items-center justify-between gap-2 px-3 sm:min-h-[76px] sm:gap-5 sm:px-6 lg:px-8">
        <div ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute flex w-max items-center gap-5 whitespace-nowrap">
          <span className="w-36" />
          <div className="flex items-center gap-1">{links.map((item) => <span key={item.href} className="px-2.5 text-sm">{item.label}</span>)}</div>
          {session?.user ? <span className="flex items-center gap-2.5 px-1.5"><span className="h-9 w-9 rounded-full" />{session.user.name || session.user.email || "Profile"}<span className="h-4 w-4" /></span> : <span className="px-6">Sign In&nbsp;&nbsp;&nbsp;Register</span>}
        </div>
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ceda-burgundy"
          aria-label="CEDA Innovation Portal home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="relative block h-12 w-32 sm:w-36">
            <Image
              src="/assets/ceda logo.png"
              alt="CEDA — Citizen Entrepreneurial Development Agency"
              fill
              sizes="(max-width: 640px) 128px, 144px"
              className="object-contain object-left"
              priority
            />
          </span>
        </Link>

        <nav aria-label="Primary" className="relative flex items-center">
          {!wide && <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ceda-ink hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy"
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation-links"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>}

          <ul
            id="primary-navigation-links"
            className={wide ? "flex items-center gap-1" : `${mobileMenuOpen ? "fixed inset-x-3 top-[68px] z-50 grid max-h-[calc(100dvh-6rem)] gap-1 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:inset-x-auto sm:right-6 sm:top-[76px] sm:w-[min(90vw,22rem)]" : "hidden"}`}
          >
            {links.map((item) => {
              const closeMenu = () => setMobileMenuOpen(false);

              return (
                <li key={item.href}>
                  <Suspense fallback={<NavigationLink item={item} onClick={closeMenu} wide={wide} />}>
                    <ActiveNavigationLink item={item} onClick={closeMenu} wide={wide} />
                  </Suspense>
                </li>
              );
            })}
            {!session?.user && !wide && <li className="mt-2 border-t border-slate-100 pt-2">
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-700 hover:bg-surface-muted">Sign In</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="mt-1 flex min-h-11 items-center justify-center rounded-full bg-ceda-burgundy px-5 text-sm font-semibold text-white hover:bg-[#60170E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Register</Link>
              </>
            </li>}
            {session?.user && !wide && <li className="mt-2 border-t border-slate-100 pt-2">
              <div className="px-3 py-2"><p className="truncate text-sm font-semibold text-ceda-ink">{session.user.name || "Portal account"}</p><p className="truncate text-xs text-ceda-muted">{session.user.email}</p></div>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-700 hover:bg-surface-muted"><UserRound aria-hidden="true" className="h-4 w-4 text-slate-400" />My profile</Link>
              <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-700 hover:bg-surface-muted"><Bell aria-hidden="true" className="h-4 w-4 text-slate-400" />Notifications</Link>
              <Link href="/account/settings" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-700 hover:bg-surface-muted"><Settings aria-hidden="true" className="h-4 w-4 text-slate-400" />Account settings</Link>
              <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-ceda-burgundy hover:bg-[#FFF9F4]"><LogOut aria-hidden="true" className="h-4 w-4" />Log out</button>
            </li>}
          </ul>
        </nav>

        <div className={`flex shrink-0 items-center gap-2 ${wide ? "" : "hidden"}`}>
          {session?.user ? <div ref={profileRef} className="relative">
            <button type="button" aria-expanded={profileOpen} aria-controls="account-profile-panel" onClick={() => setProfileOpen((open) => !open)} className="flex min-h-11 items-center gap-2 rounded-full px-1.5 py-1 text-sm text-slate-700 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy sm:gap-2.5 sm:pl-2">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-ceda-burgundy text-xs font-bold text-white">{(session.user.name || session.user.email || "U").trim().split(/[\s@]+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
              <span className="hidden max-w-28 truncate sm:inline">{session.user.name || "Profile"}</span><ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400" />
            </button>
            {profileOpen && <div id="account-profile-panel" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setProfileOpen(false); }} className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-semibold text-ceda-ink">{session.user.name || "Portal account"}</p><p className="mt-1 truncate text-xs text-ceda-muted">{session.user.email}</p></div>
              <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-700 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ceda-burgundy"><UserRound aria-hidden="true" className="h-4 w-4 text-slate-400" />My profile</Link>
              <Link href="/notifications" onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-700 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ceda-burgundy"><Bell aria-hidden="true" className="h-4 w-4 text-slate-400" />Notifications</Link>
              <Link href="/account/settings" onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-700 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-ceda-burgundy"><Settings aria-hidden="true" className="h-4 w-4 text-slate-400" />Account settings</Link>
              <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-ceda-burgundy hover:bg-[#FFF9F4] focus-visible:outline-2 focus-visible:outline-ceda-burgundy"><LogOut aria-hidden="true" className="h-4 w-4" />Log out</button>
            </div>}
          </div> : <div className="flex items-center gap-4">
            <Link href="/login" className="rounded px-2 py-2 text-sm text-slate-700 hover:text-ceda-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Sign In</Link>
            <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-ceda-burgundy px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#60170E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Register</Link>
          </div>}
        </div>
      </div>
    </header>
  );
}
