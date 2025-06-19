"use client";
/* eslint-disable */
// @ts-nocheck – this component is compiled by Next.js but lives outside the main
// app dir, so local tsconfig paths/types do not apply. Disable type-checking to
// avoid IDE / build noise until shared tsconfig is wired up.

// @ts-ignore
import { useEffect, useRef } from "react";

// Lightweight wrapper around Toast-UI Editor that requires **no** npm package.
// It loads the CSS & JS bundle from /lib/toastui-editor/ (or CDN fallback)
// and exposes a minimal rich-text surface: no toolbar, no mode switch.

export interface RichMarkdownEditorProps {
  value: string;
  onChange: (md: string) => void;
  className?: string;
}

// Paths relative to Next.js public/ folder (you may copy the files there)
const CSS_HREF = "/lib/toastui-editor/toastui-editor.min.css";
const JS_SRC = "/lib/toastui-editor/toastui-editor-all.min.js";

export default function RichMarkdownEditor({ value, onChange, className }: RichMarkdownEditorProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);

  // ---- 1. Ensure the CSS is present in <head> ----
  useEffect(() => {
    const id = "toastui-editor-css";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = CSS_HREF;
    document.head.appendChild(link);
  }, []);

  // ---- 2. Load JS bundle (once) ----
  useEffect(() => {
    if ((window as any).toastui?.Editor) return; // already loaded
    const scriptId = "toastui-editor-js";
    if (document.getElementById(scriptId)) return;
    const s = document.createElement("script");
    s.id = scriptId;
    s.src = JS_SRC;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  // ---- 3. Initialise editor when script is ready ----
  useEffect(() => {
    if (!holderRef.current) return;
    if (editorRef.current) return; // already created
    if (!(window as any).toastui?.Editor) return; // script still loading

    const EditorConstructor = (window as any).toastui.Editor;
    editorRef.current = new EditorConstructor({
      el: holderRef.current,
      initialEditType: "wysiwyg",
      height: "auto",
      toolbarItems: [], // hide toolbar
      hideModeSwitch: true,
      previewStyle: "vertical",
      placeholder: "Edit your lesson content…",
      usageStatistics: false,
      initialValue: value ?? "",
    });

    editorRef.current.on("change", () => {
      const md = editorRef.current.getMarkdown();
      onChange(md);
    });
  }, [value, onChange]);

  // ---- 4. Keep external value in sync ----
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.getMarkdown() !== value) {
      editorRef.current.setMarkdown(value ?? "", false /* toResetSelection */);
    }
  }, [value]);

  // ---- 5. Auto-scroll to bottom on content updates ----
  useEffect(() => {
    if (!editorRef.current) return;
    const ww = holderRef.current?.querySelector<HTMLElement>(
      ".toastui-editor-ww-container",
    );
    if (ww) {
      ww.scrollTop = ww.scrollHeight;
    }
  }, [value]);

  return <div ref={holderRef} className={className} />;
} 