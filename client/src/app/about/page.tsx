import styles from '../page.module.css';
import Link from 'next/link';

export default function About() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>About Page</h1>
        <p>This is the about page of our Next.js application.</p>
        <div className={styles.ctas}>
          <Link href="/" className={styles.secondary}>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}