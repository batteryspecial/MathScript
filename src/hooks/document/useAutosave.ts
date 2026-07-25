"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "saved" | "dirty" | "saving";

/**
 * Debounced write-behind save.
 *
 * `markDirty()` is the whole interface: call it whenever something changed and
 * the payload is read via `collect()` once the dust settles. Keystrokes call it
 * on every edit, so it must not force a render — `setState` bails out when the
 * value is already "dirty", and the timer lives in a ref.
 */
export function useAutosave<T>(
    collect: () => T,
    save: (payload: T) => Promise<boolean | void>,
    delay = 1000,
) {
    const [state, setState] = useState<SaveState>("saved");

    // Refs so a re-render's fresh closures are used without restarting the timer.
    const collectRef = useRef(collect);
    const saveRef = useRef(save);
    collectRef.current = collect;
    saveRef.current = save;

    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dirty = useRef(false);
    const inFlight = useRef(false);
    const again = useRef(false);

    const flush = useCallback(async (): Promise<void> => {
        if (!dirty.current) return;
        if (inFlight.current) {
            again.current = true;
            return;
        }

        dirty.current = false;
        inFlight.current = true;
        setState("saving");

        let ok = true;
        try {
            // A `false` return means "not writable yet" (see saveDocument's
            // missing-node guard) — same handling as a thrown error.
            ok = (await saveRef.current(collectRef.current())) !== false;
        } catch (err) {
            ok = false;
            console.error("autosave failed", err);
        } finally {
            inFlight.current = false;
            if (again.current) {
                again.current = false;
                void flush();
            } else if (ok) {
                setState("saved");
            } else {
                // ponytail: retry on a flat delay, forever, while the page is
                // open. Add backoff + a give-up state if this ever fails loudly.
                dirty.current = true;
                setState("dirty");
                timer.current = setTimeout(() => void flush(), delay * 2);
            }
        }
    }, [delay]);

    const markDirty = useCallback(() => {
        dirty.current = true;
        setState("dirty");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), delay);
    }, [delay, flush]);

    // Last chance on tab close / navigation away — best effort, the request may
    // not survive teardown, but the debounce usually beat us to it anyway.
    useEffect(() => {
        const onHide = () => {
            if (dirty.current) void flush();
        };
        window.addEventListener("pagehide", onHide);
        return () => {
            window.removeEventListener("pagehide", onHide);
            if (timer.current) clearTimeout(timer.current);
            onHide();
        };
    }, [flush]);

    return { state, markDirty };
}
