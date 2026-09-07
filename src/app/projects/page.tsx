import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { listProjects } from "@mathscript/postgres";

import { ActionButton } from "@/components/ui/action-button";
import { deleteProjectAction, newProjectAction } from "@/lib/db/actions";
import chrome from "../landing.module.css";
import styles from "./projects.module.css";

export const dynamic = "force-dynamic";

export default async function Page() {
    const projects = await listProjects();

    return (
        <div className={chrome.page}>
            <header className={chrome.nav}>
                <nav className={chrome.navInner}>
                    <Link href="/" className={chrome.wordmark}>
                        Math<span>Script</span>
                    </Link>
                    <Link href="/projects" className={chrome.navLink}>
                        Projects
                    </Link>
                    <a href="#" className={chrome.navLink}>
                        Documentation
                    </a>
                    <a href="#" className={chrome.navLink}>
                        Account
                    </a>
                </nav>
            </header>

            <main className={chrome.inner}>
                <div className={styles.head}>
                    <h1 className={styles.title}>Projects</h1>
                    <span className={styles.count}>
                        {projects.length === 1 ? "1 project" : `${projects.length} projects`}
                    </span>
                    <form action={newProjectAction} className={styles.headAction}>
                        <button type="submit" className={chrome.btn}>
                            New Project +
                        </button>
                    </form>
                </div>

                <div className={styles.grid}>
                    {projects.length === 0 && (
                        <p className={styles.empty}>
                            No projects yet. Start one and it saves as you write.
                        </p>
                    )}

                    {projects.map((project) => (
                        <div key={project.id} className={styles.card}>
                            <Link href={`/projects/${project.id}`} className={styles.cardName}>
                                {project.name}
                            </Link>
                            <span className={styles.cardId}>{project.id.slice(0, 8)}</span>
                            <span className={styles.cardMeta}>
                                edited {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                            </span>
                            {/* Tailwind here rather than the CSS module: the
                                button's own variant classes would fight a
                                same-specificity module class. */}
                            <ActionButton
                                action={deleteProjectAction.bind(null, project.id)}
                                requireAreYouSure
                                areYouSureDescription={
                                    <>
                                        Deleting <strong>{project.name}</strong> removes every
                                        file, cell and equation in it. This cannot be undone.
                                    </>
                                }
                                variant="ghost"
                                size="icon-xs"
                                className="absolute top-1 right-1 z-1 text-var(--ms-tab-border) hover:text-[#c0392b]"
                                title={`Delete ${project.name}`}
                                aria-label={`Delete ${project.name}`}
                            >
                                <Trash2 />
                            </ActionButton>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
