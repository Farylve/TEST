import styles from '../page.module.css';
import Link from 'next/link';

export default function Main() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Main Page</h1>
        <p>This is the main page of our Next.js application.</p>
        <div className={styles.ctas}>
          <Link href="/" className={styles.secondary}>
            Back to Home
          </Link>
          <Link href="/about" className={styles.secondary}>
            Go to About
          </Link>
        </div>
      </main>
    </div>
  );
}