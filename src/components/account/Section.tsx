import type { ReactNode } from "react";

import styles from "@/components/auth/auth.module.css";

export function Section({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                {badge}
            </div>
            {children}
        </section>
    );
}

export function Badge({ on, children }: { on?: boolean; children: ReactNode }) {
    return <span className={`${styles.badge} ${on ? styles.badgeOn : ""}`}>{children}</span>;
}
