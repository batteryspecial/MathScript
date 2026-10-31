import { SiteNav } from "@/components/layout/SiteNav";

import chrome from "../landing.module.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={chrome.page}>
            <SiteNav />
            <main className={chrome.inner}>{children}</main>
        </div>
    );
}
