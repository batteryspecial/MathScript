'use client';
import { useState, useEffect } from 'react';

import { ArrowLeft, Copy, Scissors, Clipboard, Plus } from "lucide-react";

export default function Navbar({ onBack, onCopy, onCut, onPaste, onAdd }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder with same dimensions during SSR
  if (!mounted) return <div className="h-7.5 w-full bg-[#f7f7f7]" />

  const toolbarLinks = [
    {
      icon: <ArrowLeft size={16} />,
      action: onBack,
      label: 'Return',
    },
    {
      icon: <Plus size={16} />,
      action: onAdd,
      label: 'Add',
    },
    {
      icon: <Scissors size={16} />,
      action: onCut,
      label: 'Cut',
    },
    {
      icon: <Copy size={16} />,
      action: onCopy,
      label: 'Copy',
    },
    {
      icon: <Clipboard size={16} />,
      action: onPaste,
      label: 'Paste',
    },
  ]

  return (
      <div className="z-1 backdrop-blur-md max-w-[90vw] bg-white/10 shadow-sm rounded-full mx-auto mb-4">
          <nav className="flex items-center h-8 px-8 justify-between gap-12">
            <ul className="flex gap-x-10">
              {toolbarLinks.map((link, id) => (
                <li key={id} className='flex items-center'>
                  <button className='cursor-pointer' onClick={link.action} title={link.label}>
                    {link.icon}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
      </div>
  );
}
