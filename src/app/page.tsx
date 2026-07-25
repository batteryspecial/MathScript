import Link from "next/link";
import katex from "katex";

import styles from "./landing.module.css";

// Rendered on the server — the landing page ships zero client JavaScript.
function Math({ tex }: { tex: string }) {
    return (
        <span
            dangerouslySetInnerHTML={{
                __html: katex.renderToString(tex, { throwOnError: false }),
            }}
        />
    );
}

const NAV = [
    { label: "Try", href: "/projects" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "Account", href: "#" },
    { label: "Settings", href: "#" },
];

// Left column is what you actually type — every keyword below is a real entry
// in the symbol table (src/lib/equation/symbols.ts).
const TRANSCRIPTIONS = [
    { typed: "forall x in RR, x^2 >= 0", tex: "\\forall x \\in \\mathbb{R},\\ x^2 \\geq 0" },
    { typed: "sum n=1 to infty 1/n^2", tex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2}" },
    { typed: "A subseteq B iff ...", tex: "A \\subseteq B \\iff \\forall x\\,(x \\in A \\implies x \\in B)" },
    { typed: "f: X to Y, epsilon > 0", tex: "f: X \\to Y,\\ \\varepsilon > 0" },
];

const FEATURES = [
    {
        glyph: "\u2200",
        title: "Say it, don't spell it",
        text: "Type forall, in, RR, leq. The symbols appear as you write.",
    },
    {
        glyph: "\u00a7",
        title: "Numbering that keeps up",
        text: "Sections, subsections and equations renumber themselves as you move cells.",
    },
    {
        glyph: "\u2318",
        title: "Cells under the keyboard",
        text: "Select, move, copy and delete cells without reaching for the mouse.",
    },
    {
        glyph: "\u21e5",
        title: "LaTeX on the way out",
        text: "Export a complete .tex document when a journal asks for one.",
    },
];

export default function Page() {
    return (
        <div className={styles.page}>
            <header className={styles.nav}>
                <nav className={styles.navInner}>
                    <Link href="/" className={styles.wordmark}>
                        Math<span>Script</span>
                    </Link>
                    {NAV.map((item) => (
                        <Link key={item.label} href={item.href} className={styles.navLink}>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </header>

            <main>
                <section className={styles.hero}>
                    <div className={styles.inner}>
                        <h1 className={styles.heroTitle}>
                            The Jupyter Notebook for Mathematical Proofs
                        </h1>
                        <hr className={styles.heroRule} />
                        <p className={styles.heroLead}>
                            Write proofs in cells, the way you write code in Jupyter. Type
                            the math the way you would say it out loud — MathScript writes
                            the LaTeX.
                        </p>

                        <div className={styles.panel}>
                            <div className={styles.panelHead}>
                                <div>You type</div>
                                <div>You get</div>
                            </div>
                            {TRANSCRIPTIONS.map((row) => (
                                <div key={row.typed} className={styles.row}>
                                    <div className={styles.typed}>{row.typed}</div>
                                    <div className={styles.rendered}>
                                        <Math tex={row.tex} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <Link href="/projects" className={styles.btn}>
                                Try it in your browser
                            </Link>
                            <a href="#" className={`${styles.btn} ${styles.btnGhost}`}>
                                Read the documentation
                            </a>
                        </div>
                    </div>
                </section>

                <section className={`${styles.band} ${styles.bandGrey}`}>
                    <div className={`${styles.inner} ${styles.split}`}>
                        <figure className={styles.figure}>
                            <div className={styles.figureBar}>
                                <span className={styles.figureTab}>riemann.ms</span>
                            </div>
                            <div className={styles.cells}>
                                <div className={styles.cell}>
                                    <span className={styles.cellNum}>1</span>
                                    <span className={styles.cellSection}>Preliminaries</span>
                                </div>
                                <div className={styles.cell}>
                                    <span className={styles.cellNum} />
                                    <p className={styles.cellText}>
                                        Let <Math tex="f" /> be continuous on{" "}
                                        <Math tex="[a, b]" /> and let <Math tex="F" /> be an
                                        antiderivative of <Math tex="f" />. Then:
                                    </p>
                                </div>
                                <div className={`${styles.cell} ${styles.cellActive}`}>
                                    <span className={styles.cellNum} />
                                    <span className={styles.cellEquation}>
                                        <Math tex="\int_a^b f(x)\,dx = F(b) - F(a)" />
                                        <span className={styles.equationTag}>(1.1)</span>
                                    </span>
                                </div>
                                <div className={styles.cell}>
                                    <span className={styles.cellNum}>1.1</span>
                                    <span className={styles.cellSection}>The upper sum</span>
                                </div>
                            </div>
                        </figure>
                        <div>
                            <h2 className={styles.bandTitle}>
                                Cells, but for mathematical writing
                            </h2>
                            <p className={styles.bandText}>
                                A document is a stack of cells: prose, section headings and
                                display equations. Move one and everything downstream
                                renumbers. Label an equation once and refer to it anywhere.
                            </p>
                            <p className={styles.bandText}>
                                Nothing needs to compile. What you see in the cell is what
                                lands on the page.
                            </p>
                            <div className={styles.bandActions}>
                                <Link href="/projects" className={styles.btn}>
                                    Open a notebook
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`${styles.band} ${styles.splitFlip}`}>
                    <div className={`${styles.inner} ${styles.split}`}>
                        <figure className={styles.figure}>
                            <div className={styles.figureBar}>
                                <span className={styles.figureTab}>riemann.tex</span>
                            </div>
                            <pre className={styles.code}>
                                <span className={styles.codeKeyword}>{"\\documentclass"}</span>
                                {"{article}\n"}
                                <span className={styles.codeKeyword}>{"\\usepackage"}</span>
                                {"{amsmath}\n"}
                                <span className={styles.codeKeyword}>{"\\usepackage"}</span>
                                {"{amssymb}\n\n"}
                                <span className={styles.codeKeyword}>{"\\begin"}</span>
                                {"{document}\n"}
                                <span className={styles.codeKeyword}>{"\\section"}</span>
                                {"{Preliminaries}\n"}
                                {"Let $f$ be continuous on $[a, b]$ ...\n"}
                                <span className={styles.codeKeyword}>{"\\begin"}</span>
                                {"{equation}\n"}
                                {"  \\int_a^b f(x)\\,dx = F(b) - F(a)\n"}
                                <span className={styles.codeKeyword}>{"\\end"}</span>
                                {"{equation}\n"}
                                <span className={styles.codeKeyword}>{"\\end"}</span>
                                {"{document}"}
                            </pre>
                        </figure>
                        <div>
                            <h2 className={styles.bandTitle}>
                                You never write LaTeX. You can still hand it in.
                            </h2>
                            <p className={styles.bandText}>
                                Export produces a complete, compilable document — preamble,
                                title block, numbered equations and all. Choose what goes in
                                it, or take the whole thing and send it to your supervisor.
                            </p>
                            <div className={styles.bandActions}>
                                <a href="#" className={`${styles.btn} ${styles.btnGhost}`}>
                                    See an exported document
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.band}>
                    <div className={`${styles.inner} ${styles.features}`}>
                        {FEATURES.map((feature) => (
                            <div key={feature.title}>
                                <div className={styles.featureGlyph} aria-hidden="true">
                                    {feature.glyph}
                                </div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureText}>{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <span>MathScript — an experiment in writing mathematics.</span>
                    <span className={styles.footerLinks}>
                        <a href="#">About</a>
                        <a href="#">Documentation</a>
                        <a href="#">GitHub</a>
                    </span>
                </div>
            </footer>
        </div>
    );
}
