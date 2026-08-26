"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  ImagePlus,
  LogOut,
  Mail,
  MapPin,
  Move,
  Pencil,
  Phone,
  Plus,
  Save,
  Settings,
  Trash2,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/button";
import { MenuCard } from "@/components/menu-card";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/social-icons";
import type { CmsBusiness, CmsContent } from "@/lib/cms/types";
import { autoDescribeMenuItem } from "@/lib/cms/menu-copy";
import {
  categorySectionId,
  formatBusinessAddress,
  formatPhoneInput,
  instagramHandleFromUrl,
} from "@/lib/cms/utils";
import type { OrderRecord } from "@/lib/orders/types";
import {
  MESSAGE_DEPARTMENTS,
  type MessageDepartment,
  type SiteMessageRecord,
} from "@/lib/messages/types";
import type { GalleryItem, MenuItem } from "@/lib/types";
import { cn, formatCurrency, menuImageObjectPosition } from "@/lib/utils";

type Tab = "menu" | "pictures" | "settings" | "orders" | "messages";

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
    image: "",
    featured: false,
    available: true,
    imageFocus: { x: 50, y: 50 },
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
  const [messages, setMessages] = useState<SiteMessageRecord[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [messagesRefresh, setMessagesRefresh] = useState(0);
  const [messageDepartment, setMessageDepartment] = useState<
    MessageDepartment | "all"
  >("all");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [describeOpen, setDescribeOpen] = useState(false);
  const [describeNotes, setDescribeNotes] = useState("");
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [previewMenu, setPreviewMenu] = useState(false);

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

  useEffect(() => {
    if (!authed || tab !== "messages") return;
    void (async () => {
      setMessagesLoading(true);
      setMessagesError("");
      try {
        const res = await fetch("/api/admin/messages", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as {
          messages?: SiteMessageRecord[];
          error?: string;
        } | null;
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load messages");
        }
        setMessages(data?.messages ?? []);
      } catch (error) {
        setMessagesError(
          error instanceof Error ? error.message : "Failed to load messages",
        );
      } finally {
        setMessagesLoading(false);
      }
    })();
  }, [authed, tab, messagesRefresh]);

  const categoryItems = useMemo(() => {
    if (!content || !selectedCategory) return [];
    return content.menu.filter((item) => item.category === selectedCategory);
  }, [content, selectedCategory]);

  const selectedItem = useMemo(
    () => content?.menu.find((item) => item.id === selectedId) ?? null,
    [content, selectedId],
  );

  const previewSections = useMemo(() => {
    if (!content) return [];
    const hidden = new Set(content.hiddenCategories ?? []);
    return content.categories
      .filter((category) => !hidden.has(category))
      .map((category) => ({
        category,
        items: content.menu.filter(
          (item) =>
            item.category === category && item.available !== false,
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [content]);

  const filteredMessages = useMemo(() => {
    if (messageDepartment === "all") return messages;
    return messages.filter((m) => m.department === messageDepartment);
  }, [messages, messageDepartment]);

  const messageCounts = useMemo(() => {
    const counts: Record<MessageDepartment | "all", number> = {
      all: messages.length,
      contact: 0,
      catering: 0,
      newsletter: 0,
    };
    for (const message of messages) {
      counts[message.department] += 1;
    }
    return counts;
  }, [messages]);

  async function setMessageStatus(
    id: string,
    status: SiteMessageRecord["status"],
  ) {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json().catch(() => null)) as {
        message?: SiteMessageRecord;
        error?: string;
      } | null;
      if (!res.ok || !data?.message) {
        throw new Error(data?.error || "Failed to update message");
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? data.message! : m)),
      );
    } catch (error) {
      setMessagesError(
        error instanceof Error ? error.message : "Failed to update message",
      );
    }
  }

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
    setAddingCategory(true);
    setNewCategoryName("");
    setRenamingCategory(null);
    setDeletingCategory(null);
  }

  function submitNewCategory() {
    if (!content) return;
    const name = newCategoryName.trim();
    if (!name) {
      setStatus("Enter a category name.");
      return;
    }
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
    setAddingCategory(false);
    setNewCategoryName("");
    setStatus(`Category “${name}” added. Add items, then Save.`);
  }

  function renameCategory(category: string, nextName?: string) {
    if (nextName !== undefined) {
      if (!content) return;
      const trimmed = nextName.trim();
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
        categories: content.categories.map((c) =>
          c === category ? trimmed : c,
        ),
        hiddenCategories: (content.hiddenCategories ?? []).map((c) =>
          c === category ? trimmed : c,
        ),
        menu: content.menu.map((item) =>
          item.category === category ? { ...item, category: trimmed } : item,
        ),
      });
      if (selectedCategory === category) setSelectedCategory(trimmed);
      setStatus(`Category renamed to “${trimmed}”.`);
      return;
    }
    setRenamingCategory(category);
    setRenameValue(category);
    setAddingCategory(false);
    setDeletingCategory(null);
  }

  function submitRenameCategory() {
    if (!content || !renamingCategory) return;
    const trimmed = renameValue.trim();
    const category = renamingCategory;
    if (!trimmed || trimmed === category) {
      setRenamingCategory(null);
      return;
    }
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
      hiddenCategories: (content.hiddenCategories ?? []).map((c) =>
        c === category ? trimmed : c,
      ),
      menu: content.menu.map((item) =>
        item.category === category ? { ...item, category: trimmed } : item,
      ),
    });
    if (selectedCategory === category) setSelectedCategory(trimmed);
    setRenamingCategory(null);
    setStatus(`Category renamed to “${trimmed}”.`);
  }

  function deleteCategory(category: string) {
    setDeletingCategory(category);
    setAddingCategory(false);
    setRenamingCategory(null);
  }

  function toggleCategoryVisibility(category: string, available: boolean) {
    setContent((prev) => {
      if (!prev) return prev;
      const hidden = new Set(prev.hiddenCategories ?? []);
      if (available) hidden.delete(category);
      else hidden.add(category);
      return { ...prev, hiddenCategories: [...hidden] };
    });
  }

  function confirmDeleteCategory() {
    if (!content || !deletingCategory) return;
    const category = deletingCategory;
    const menu = content.menu.filter((item) => item.category !== category);
    const categories = content.categories.filter((c) => c !== category);
    const hiddenCategories = (content.hiddenCategories ?? []).filter(
      (c) => c !== category,
    );
    const nextCategory =
      selectedCategory === category
        ? (categories[0] ?? null)
        : selectedCategory;
    setContent({ ...content, categories, hiddenCategories, menu });
    setSelectedCategory(nextCategory);
    setSelectedId(
      menu.find((item) => item.category === nextCategory)?.id ?? null,
    );
    setDeletingCategory(null);
    setStatus(`Category “${category}” deleted. Save to apply.`);
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

  if (previewMenu) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background text-white">
        <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border-dark bg-[#100b0b] px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setPreviewMenu(false)}
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-white/15 px-3 text-xs font-semibold tracking-wide text-white uppercase transition hover:border-yellow/40 hover:text-yellow"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to admin
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold tracking-wide text-white uppercase">
              Menu preview
            </p>
            <p className="truncate text-[11px] text-muted">
              Draft view · not published until you Save
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void save()}
            loading={saving}
            leftIcon={<Save className="h-4 w-4" aria-hidden />}
            className="min-h-9 px-3 text-xs"
          >
            Save
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b border-border-dark bg-surface-dark py-8">
            <div className="container-site">
              <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
                Our Menu
              </p>
              <h1 className="mt-2 font-brush text-fluid-section text-white">
                Full menu
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Preview of what customers see with your current draft (hidden
                items and categories stay off).
              </p>
            </div>
          </div>

          <div className="container-site space-y-12 py-10 pb-16">
            {previewSections.length === 0 ? (
              <p className="text-muted">No visible menu items in this draft.</p>
            ) : (
              previewSections.map(({ category, items }) => (
                <section
                  key={category}
                  id={categorySectionId(category)}
                  className="scroll-mt-24"
                >
                  <h2 className="mb-5 border-b border-border-dark pb-3 font-display text-3xl tracking-wide text-yellow uppercase">
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:hidden">
                    {items.map((item) => (
                      <div key={item.id} className="min-w-0">
                        <MenuCard item={item} compact />
                      </div>
                    ))}
                  </div>
                  <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex h-full w-[200px] shrink-0 flex-col border-r border-white/10 bg-[#0a0707]">
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
              ["settings", "Settings", Settings],
              ["orders", "Orders", ClipboardList],
              ["messages", "Messages", Mail],
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
                    : tab === "messages"
                      ? "Messages"
                      : "Settings"}
            </h1>
            <p className="truncate text-xs text-muted">
              {tab === "menu"
                ? "Categories → items → edit → save"
                : tab === "pictures"
                  ? "Fallback images if Instagram feed is not connected"
                  : tab === "orders"
                    ? "Recent checkouts saved to Supabase"
                    : tab === "messages"
                      ? "Contact, catering, and newsletter inquiries"
                      : "Footer contact, socials, and business details"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {status && (
              <span className="hidden rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] text-gold sm:inline">
                {status}
              </span>
            )}
            {tab !== "orders" && tab !== "messages" ? (
              <>
                <Button
                  type="button"
                  variant="outline-light"
                  onClick={() => setPreviewMenu(true)}
                  leftIcon={<Eye className="h-3 w-3" aria-hidden />}
                  className="!min-h-7 !gap-1.5 !rounded-md !px-2 !py-1 !text-[10px]"
                >
                  Preview menu
                </Button>
                <Button
                  type="button"
                  onClick={() => void save()}
                  loading={saving}
                  leftIcon={<Save className="h-3 w-3" aria-hidden />}
                  className="!min-h-7 !gap-1.5 !rounded-md !px-2 !py-1 !text-[10px]"
                >
                  Save
                </Button>
              </>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "menu" && (
            <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-4 md:flex-row md:items-stretch">
              {/* Categories */}
              <section className="flex min-h-[280px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d] md:min-h-0 md:w-[300px] lg:w-[320px]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
                  <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                    Categories
                  </h2>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-green px-3 text-[11px] font-semibold text-white uppercase hover:bg-green-hover"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Add
                  </button>
                </div>
                {deletingCategory ? (
                  <div className="space-y-2 border-b border-white/10 bg-red/10 p-3">
                    <p className="text-xs text-white/90">
                      Delete “{deletingCategory}” and all of its menu items?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={confirmDeleteCategory}
                        className="rounded-lg bg-red px-3 py-1.5 text-xs font-semibold text-white uppercase"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(null)}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-muted hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
                <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                  {content.categories.map((category) => {
                    const count = content.menu.filter(
                      (item) => item.category === category,
                    ).length;
                    const active = selectedCategory === category;
                    const categoryHidden = (
                      content.hiddenCategories ?? []
                    ).includes(category);
                    if (renamingCategory === category) {
                      return (
                        <li key={category}>
                          <form
                            className="flex gap-1 rounded-xl border border-yellow/40 bg-yellow/10 p-1.5"
                            onSubmit={(e) => {
                              e.preventDefault();
                              submitRenameCategory();
                            }}
                          >
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="min-h-9 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-2 text-sm text-white outline-none focus:border-yellow"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-green px-2 text-[10px] font-semibold text-white uppercase"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingCategory(null)}
                              className="rounded-lg px-2 text-[10px] text-muted hover:text-white"
                            >
                              X
                            </button>
                          </form>
                        </li>
                      );
                    }
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
                                categoryHidden && "opacity-50",
                              )}
                            >
                              {category}
                            </span>
                            <span className="text-[11px] text-muted">
                              {count} {count === 1 ? "item" : "items"}
                              {categoryHidden ? " · Hidden" : ""}
                            </span>
                          </button>
                          <AdminToggle
                            checked={!categoryHidden}
                            onChange={(on) =>
                              toggleCategoryVisibility(category, on)
                            }
                            label={`${category} on menu`}
                          />
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
              <section className="flex min-h-[280px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d] md:min-h-0 md:w-[320px] lg:w-[340px]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
                  <h2 className="truncate text-sm font-semibold tracking-wide text-white uppercase">
                    {selectedCategory ? selectedCategory : "Items"}
                  </h2>
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
                                  item.available === false && "opacity-50",
                                )}
                              >
                                {item.name}
                              </span>
                              <span className="text-[11px] text-muted">
                                ${item.price}
                                {item.featured ? " · Featured" : ""}
                                {item.available === false ? " · Hidden" : ""}
                              </span>
                            </button>
                            <AdminToggle
                              checked={item.available !== false}
                              onChange={(on) =>
                                updateMenuItem(item.id, { available: on })
                              }
                              label={`${item.name} on menu`}
                            />
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
                <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                  <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
                      Category
                    </p>
                    <h2 className="mt-1 font-display text-3xl tracking-wide text-white uppercase">
                      {selectedCategory}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {content.menu.filter(
                        (item) => item.category === selectedCategory,
                      ).length}{" "}
                      items · pick one in the list, or add a new item
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col justify-start gap-4 p-5 sm:p-6">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                      <Field label="Rename category">
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
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const item = blankMenuItem(selectedCategory);
                          setContent((prev) =>
                            prev
                              ? { ...prev, menu: [item, ...prev.menu] }
                              : prev,
                          );
                          setSelectedId(item.id);
                        }}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green px-4 text-xs font-semibold text-white uppercase hover:bg-green-hover"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        Add item
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(selectedCategory)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red/35 px-4 text-xs font-semibold text-red uppercase hover:bg-red hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Delete category
                      </button>
                    </div>
                  </div>
                </section>
              ) : selectedItem ? (
                <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
                        {selectedItem.category}
                      </p>
                      <h2 className="mt-0.5 truncate font-display text-2xl tracking-wide text-white uppercase sm:text-3xl">
                        {selectedItem.name || "Untitled item"}
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
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red/30 px-3 text-xs font-semibold text-red uppercase hover:bg-red hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                    <div className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:items-stretch">
                        <div className="space-y-3">
                          <ImageFocusEditor
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            focus={selectedItem.imageFocus ?? { x: 50, y: 50 }}
                            unoptimized={selectedItem.image.startsWith(
                              "/uploads/",
                            )}
                            onChange={(imageFocus) =>
                              updateMenuItem(selectedItem.id, { imageFocus })
                            }
                          />
                          <label className="inline-flex w-full min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold tracking-wide text-white uppercase transition hover:border-yellow/40 hover:bg-yellow/10">
                            <ImagePlus className="h-4 w-4" aria-hidden />
                            Upload photo
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await uploadImage(file);
                                if (url) {
                                  updateMenuItem(selectedItem.id, {
                                    image: url,
                                    imageFocus: { x: 50, y: 50 },
                                  });
                                  setStatus("Image uploaded.");
                                }
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex flex-col justify-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:p-4">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-black/20 px-3 py-2.5">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  On the menu
                                </p>
                                <p className="text-[11px] text-muted">
                                  Visible to customers
                                </p>
                              </div>
                              <AdminToggle
                                checked={selectedItem.available !== false}
                                onChange={(on) =>
                                  updateMenuItem(selectedItem.id, {
                                    available: on,
                                  })
                                }
                                label="Show on menu"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-black/20 px-3 py-2.5">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  Featured
                                </p>
                                <p className="text-[11px] text-muted">
                                  Homepage highlight
                                </p>
                              </div>
                              <AdminToggle
                                checked={!!selectedItem.featured}
                                onChange={(on) =>
                                  updateMenuItem(selectedItem.id, {
                                    featured: on,
                                  })
                                }
                                label="Featured on homepage"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[1fr_7.5rem]">
                        <Field label="Name">
                          <input
                            value={selectedItem.name}
                            onChange={(e) =>
                              updateMenuItem(selectedItem.id, {
                                name: e.target.value,
                              })
                            }
                            className={cn(fieldClass, "text-base font-medium")}
                          />
                        </Field>
                        <Field label="Price">
                          <MoneyInput
                            value={selectedItem.price}
                            onChange={(price) =>
                              updateMenuItem(selectedItem.id, { price })
                            }
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
                              setDescribeNotes("");
                              setDescribeOpen(true);
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
                          rows={4}
                          className={cn(fieldClass, "resize-y leading-relaxed")}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Utensils className="h-6 w-6 text-muted" aria-hidden />
                  </div>
                  <p className="font-display text-2xl tracking-wide text-white uppercase">
                    Start with a category
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-muted">
                    Choose one on the left, then build its menu list.
                  </p>
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

          {tab === "settings" && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
              <div className="space-y-4">
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                  <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <MapPin className="h-4 w-4 text-yellow" aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                        Footer contact
                      </h2>
                      <p className="text-[11px] text-muted">
                        Under the logo on every page
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Phone">
                        <div className="relative">
                          <Phone
                            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                            aria-hidden
                          />
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
                            className={cn(fieldClass, "pl-9")}
                            placeholder="(929) 283-0153"
                            maxLength={14}
                          />
                        </div>
                      </Field>
                      <Field label="Email">
                        <div className="relative">
                          <Mail
                            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                            aria-hidden
                          />
                          <input
                            type="email"
                            value={content.business.email}
                            onChange={(e) =>
                              updateBusiness({ email: e.target.value })
                            }
                            className={cn(fieldClass, "pl-9")}
                            placeholder="hello@yoursite.com"
                          />
                        </div>
                      </Field>
                    </div>
                    <Field label="Street address">
                      <input
                        value={content.business.streetAddress}
                        onChange={(e) =>
                          updateBusiness({ streetAddress: e.target.value })
                        }
                        className={fieldClass}
                        placeholder="82-12 Broadway"
                        autoComplete="street-address"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_5rem_7rem]">
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
                      <Field label="State">
                        <input
                          value={content.business.state}
                          onChange={(e) =>
                            updateBusiness({
                              state: e.target.value.toUpperCase(),
                            })
                          }
                          className={cn(fieldClass, "uppercase")}
                          placeholder="NY"
                          autoComplete="address-level1"
                          maxLength={2}
                        />
                      </Field>
                      <Field label="ZIP">
                        <input
                          value={content.business.zip}
                          onChange={(e) =>
                            updateBusiness({ zip: e.target.value })
                          }
                          className={fieldClass}
                          placeholder="11373"
                          autoComplete="postal-code"
                          inputMode="numeric"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                  <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <InstagramIcon className="h-4 w-4 text-yellow" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                        Footer socials
                      </h2>
                      <p className="text-[11px] text-muted">
                        Icons under the contact block · gallery pulls from
                        Instagram automatically
                      </p>
                    </div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {(
                      [
                        [
                          "instagram",
                          "showInstagram",
                          "Instagram",
                          InstagramIcon,
                        ],
                        ["facebook", "showFacebook", "Facebook", FacebookIcon],
                        ["tiktok", "showTikTok", "TikTok", TikTokIcon],
                      ] as const
                    ).map(([key, showKey, label, Icon]) => {
                      const visible = content.business[showKey];
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 px-5 py-4"
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                              visible
                                ? "border-yellow/30 bg-yellow/10 text-yellow"
                                : "border-white/10 bg-black/30 text-muted",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-white">
                                {label}
                                {key === "instagram" ? (
                                  <span className="ml-2 text-[10px] font-semibold tracking-wide text-gold uppercase">
                                    Gallery
                                  </span>
                                ) : null}
                              </p>
                              <AdminToggle
                                checked={visible}
                                onChange={(on) =>
                                  updateBusiness({ [showKey]: on })
                                }
                                label={`Show ${label}`}
                              />
                            </div>
                            <input
                              type="url"
                              value={content.business[key]}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (key === "instagram") {
                                  updateBusiness({
                                    instagram: value,
                                    gallerySocial: "instagram",
                                    handle: instagramHandleFromUrl(
                                      value,
                                      content.business.handle,
                                    ),
                                  });
                                  return;
                                }
                                updateBusiness({ [key]: value });
                              }}
                              className={cn(fieldClass, "mt-0 min-h-10 text-sm")}
                              placeholder={`https://${key}.com/...`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1212] to-[#120d0d]">
                  <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Settings className="h-4 w-4 text-yellow" aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                        Business details
                      </h2>
                      <p className="text-[11px] text-muted">
                        Brand name used across the site
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-5 sm:grid-cols-2">
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
                </section>

                <button
                  type="button"
                  onClick={() => setTab("pictures")}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#1a1212] to-[#120d0d] px-5 py-4 text-left transition hover:border-yellow/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <ImagePlus className="h-4 w-4 text-yellow" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-white uppercase">
                        Homepage gallery
                      </p>
                      <p className="text-[11px] text-muted">
                        Live Instagram feed when connected ·{" "}
                        {content.gallery.length} fallback photo
                        {content.gallery.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-gold uppercase">
                    Open →
                  </span>
                </button>
              </div>

              <aside className="xl:sticky xl:top-0">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0707]">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                      Footer preview
                    </p>
                  </div>
                  <div className="space-y-4 p-4">
                    <div>
                      <p className="font-display text-lg tracking-wide text-white uppercase">
                        {content.business.shortName ||
                          content.business.name ||
                          "Your brand"}
                      </p>
                      <div className="mt-3 space-y-1.5 text-sm text-muted">
                        {formatBusinessAddress(content.business) ? (
                          <p className="flex gap-2">
                            <MapPin
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow/80"
                              aria-hidden
                            />
                            <span>{formatBusinessAddress(content.business)}</span>
                          </p>
                        ) : (
                          <p className="text-muted/60">No address yet</p>
                        )}
                        {content.business.phone ? (
                          <p className="flex gap-2">
                            <Phone
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow/80"
                              aria-hidden
                            />
                            <span>{content.business.phone}</span>
                          </p>
                        ) : null}
                        {content.business.email ? (
                          <p className="flex gap-2">
                            <Mail
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow/80"
                              aria-hidden
                            />
                            <span className="break-all">
                              {content.business.email}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {(content.business.showInstagram ||
                      content.business.showFacebook ||
                      content.business.showTikTok) && (
                      <div className="flex gap-2 border-t border-white/10 pt-4">
                        {content.business.showInstagram ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white">
                            <InstagramIcon className="h-4 w-4" />
                          </span>
                        ) : null}
                        {content.business.showFacebook ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white">
                            <FacebookIcon className="h-4 w-4" />
                          </span>
                        ) : null}
                        {content.business.showTikTok ? (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white">
                            <TikTokIcon className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    )}

                    <p className="border-t border-white/10 pt-3 text-[11px] text-muted">
                      Changes apply after you hit Save.
                    </p>
                  </div>
                </div>
              </aside>
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

          {tab === "messages" && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-surface-dark/80 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Inbox
                </h2>
                <Button
                  type="button"
                  variant="outline-light"
                  className="min-h-9 px-3 text-xs"
                  loading={messagesLoading}
                  onClick={() => setMessagesRefresh((n) => n + 1)}
                >
                  Refresh
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ...MESSAGE_DEPARTMENTS.map(
                      (d) => [d.id, d.label] as const,
                    ),
                  ] as const
                ).map(([id, label]) => {
                  const active = messageDepartment === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMessageDepartment(id)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition",
                        active
                          ? "border-yellow bg-yellow text-white"
                          : "border-white/10 text-muted hover:border-white/25 hover:text-white",
                      )}
                    >
                      {label} ({messageCounts[id]})
                    </button>
                  );
                })}
              </div>

              {messagesError ? (
                <p className="text-sm text-red-400" role="alert">
                  {messagesError}
                </p>
              ) : null}
              {messagesLoading && !messages.length ? (
                <p className="text-sm text-muted">Loading messages…</p>
              ) : null}
              {!messagesLoading && !messagesError && filteredMessages.length === 0 ? (
                <p className="text-sm text-muted">
                  No messages in this department yet.
                </p>
              ) : null}

              <ul className="space-y-3">
                {filteredMessages.map((message) => {
                  const deptLabel =
                    MESSAGE_DEPARTMENTS.find((d) => d.id === message.department)
                      ?.label ?? message.department;
                  const payloadEntries = Object.entries(message.payload).filter(
                    ([, value]) =>
                      value !== undefined && value !== null && value !== "",
                  );
                  return (
                    <li
                      key={message.id}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-yellow/30 bg-yellow/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-yellow uppercase">
                              {deptLabel}
                            </span>
                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                                message.status === "new"
                                  ? "border-green/40 bg-green/15 text-green"
                                  : message.status === "read"
                                    ? "border-white/15 text-muted"
                                    : "border-white/10 text-muted/70",
                              )}
                            >
                              {message.status}
                            </span>
                            {message.emailSent ? (
                              <span className="text-[10px] text-muted">
                                emailed
                              </span>
                            ) : (
                              <span className="text-[10px] text-orange">
                                email pending
                              </span>
                            )}
                          </div>
                          <p className="mt-2 font-semibold text-white">
                            {message.fullName || "Newsletter signup"}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {message.email}
                            {message.phone ? ` · ${message.phone}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.status !== "read" ? (
                            <button
                              type="button"
                              onClick={() =>
                                void setMessageStatus(message.id, "read")
                              }
                              className="rounded-lg border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted uppercase hover:text-white"
                            >
                              Mark read
                            </button>
                          ) : null}
                          {message.status !== "new" ? (
                            <button
                              type="button"
                              onClick={() =>
                                void setMessageStatus(message.id, "new")
                              }
                              className="rounded-lg border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted uppercase hover:text-white"
                            >
                              Mark new
                            </button>
                          ) : null}
                          {message.status !== "archived" ? (
                            <button
                              type="button"
                              onClick={() =>
                                void setMessageStatus(message.id, "archived")
                              }
                              className="rounded-lg border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted uppercase hover:text-white"
                            >
                              Archive
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {message.message ? (
                        <p className="mt-3 whitespace-pre-wrap border-t border-white/10 pt-3 text-sm text-cream">
                          {message.message}
                        </p>
                      ) : null}
                      {payloadEntries.length > 0 ? (
                        <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-muted">
                          {payloadEntries.map(([key, value]) => (
                            <li key={key} className="flex justify-between gap-3">
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                              </span>
                              <span className="text-white">{String(value)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {addingCategory ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={() => {
              setAddingCategory(false);
              setNewCategoryName("");
            }}
          />
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-category-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#1a1212] p-5 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              submitNewCategory();
            }}
          >
            <h3
              id="add-category-title"
              className="font-display text-2xl tracking-wide text-white uppercase"
            >
              New category
            </h3>
            <p className="mt-1 text-sm text-muted">
              Add a menu section, then create items inside it.
            </p>
            <label className="mt-4 block text-xs font-semibold tracking-wide text-muted uppercase">
              Category name
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Desserts"
                className="mt-1.5 w-full min-h-11 rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-white outline-none focus:border-yellow"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddingCategory(false);
                  setNewCategoryName("");
                }}
                className="min-h-10 rounded-xl border border-white/15 px-4 text-xs font-semibold text-muted uppercase hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-10 rounded-xl bg-green px-4 text-xs font-semibold text-white uppercase hover:bg-green-hover"
              >
                Create category
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {describeOpen && selectedItem ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={() => {
              setDescribeOpen(false);
              setDescribeNotes("");
            }}
          />
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="auto-describe-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#1a1212] p-5 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const copy = autoDescribeMenuItem(
                selectedItem.name,
                selectedItem.category,
                describeNotes,
              );
              updateMenuItem(selectedItem.id, {
                description: copy.description,
                longDescription: copy.longDescription,
              });
              setDescribeOpen(false);
              setDescribeNotes("");
              setStatus("Description generated.");
            }}
          >
            <h3
              id="auto-describe-title"
              className="font-display text-2xl tracking-wide text-white uppercase"
            >
              Auto-generate
            </h3>
            <p className="mt-1 text-sm text-muted">
              List the essentials for{" "}
              <span className="text-white">{selectedItem.name || "this item"}</span>
              — proteins, toppings, prep — and we’ll write the description.
            </p>
            <label className="mt-4 block text-xs font-semibold tracking-wide text-muted uppercase">
              Essentials
              <textarea
                autoFocus
                value={describeNotes}
                onChange={(e) => setDescribeNotes(e.target.value)}
                rows={4}
                placeholder="e.g. birria beef, consommé, onions, cilantro, lime"
                className="mt-1.5 w-full resize-y rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-yellow"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDescribeOpen(false);
                  setDescribeNotes("");
                }}
                className="min-h-10 rounded-xl border border-white/15 px-4 text-xs font-semibold text-muted uppercase hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-10 rounded-xl bg-yellow px-4 text-xs font-semibold text-white uppercase hover:bg-yellow-hover"
              >
                Generate
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-white outline-none transition focus:border-yellow/60";

function ImageFocusEditor({
  src,
  alt,
  focus,
  onChange,
  unoptimized,
}: {
  src: string;
  alt: string;
  focus: { x: number; y: number };
  onChange: (focus: { x: number; y: number }) => void;
  unoptimized?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  function clamp(value: number) {
    return Math.min(100, Math.max(0, value));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const node = containerRef.current;
    if (!node) return;
    node.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: focus.x,
      originY: focus.y,
    };
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const node = containerRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dx = ((event.clientX - drag.startX) / rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / rect.height) * 100;
    onChange({
      x: clamp(drag.originX - dx),
      y: clamp(drag.originY - dy),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      containerRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  }

  return (
    <div className="space-y-2">
      {!src ? (
        <div className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-white/20 bg-black/25 px-4 text-center">
          <ImagePlus className="h-7 w-7 text-muted" aria-hidden />
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            No photo yet
          </p>
          <p className="text-[11px] text-muted/80">
            Upload below to add one
          </p>
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={cn(
              "relative aspect-square touch-none overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg shadow-black/30 select-none",
              dragging ? "cursor-grabbing" : "cursor-grab",
            )}
            role="slider"
            aria-label="Drag to reposition thumbnail"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(focus.x)}
            aria-valuetext={`Focus ${Math.round(focus.x)}% ${Math.round(focus.y)}%`}
            tabIndex={0}
          >
            <Image
              src={src}
              alt={alt}
              fill
              draggable={false}
              className="pointer-events-none object-cover"
              style={{ objectPosition: menuImageObjectPosition(focus) }}
              sizes="200px"
              unoptimized={unoptimized}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wide text-white/90 uppercase">
                <Move className="h-3 w-3" aria-hidden />
                Drag to position
              </p>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-yellow/90 shadow"
              style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange({ x: 50, y: 50 })}
            className="text-[11px] font-semibold tracking-wide text-muted uppercase transition hover:text-white"
          >
            Reset center
          </button>
        </>
      )}
    </div>
  );
}

function AdminToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative mr-1 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow",
        checked
          ? "border-green/60 bg-green"
          : "border-white/25 bg-white/10",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-0.5 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[16px]" : "translate-x-0",
        )}
      />
    </button>
  );
}

function MoneyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const formatted = formatMoneyInput(value);
  const [text, setText] = useState(formatted);
  const [focused, setFocused] = useState(false);
  const display = focused ? text : formatted;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={display}
        onFocus={() => {
          setText(formatted);
          setFocused(true);
        }}
        onChange={(e) => {
          const next = sanitizeMoneyInput(e.target.value);
          setText(next);
          onChange(parseMoneyInput(next));
        }}
        onBlur={() => {
          const amount = parseMoneyInput(text);
          onChange(amount);
          setText(formatMoneyInput(amount));
          setFocused(false);
        }}
        className={cn(fieldClass, "pl-7 text-base font-semibold tabular-nums")}
      />
    </div>
  );
}

function formatMoneyInput(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
}

function sanitizeMoneyInput(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot).replace(/\./g, "");
  const fraction = cleaned
    .slice(dot + 1)
    .replace(/\./g, "")
    .slice(0, 2);
  return `${whole}.${fraction}`;
}

function parseMoneyInput(raw: string) {
  if (!raw || raw === ".") return 0;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}

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
