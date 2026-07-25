export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    // h-full so the index page's own scroll container resolves against body,
    // which globals.css sets to height:100%; overflow:hidden.
    return (
        <div className="h-full">{children}</div>
    )
}
