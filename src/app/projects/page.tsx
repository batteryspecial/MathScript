"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Page() {
    const [projectId, setProjectId] = useState<string>("")

    useEffect(() => {
        setProjectId(crypto.randomUUID())
    }, [])

    if (!projectId) return <div>Loading...</div>

    return (
        <Link href={`/projects/${projectId}`}>
            Hello World
        </Link>
    )
}
