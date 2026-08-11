"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/button";
import type { CmsBusiness, CmsContent, GallerySocial } from "@/lib/cms/types";
import { autoDescribeMenuItem } from "@/lib/cms/menu-copy";
import { formatPhoneInput } from "@/lib/cms/utils";
import type { OrderRecord } from "@/lib/orders/types";
import type { GalleryItem, MenuItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Tab = "menu" | "pictures" | "info" | "orders";

function blankMenuItem(category: string): MenuItem {
  const name = "New item";
  const copy = autoDescribeMenuItem(name, category);
  return {
    id: `item-${Date.now()}`,
    name,
    category,
    description: copy.description,
    longDescription: copy.longDescription,
    price: 0,
    image: "/images/menu/burgers-los-compadres-burger.jpg",
    featured: false,
  };
}

function blankGalleryItem(): GalleryItem {
  return {
    id: `g-${Date.now()}`,
    alt: "Gallery image",
    image: "/images/truck-gallery.jpg",
  };
}

function ensureCategories(content: CmsContent): CmsContent {
  const categories =
    content.categories?.length > 0
      ? [...content.categories]
      : [...new Set(content.menu.map((item) => item.category))];
  for (const item of content.menu) {
    if (item.category && !categories.includes(item.category)) {
      categories.push(item.category);
    }
  }
  return { ...content, categories };
}

export function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("menu");
  const [content, setContent] = useState<CmsContent | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [ordersRefresh, setOrdersRefresh] = useState(0);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/content", { cache: "no-store" });
      if (res.status === 401 || !res.ok) {
        setAuthed(false);
        return;
      }
      const data = ensureCategories((await res.json()) as CmsContent);
      setContent(data);
      const firstCategory = data.categories[0] ?? null;
      setSelectedCategory(firstCategory);
      setSelectedId(
        data.menu.find((item) => item.category === firstCategory)?.id ?? null,
      );
      setAuthed(true);
    })();
  }, []);

  useEffect(() => {
    if (!authed || tab !== "orders") return;
    void (async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as {
          orders?: OrderRecord[];
          error?: string;
        } | null;
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load orders");
        }
        setOrders(data?.orders ?? []);
      } catch (error) {
        setOrdersError(
          error instanceof Error ? error.message : "Failed to load orders",
        );
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [authed, tab, ordersRefresh]);

  const categoryItems = useMemo(() => {
    if (!content || !selectedCategory) return [];
    return content.menu.filter((item) => item.category === selectedCategory);
  }, [content, selectedCategory]);

  const selectedItem = useMemo(
    () => content?.menu.find((item) => item.id === selectedId) ?? null,
    [content, selectedId],
  );

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password.");
      return;
    }
    const contentRes = await fetch("/api/admin/content", { cache: "no-store" });
    const data = ensureCategories((await contentRes.json()) as CmsContent);
    setContent(data);
    const firstCategory = data.categories[0] ?? null;
    setSelectedCategory(firstCategory);
    setSelectedId(
      data.menu.find((item) => item.category === firstCategory)?.id ?? null,
    );
    setAuthed(true);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setContent(null);
    setPassword("");
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus("");
    try {
      const payload = ensureCategories(content);
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setStatus("Save failed. Are you still logged in?");
        return;
      }
      setContent(payload);
      setStatus("Saved. Site content updated.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      setStatus(err?.error || "Upload failed");
      return null;
    }
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  function updateMenuItem(id: string, patch: Partial<MenuItem>) {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menu: prev.menu.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      };
    });
  }

  function updateGalleryItem(id: string, patch: Partial<GalleryItem>) {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gallery: prev.gallery.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      };
    });
  }

  function updateBusiness(patch: Partial<CmsBusiness>) {
    setContent((prev) => {
      if (!prev) return prev;
      return { ...prev, business: { ...prev.business, ...patch } };
    });
  }

  function addCategory() {
    if (!content) return;
    const name = window.prompt("New category name")?.trim() ?? "";
    if (!name) return;
    if (content.categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setStatus("That category already exists.");
      return;
    }
    setContent({
      ...content,
      categories: [...content.categories, name],
    });
    setSelectedCategory(name);
    setSelectedId(null);
    setStatus(`Category “${name}” added. Add items, then Save.`);
  }

  function renameCategory(category: string, nextName?: string) {
    if (!content) return;
    const trimmed =
      (nextName ?? window.prompt("Rename category", category) ?? "").trim();
    if (!trimmed || trimmed === category) return;
    if (
      content.categories.some(
        (c) => c !== category && c.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setStatus("That category name is already used.");
      return;
    }
    setContent({
      ...content,
      categories: content.categories.map((c) => (c === category ? trimmed : c)),
      menu: content.menu.map((item) =>
        item.category === category ? { ...item, category: trimmed } : item,
      ),
    });
    if (selectedCategory === category) setSelectedCategory(trimmed);
    setStatus(`Category renamed to “${trimmed}”.`);
  }

  function deleteCategory(category: string) {
    if (!content) return;
    const ok = window.confirm(
      `Delete category “${category}” and all of its menu items?`,
    );
    if (!ok) return;
    const menu = content.menu.filter((item) => item.category !== category);
    const categories = content.categories.filter((c) => c !== category);
    const nextCategory =
      selectedCategory === category
        ? (categories[0] ?? null)
        : selectedCategory;
    setContent({ ...content, categories, menu });
    setSelectedCategory(nextCategory);
    setSelectedId(
      menu.find((item) => item.category === nextCategory)?.id ?? null,
    );
  }

  if (authed === null) {
    return (
      <div className="flex min-h-full items-center justify-center p-6 text-muted">
        Loading admin…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-xl border border-border-dark bg-surface-dark p-6"
        >
          <p className="text-sm font-semibold tracking-[0.2em] text-green uppercase">
            Los Compadres
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-wide uppercase">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to update menu items, photos, and business info.
          </p>
          <label className="mt-6 block text-sm text-muted" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full min-h-11 rounded-md border border-border-dark bg-background px-4 text-white outline-none focus:border-yellow"
            autoComplete="current-password"
            required
          />
          {loginError && (
            <p className="mt-2 text-sm text-red" role="alert">
              {loginError}
            </p>
          )}
          <Button type="submit" className="mt-4 w-full">
            Enter dashboard
          </Button>
          <p className="mt-4 text-center text-xs text-muted">
            Default password: <code className="text-gold">compadres</code>
          </p>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-muted hover:text-white"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex h-full w-[148px] shrink-0 flex-col border-r border-white/10 bg-[#0a0707]">
        <div className="flex h-14 items-center px-4 border-b border-white/10">
          <span className="text-xs font-bold tracking-[0.16em] text-yellow uppercase">
            Admin
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2.5" aria-label="Admin">
          {(
            [
              ["menu", "Menu", Utensils],
              ["pictures", "Photos", ImagePlus],
              ["info", "Info", LayoutDashboard],
              ["orders", "Orders", ClipboardList],
            ] as const
          ).map(([id, label, Icon]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition",
                  active
                    ? "bg-yellow text-white"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase hover:bg-white/5 hover:text-white"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#100b0b]/95 px-4 backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-wide text-white uppercase">
              {tab === "menu"
                ? "Menu manager"
                : tab === "pictures"
                  ? "Photo gallery"
                  : tab === "orders"
                    ? "Orders & payments"
                    : "Business info"}
            </h1>
            <p className="truncate text-xs text-muted">
              {tab === "menu"
                ? "Categories → items → edit → save"
                : tab === "pictures"
                  ? "Update homepage gallery images"
                  : tab === "orders"
                    ? "Recent checkouts saved to Supabase"
                    : "Contact details and footer copy"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {status && (
              <span className="hidden rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold sm:inline">
                {status}
              </span>
            )}
            {tab !== "orders" ? (
              <Button
                type="button"
                onClick={() => void save()}
                loading={saving}
                leftIcon={<Save className="h-4 w-4" aria-hidden />}
                className="min-h-9 px-3 text-xs"
              >
                Save
              </Button>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "menu" && (
            <div className="grid min-h-[calc(100dvh-7rem)] gap-4 xl:grid-cols-[240px_260px_minmax(0,1fr)]">
              {/* Categories */}
              <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                      Step 1
                    </p>
                    <h2 className="text-sm font-semibold text-white">
                      Categories
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-green px-3 text-[11px] font-semibold text-white uppercase hover:bg-green-hover"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add
                  </button>
                </div>
                <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                  {content.categories.map((category) => {
                    const count = content.menu.filter(
                      (item) => item.category === category,
                    ).length;
                    const active = selectedCategory === category;
                    return (
                      <li key={category}>
                        <div
                          className={cn(
                            "group flex items-center gap-1 rounded-xl border transition",
                            active
                              ? "border-yellow/40 bg-yellow/10"
                              : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category);
                              setSelectedId(
                                content.menu.find(
                                  (item) => item.category === category,
                                )?.id ?? null,
                              );
                            }}
                            className="min-w-0 flex-1 px-3 py-2.5 text-left"
                          >
                            <span
                              className={cn(
                                "block truncate text-sm font-medium",
                                active ? "text-white" : "text-white/85",
                              )}
                            >
                              {category}
                            </span>
                            <span className="text-[11px] text-muted">
                              {count} {count === 1 ? "item" : "items"}
                            </span>
                          </button>
                          <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-70 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => renameCategory(category)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-gold"
                              aria-label={`Edit ${category}`}
                              title="Edit category"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCategory(category)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red/15 hover:text-red"
                              aria-label={`Delete ${category}`}
                              title="Delete category"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Items */}
              <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                      Step 2
                    </p>
                    <h2 className="text-sm font-semibold text-white">
                      {selectedCategory ? selectedCategory : "Items"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedCategory}
                    onClick={() => {
                      if (!selectedCategory) return;
                      const item = blankMenuItem(selectedCategory);
                      setContent((prev) =>
                        prev ? { ...prev, menu: [item, ...prev.menu] } : prev,
                      );
                      setSelectedId(item.id);
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-green px-3 text-[11px] font-semibold text-white uppercase hover:bg-green-hover disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add
                  </button>
                </div>
                {!selectedCategory ? (
                  <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">
                    Select a category to view its menu list.
                  </div>
                ) : categoryItems.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-sm text-muted">
                      No items in {selectedCategory} yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const item = blankMenuItem(selectedCategory);
                        setContent((prev) =>
                          prev ? { ...prev, menu: [item, ...prev.menu] } : prev,
                        );
                        setSelectedId(item.id);
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-4 text-xs font-semibold text-white uppercase hover:bg-white/5"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add first item
                    </button>
                  </div>
                ) : (
                  <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                    {categoryItems.map((item) => {
                      const active = selectedId === item.id;
                      return (
                        <li key={item.id}>
                          <div
                            className={cn(
                              "group flex items-center gap-1 rounded-xl border transition",
                              active
                                ? "border-yellow/40 bg-yellow/10"
                                : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedId(item.id)}
                              className="min-w-0 flex-1 px-3 py-2.5 text-left"
                            >
                              <span
                                className={cn(
                                  "block truncate text-sm font-medium",
                                  active ? "text-white" : "text-white/85",
                                )}
                              >
                                {item.name}
                              </span>
                              <span className="text-[11px] text-muted">
                                ${item.price}
                                {item.featured ? " · Featured" : ""}
                              </span>
                            </button>
                            <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-70 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => setSelectedId(item.id)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-gold"
                                aria-label={`Edit ${item.name}`}
                                title="Edit item"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setContent((prev) => {
                                    if (!prev) return prev;
                                    const menu = prev.menu.filter(
                                      (entry) => entry.id !== item.id,
                                    );
                                    if (selectedId === item.id) {
                                      setSelectedId(
                                        menu.find(
                                          (entry) =>
                                            entry.category === selectedCategory,
                                        )?.id ?? null,
                                      );
                                    }
                                    return { ...prev, menu };
                                  });
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red/15 hover:text-red"
                                aria-label={`Delete ${item.name}`}
                                title="Delete item"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Editor */}
              {selectedCategory && !selectedItem ? (
                <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d] p-5 sm:p-6">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                    Step 3
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {selectedCategory}
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    Pick an item from the middle list to edit it, or add a new
                    one. You can also rename this category below.
                  </p>
                  <div className="mt-6 max-w-md space-y-4">
                    <Field label="Category name">
                      <input
                        defaultValue={selectedCategory}
                        key={selectedCategory}
                        onBlur={(e) =>
                          renameCategory(selectedCategory, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            renameCategory(
                              selectedCategory,
                              (e.target as HTMLInputElement).value,
                            );
                          }
                        }}
                        className={fieldClass}
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => deleteCategory(selectedCategory)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-red/30 px-3 text-sm text-red hover:bg-red hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete category
                    </button>
                  </div>
                </section>
              ) : selectedItem ? (
                <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d] p-5 sm:p-6">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.16em] text-green uppercase">
                        Step 3 · {selectedItem.category}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-white">
                        Edit item
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setContent((prev) => {
                          if (!prev) return prev;
                          const menu = prev.menu.filter(
                            (item) => item.id !== selectedItem.id,
                          );
                          const nextInCategory = menu.find(
                            (item) => item.category === selectedCategory,
                          );
                          setSelectedId(nextInCategory?.id ?? null);
                          return { ...prev, menu };
                        });
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red/30 px-3 text-sm text-red hover:bg-red hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete
                    </button>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1fr_200px]">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Name">
                          <input
                            value={selectedItem.name}
                            onChange={(e) =>
                              updateMenuItem(selectedItem.id, {
                                name: e.target.value,
                              })
                            }
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Price">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={selectedItem.price}
                            onChange={(e) =>
                              updateMenuItem(selectedItem.id, {
                                price: Number(e.target.value) || 0,
                              })
                            }
                            className={fieldClass}
                          />
                        </Field>
                        <Field label="Category">
                          <select
                            value={selectedItem.category}
                            onChange={(e) => {
                              const category = e.target.value;
                              updateMenuItem(selectedItem.id, { category });
                              setSelectedCategory(category);
                            }}
                            className={`${fieldClass} appearance-none bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-10`}
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23d0c0b0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                            }}
                          >
                            {content.categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Slug / ID">
                          <input
                            value={selectedItem.id}
                            onChange={(e) => {
                              const nextId = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-");
                              updateMenuItem(selectedItem.id, { id: nextId });
                              setSelectedId(nextId);
                            }}
                            className={fieldClass}
                          />
                        </Field>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium tracking-wide text-muted uppercase">
                            Description
                          </span>
                          <button
                            type="button"
                            className="text-[11px] font-semibold tracking-wide text-gold uppercase hover:text-white"
                            onClick={() => {
                              const copy = autoDescribeMenuItem(
                                selectedItem.name,
                                selectedItem.category,
                              );
                              updateMenuItem(selectedItem.id, {
                                description: copy.description,
                                longDescription: copy.longDescription,
                              });
                            }}
                          >
                            Auto-generate
                          </button>
                        </div>
                        <textarea
                          value={selectedItem.description}
                          onChange={(e) =>
                            updateMenuItem(selectedItem.id, {
                              description: e.target.value,
                              longDescription: e.target.value,
                            })
                          }
                          rows={3}
                          className={fieldClass}
                        />
                      </div>

                      <label className="flex items-center gap-2 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={!!selectedItem.featured}
                          onChange={(e) =>
                            updateMenuItem(selectedItem.id, {
                              featured: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-white/20"
                        />
                        Featured on homepage
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        <Image
                          src={selectedItem.image}
                          alt={selectedItem.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                          unoptimized={selectedItem.image.startsWith(
                            "/uploads/",
                          )}
                        />
                      </div>
                      <label className="inline-flex w-full min-h-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold tracking-wide text-white uppercase hover:bg-white/10">
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadImage(file);
                            if (url) {
                              updateMenuItem(selectedItem.id, { image: url });
                              setStatus("Image uploaded.");
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="flex items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Start with a category
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Choose one on the left, then build its menu list.
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === "pictures" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Gallery
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setContent((prev) =>
                      prev
                        ? {
                            ...prev,
                            gallery: [blankGalleryItem(), ...prev.gallery],
                          }
                        : prev,
                    )
                  }
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-green/90 px-3 text-xs font-semibold text-white uppercase hover:bg-green"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add photo
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {content.gallery.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-surface-dark/80 p-3"
                  >
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg border border-border-dark">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        className="object-cover"
                        sizes="320px"
                        unoptimized={item.image.startsWith("/uploads/")}
                      />
                    </div>
                    <Field label="Alt text">
                      <input
                        value={item.alt}
                        onChange={(e) =>
                          updateGalleryItem(item.id, { alt: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </Field>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                      <input
                        value={item.image}
                        onChange={(e) =>
                          updateGalleryItem(item.id, { image: e.target.value })
                        }
                        className={fieldClass}
                      />
                      <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-border-dark bg-background px-3 text-sm font-semibold uppercase tracking-wide text-muted hover:text-white">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadImage(file);
                            if (url) {
                              updateGalleryItem(item.id, { image: url });
                              setStatus("Image uploaded.");
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  gallery: prev.gallery.filter(
                                    (g) => g.id !== item.id,
                                  ),
                                }
                              : prev,
                          )
                        }
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-red/40 px-3 text-red hover:bg-red hover:text-white"
                        aria-label="Delete gallery image"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "info" && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-surface-dark/80 p-4 sm:p-6">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Business info
              </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Business name">
                    <input
                      value={content.business.name}
                      onChange={(e) =>
                        updateBusiness({ name: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Short name">
                    <input
                      value={content.business.shortName}
                      onChange={(e) =>
                        updateBusiness({ shortName: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={content.business.phone}
                      onChange={(e) =>
                        updateBusiness({
                          phone: formatPhoneInput(e.target.value),
                        })
                      }
                      className={fieldClass}
                      placeholder="(718) 555-0142"
                      maxLength={14}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={content.business.email}
                      onChange={(e) =>
                        updateBusiness({ email: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Cuisine">
                    <input
                      value={content.business.cuisine}
                      onChange={(e) =>
                        updateBusiness({ cuisine: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Price range">
                    <select
                      value={
                        ["$", "$$", "$$$", "$$$$"].includes(
                          content.business.priceRange,
                        )
                          ? content.business.priceRange
                          : "$$"
                      }
                      onChange={(e) =>
                        updateBusiness({ priceRange: e.target.value })
                      }
                      className={fieldClass}
                    >
                      <option value="$">$ · inexpensive</option>
                      <option value="$$">$$ · moderate</option>
                      <option value="$$$">$$$ · pricey</option>
                      <option value="$$$$">$$$$ · fine dining</option>
                    </select>
                  </Field>
                </div>
                <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                    Address
                  </h3>
                  <Field label="Street address">
                    <input
                      value={content.business.streetAddress}
                      onChange={(e) =>
                        updateBusiness({ streetAddress: e.target.value })
                      }
                      className={fieldClass}
                      placeholder="37th Ave & 82nd St"
                      autoComplete="street-address"
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <Field label="City">
                        <input
                          value={content.business.city}
                          onChange={(e) =>
                            updateBusiness({ city: e.target.value })
                          }
                          className={fieldClass}
                          placeholder="Elmhurst"
                          autoComplete="address-level2"
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-1">
                      <Field label="State">
                        <input
                          value={content.business.state}
                          onChange={(e) =>
                            updateBusiness({ state: e.target.value })
                          }
                          className={fieldClass}
                          placeholder="NY"
                          autoComplete="address-level1"
                          maxLength={2}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="ZIP">
                        <input
                          value={content.business.zip}
                          onChange={(e) =>
                            updateBusiness({ zip: e.target.value })
                          }
                          className={fieldClass}
                          placeholder="11372"
                          autoComplete="postal-code"
                          inputMode="numeric"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
                <Field label="Footer blurb">
                  <textarea
                    value={content.business.footerBlurb}
                    onChange={(e) =>
                      updateBusiness({ footerBlurb: e.target.value })
                    }
                    rows={3}
                    className={fieldClass}
                  />
                </Field>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                      Social media
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Check Show to display a network sitewide. Use Gallery to
                      pick which profile powers the Follow the Flavor section.
                    </p>
                  </div>
                  <div className="mb-3">
                    <Field label="Gallery handle">
                      <input
                        value={content.business.handle}
                        onChange={(e) =>
                          updateBusiness({ handle: e.target.value })
                        }
                        className={fieldClass}
                        placeholder="@YOURHANDLE"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-1">
                    {(
                      [
                        ["instagram", "showInstagram", "Instagram"],
                        ["facebook", "showFacebook", "Facebook"],
                        ["tiktok", "showTikTok", "TikTok"],
                      ] as const
                    ).map(([key, showKey, label]) => {
                      const isGalleryDefault =
                        content.business.gallerySocial === key;
                      return (
                        <div
                          key={key}
                          className="flex flex-wrap items-end gap-3"
                        >
                          <label className="mb-2 flex shrink-0 cursor-pointer items-center gap-2 pb-2 text-xs text-muted">
                            <input
                              type="checkbox"
                              checked={content.business[showKey]}
                              onChange={(e) =>
                                updateBusiness({ [showKey]: e.target.checked })
                              }
                              className="h-4 w-4 accent-green"
                            />
                            <span className="whitespace-nowrap">Show</span>
                          </label>
                          <div className="min-w-0 flex-1 basis-[12rem]">
                            <Field label={label}>
                              <input
                                type="url"
                                value={content.business[key]}
                                onChange={(e) =>
                                  updateBusiness({ [key]: e.target.value })
                                }
                                className={fieldClass}
                                placeholder={`https://${key}.com/...`}
                              />
                            </Field>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const patch: Partial<CmsBusiness> = {
                                gallerySocial: key as GallerySocial,
                              };
                              if (key === "instagram") {
                                patch.showInstagram = true;
                              } else if (key === "facebook") {
                                patch.showFacebook = true;
                              } else {
                                patch.showTikTok = true;
                              }
                              updateBusiness(patch);
                            }}
                            className={cn(
                              "mb-2 inline-flex min-h-11 shrink-0 items-center rounded-md border px-3 text-xs font-semibold uppercase tracking-wide transition",
                              isGalleryDefault
                                ? "border-green bg-green/20 text-white"
                                : "border-white/15 text-muted hover:border-white/30 hover:text-white",
                            )}
                            aria-pressed={isGalleryDefault}
                          >
                            {isGalleryDefault ? "Gallery default" : "Use for gallery"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                        Homepage gallery
                      </h3>
                      <p className="mt-1 text-xs text-muted">
                        Photos shown in the Follow the Flavor section.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab("pictures")}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs font-semibold text-white uppercase hover:bg-white/10"
                    >
                      <ImagePlus className="h-4 w-4" aria-hidden />
                      Open full editor
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.gallery.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-white/10 bg-black/30 p-3"
                      >
                        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg border border-border-dark">
                          <Image
                            src={item.image}
                            alt={item.alt}
                            fill
                            className="object-cover"
                            sizes="280px"
                            unoptimized={item.image.startsWith("/uploads/")}
                          />
                        </div>
                        <Field label="Alt text">
                          <input
                            value={item.alt}
                            onChange={(e) =>
                              updateGalleryItem(item.id, {
                                alt: e.target.value,
                              })
                            }
                            className={fieldClass}
                          />
                        </Field>
                        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                          <input
                            value={item.image}
                            onChange={(e) =>
                              updateGalleryItem(item.id, {
                                image: e.target.value,
                              })
                            }
                            className={fieldClass}
                          />
                          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-border-dark bg-background px-3 text-sm font-semibold uppercase tracking-wide text-muted hover:text-white">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await uploadImage(file);
                                if (url) {
                                  updateGalleryItem(item.id, { image: url });
                                  setStatus("Image uploaded.");
                                }
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setContent((prev) =>
                        prev
                          ? {
                              ...prev,
                              gallery: [blankGalleryItem(), ...prev.gallery],
                            }
                          : prev,
                      )
                    }
                    className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-md bg-green/90 px-3 text-xs font-semibold text-white uppercase hover:bg-green"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Add photo
                  </button>
                </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-surface-dark/80 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Recent orders
                </h2>
                <Button
                  type="button"
                  variant="outline-light"
                  className="min-h-9 px-3 text-xs"
                  loading={ordersLoading}
                  onClick={() => setOrdersRefresh((n) => n + 1)}
                >
                  Refresh
                </Button>
              </div>
              {ordersError ? (
                <p className="text-sm text-red-400" role="alert">
                  {ordersError}
                </p>
              ) : null}
              {ordersLoading && !orders.length ? (
                <p className="text-sm text-muted">Loading orders…</p>
              ) : null}
              {!ordersLoading && !ordersError && orders.length === 0 ? (
                <p className="text-sm text-muted">
                  No orders yet. Complete a checkout to see it here.
                </p>
              ) : null}
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{order.id}</p>
                        <p className="mt-1 text-xs text-muted">
                          {order.customerName} · {order.email}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {new Date(order.createdAt).toLocaleString()} ·{" "}
                          {order.paymentProvider} · {order.paymentStatus}
                          {order.cardLast4 ? ` · •••• ${order.cardLast4}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-yellow">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-muted">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3">
                          <span>
                            {item.quantity}× {item.name}
                          </span>
                          <span className="text-white">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-white outline-none transition focus:border-yellow/60";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium tracking-wide text-muted uppercase">
      {label}
      {children}
    </label>
  );
}
