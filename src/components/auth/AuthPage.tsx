import type { ReactNode } from "react";

import styles from "./auth.module.css";

export function AuthPage({ title, lead, wide, children }: { title: string; lead?: ReactNode; wide?: boolean; children: ReactNode }) {
    return (
        <div className={wide ? styles.wide : styles.column}>
            <h1 className={styles.title}>{title}</h1>
            {lead && <p className={styles.lead}>{lead}</p>}
            {children}
        </div>
    );
}
