import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <Link href="/" className={styles.secondary}>
                Back to Home
            </Link>
            <Link href="/about" className={styles.secondary}>
                Go to About
            </Link>
        </>
    );
}
