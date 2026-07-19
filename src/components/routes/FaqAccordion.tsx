"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import styles from "./FaqAccordion.module.css";

export type FaqGroup = {
  label: string;
  hue: string;
  items: { slug: string; question: string; answer: string }[];
};

/**
 * FaqAccordion — an accessible, domain-tinted FAQ accordion with a live search filter. Each
 * question is a real <button aria-expanded aria-controls> toggling its answer panel, so it's
 * keyboard-operable (Tab + Enter/Space) and its open state is conveyed to assistive tech
 * without relying on colour (the chevron is decorative). Multiple panels may be open at once,
 * which suits scanning after a search. The search box filters by question and answer text and
 * announces the result count politely; groups with no matches are hidden.
 */
export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const baseId = useId().replace(/:/g, "");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.question.toLowerCase().includes(q) || it.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, q]);

  const total = filtered.reduce((n, g) => n + g.items.length, 0);

  function toggle(slug: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.search}>
        <Search className={styles.searchIcon} size={18} aria-hidden="true" />
        <input
          type="search"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions"
          aria-label="Search questions"
        />
        {query ? (
          <button type="button" className={styles.clear} onClick={() => setQuery("")}>
            <X size={16} aria-hidden="true" />
            <span className="iw-visually-hidden">Clear search</span>
          </button>
        ) : null}
      </div>

      <p className={styles.count} aria-live="polite">
        {q ? `${total} matching question${total === 1 ? "" : "s"}` : `${total} questions`}
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          No questions match that search. Try a different word, or{" "}
          <a href="/contact" className={styles.emptyLink}>
            ask us directly
          </a>
          .
        </p>
      ) : (
        <div className={styles.groups}>
          {filtered.map((group) => (
            <div
              key={group.label}
              className={styles.group}
              style={{ ["--hue" as string]: group.hue }}
            >
              <h2 className={styles.groupLabel}>{group.label}</h2>
              <ul className={styles.list}>
                {group.items.map((item) => {
                  const isOpen = open.has(item.slug);
                  const panelId = `${baseId}-${item.slug}`;
                  return (
                    <li key={item.slug} className={styles.item}>
                      <h3 className={styles.qHeading}>
                        <button
                          type="button"
                          className={styles.trigger}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => toggle(item.slug)}
                        >
                          <span className={styles.question}>{item.question}</span>
                          <ChevronDown className={styles.chevron} data-open={isOpen} aria-hidden="true" />
                        </button>
                      </h3>
                      <div id={panelId} className={styles.panel} hidden={!isOpen}>
                        <p className={styles.answer}>{item.answer}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
