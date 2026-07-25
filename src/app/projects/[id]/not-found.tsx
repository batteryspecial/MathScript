import Link from "next/link";

import chrome from "../../landing.module.css";
import styles from "../projects.module.css";

export default function ProjectNotFound() {
    return (
        <div className={`${chrome.page} ${styles.notFound}`}>
            <div className={styles.notFoundInner}>
                <span className={styles.notFoundCode}>404</span>
                <div className={styles.notFoundBody}>
                    <p className={styles.notFoundText}>This project could not be found.</p>
                    <p className={styles.notFoundHint}>
                        It may have been deleted, or the link may be mistyped.
                    </p>
                    <Link href="/projects" className={`${chrome.btn} ${chrome.btnGhost}`}>
                        Back to projects
                    </Link>
                </div>
            </div>
        </div>
    );
}
