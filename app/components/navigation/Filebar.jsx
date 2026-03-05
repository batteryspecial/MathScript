'use client';
import { useRef, useState, useEffect } from 'react';

export default function Filebar() {
    const menuRef = useRef(null)
    const [mounted, setMounted] = useState(false)
    const [hoveredMenu, setHoveredMenu] = useState(null)
    const [activeMenu, setActiveMenu] = useState(null) // track which menu id is active
    
    useEffect(() => {
        setMounted(true);

        // Global click listener to close menu when clicking elsewhere
        const handleExternalClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(false)
            }
        }

        document.addEventListener('mousedown', handleExternalClick)
        return () => document.removeEventListener('mousedown', handleExternalClick)
    }, []);

    // switch menus iff a menu is already open
    const handleMouseHover = (id) => {
        if (activeMenu != id) {
            setHoveredMenu(id)
        }
    }

    // toggle menu based on if we are clicking on the current open menu
    const handleMenuClick = (id) => {
        setActiveMenu(activeMenu === id ? null : id)
    }

    // Render placeholder with same dimensions during SSR
    if (!mounted) return <div className="h-7.5 w-full bg-[#f7f7f7]" />

    const links = [
        {
            id: 0,
            label: 'File',
            options: [
                { label: 'New Notebook', link: 'https://example.com' },
                { label: 'Open...', link: '#' },
                { label: 'Make a Copy...', link: '#' },
                { label: 'Save as...', link: '#' },
                { label: 'Rename...', link: '#' },
                { divider: true },
                { label: 'Save and Checkpoint', link: '#' },
                { label: 'Revert to Checkpoint', link: '#' },
                { divider: true },
                { label: 'Print Preview', link: '#' },
                { label: 'Download as', link: '#' },
                { divider: true },
                { label: 'Close and Halt', link: '#' },
            ]
        },
        { 
            id: 1, 
            label: 'Edit', 
            options: [
                { label: 'New Notebook', link: 'https://example.com' },
            ],
        },
        { 
            id: 2, 
            label: 'View', 
            options: [
                { label: 'New Notebook', link: 'https://example.com' },
            ],
        },
        { 
            id: 3, 
            label: 'Settings', 
            options: [
                { label: 'New Notebook', link: 'https://example.com' },
            ],
        }
    ]

    return (
        <nav ref={menuRef} className="flex border-b border-[#e7e7e7] mb-4 select-none">
            <ul className='flex items-center'>
                {links.map(it => (
                    <li key={it.id} className='relative'>
                        <button type='button' 
                            className={`
                                transition text-sm h-6 w-20 
                                ${
                                    (hoveredMenu === it.id) || (activeMenu === it.id) ? 'dark:bg-gray-800 bg-slate-300' : ''
                                }
                            `}
                            onMouseEnter={() => handleMouseHover(it.id)}
                            onMouseLeave={() => setHoveredMenu(null)}
                            onClick={() => handleMenuClick(it.id)}
                        >
                            {it.label}
                        </button>
                        
                        {activeMenu === it.id && (
                            <ul className='absolute left-0 top-full z-50 min-w-50 bg-white border border-[#ccc] shadow-md'>
                                {it.options.map((opt, i) => (
                                    opt.divider ? (
                                    <hr key={i} className="my-1 border-[#e5e5e5]" />
                                    ) : (
                                    <li key={i}>
                                        <a href={opt?.link}
                                            className="block px-5 text-sm hover:bg-[#f5f5f5] text-[#333]"
                                            onClick={() => setActiveMenu(null)}
                                        >
                                        {opt.label}
                                        </a>
                                    </li>
                                    )
                                ))}
                            </ul>
                        )}
                        
                    </li>
                ))}
            </ul>
        </nav>
    );
}
