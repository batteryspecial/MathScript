import type { ReactNode } from "react";

import styles from "./auth.module.css";

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
    if (!children) return null;
    return (
        <p className={tone === "error" ? styles.error : styles.notice} role={tone === "error" ? "alert" : "status"}>
            {children}
        </p>
    );
}
