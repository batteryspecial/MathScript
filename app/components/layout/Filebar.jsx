'use client';
import { useRef, useState, useEffect } from 'react';
import FileMenu from '@/app/components/ui/FileMenu'

export default function Filebar() {
    const menuRef = useRef(null)
    const [activeMenu, setActiveMenu] = useState(false)
    const [hoveredMenu, setHoveredMenu] = useState(null)

    useEffect(() => {

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
        setHoveredMenu(id)
    }

    // toggle menu based on if we are clicking on the current open menu
    const handleMenuClick = () => {
        setActiveMenu(!activeMenu);
    }

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
                    <li key={it.id} 
                        className='relative' 
                        onMouseEnter={() => handleMouseHover(it.id)}
                        onMouseLeave={() => setHoveredMenu(null)}
                    >
                        <button 
                            type='button' 
                            className={`transition text-sm h-6 w-20 ${
                                (hoveredMenu === it.id) || (activeMenu === it.id) ? 'dark:bg-gray-800 bg-slate-300' : ''
                            }`}
                            onClick={() => handleMenuClick(it.id)}
                        >
                            {it.label}
                        </button>
                        
                        {hoveredMenu === it.id && activeMenu && (
                            <FileMenu options={it.options} />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
