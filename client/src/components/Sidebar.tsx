"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    onToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({ onToggle }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };

    return (
        <>
            <button
                className={styles.toggleButton}
                onClick={toggleSidebar}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? "←" : "→"}
            </button>
            <div
                className={`${styles.sidebar} ${
                    isOpen ? "" : styles.collapsed
                }`}
            >
                <div className={styles.sidebarContent}>
                    <h2>Sidebar</h2>
                    <nav>
                        <ul>
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <Link href="/about">About</Link>
                            </li>
                            <li>
                                <Link href="/main">Main</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
