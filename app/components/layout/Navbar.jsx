'use client';
import { useState, useEffect } from 'react';

import { IoArrowBackSharp } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";
import { FaCut } from "react-icons/fa";
import { FaPaste } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";

export default function Navbar({ onBack, onCopy, onCut, onPaste, onAdd }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder with same dimensions during SSR
  if (!mounted) return <div className="h-7.5 w-full bg-[#f7f7f7]" />

  const toolbarLinks = [
    {
      icon: <IoArrowBackSharp />, 
      action: onBack, 
      label: 'Return',
    },
    {
      icon: <IoAdd />, 
      action: onAdd, 
      label: 'Add',
    },
    {
      icon: <FaCut />, 
      action: onCut, 
      label: 'Cut',
    },
    {
      icon: <FaCopy />, 
      action: onCopy, 
      label: 'Copy',
    },
    {
      icon: <FaPaste />, 
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
