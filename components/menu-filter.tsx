"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "@/components/content-provider";
import { categorySectionId } from "@/lib/cms/utils";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function categoryLabel(category: string, t: (key: string) => string) {
  const translated = t(`categories.${category}`);
  return translated === `categories.${category}` ? category : translated;
}

export function MenuFilter() {
  const t = useT();
  const { content } = useContent();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const pausedRef = useRef(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const topics = useMemo(
    () =>
      content.categories.map((category) => {
        const item =
          content.menu.find(
            (entry) => entry.category === category && entry.featured,
          ) ?? content.menu.find((entry) => entry.category === category);
        return {
          category,
          label: categoryLabel(category, t),
          image: item?.image || "/images/truck-gallery.jpg",
        };
      }),
    [content.categories, content.menu, t],
  );

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const maxScroll = node.scrollWidth - node.clientWidth;
    setCanScrollPrev(node.scrollLeft > 4);
    setCanScrollNext(node.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (node.scrollWidth <= node.clientWidth) return;
      event.preventDefault();
      node.scrollBy({ left: event.deltaY });
    };
    node.addEventListener("wheel", onWheel, { passive: false });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      node.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [topics.length, updateScrollState]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node || topics.length < 2) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current || dragRef.current) return;
      if (node.scrollWidth <= node.clientWidth + 4) return;

      const card = node.querySelector<HTMLElement>("[data-topic-card]");
      const step = (card?.offsetWidth ?? 160) + 12;
      const maxScroll = node.scrollWidth - node.clientWidth;
      const next = node.scrollLeft + step;

      if (next >= maxScroll - 2) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3200);

    return () => window.clearInterval(timer);
  }, [topics.length]);

  function scrollToCategory(category: string) {
    const el = document.getElementById(categorySectionId(category));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollCarousel(direction: -1 | 1) {
    const node = scrollerRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-topic-card]");
    const step = (card?.offsetWidth ?? 160) + 12;
    node.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const node = scrollerRef.current;
    if (!node) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: node.scrollLeft,
      moved: false,
    };
    node.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const node = scrollerRef.current;
    if (!drag || !node || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 6) drag.moved = true;
    if (drag.moved) {
      node.scrollLeft = drag.startScroll - delta;
    }
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const node = scrollerRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) suppressClickRef.current = true;
    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  return (
    <div
      className="sticky top-[68px] z-20 mb-10 w-full min-w-0 bg-background/95 py-3 backdrop-blur-md lg:top-[78px]"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pausedRef.current = false;
        }
      }}
      onTouchStart={() => {
        pausedRef.current = true;
      }}
      onTouchEnd={() => {
        window.setTimeout(() => {
          pausedRef.current = false;
        }, 4000);
      }}
    >
      <div className="relative min-w-0">
        <button
          type="button"
          onClick={() => scrollCarousel(-1)}
          disabled={!canScrollPrev}
          className="absolute top-1/2 left-0 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-dark bg-background/95 text-white shadow-lg transition hover:border-yellow hover:text-yellow disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:w-10"
          aria-label="Previous categories"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollCarousel(1)}
          disabled={!canScrollNext}
          className="absolute top-1/2 right-0 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-dark bg-background/95 text-white shadow-lg transition hover:border-yellow hover:text-yellow disabled:pointer-events-none disabled:opacity-30 sm:h-10 sm:w-10"
          aria-label="Next categories"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>

        <div
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "scrollbar-none flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain px-10 sm:px-12",
            "cursor-grab select-none active:cursor-grabbing",
            "[-webkit-overflow-scrolling:touch]",
          )}
          role="navigation"
          aria-label={t("menuPage.categories")}
        >
          {topics.map((topic) => (
            <button
              key={topic.category}
              type="button"
              data-topic-card
              onClick={() => {
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  return;
                }
                scrollToCategory(topic.category);
              }}
              className="group relative aspect-[4/3] w-[38vw] max-w-[10.5rem] min-w-[7.75rem] shrink-0 overflow-hidden rounded-lg border border-border-dark bg-surface-dark text-left transition hover:border-yellow sm:w-40 sm:max-w-none"
            >
              <Image
                src={topic.image}
                alt=""
                fill
                draggable={false}
                className="pointer-events-none object-cover transition duration-500 group-hover:scale-105"
                sizes="160px"
                unoptimized={topic.image.startsWith("/uploads/")}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
              <span className="absolute inset-x-0 bottom-0 p-2.5">
                <span className="block text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition group-hover:text-yellow sm:text-xs">
                  {topic.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
