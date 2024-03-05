import styles from "../styles/index.module.css";

export default function Home() {
  return (
    <div>
      <header className={styles.site_header}>
        <nav className={styles.index_nav}>
          <div className="logo">
            <h1 className={styles.logo_header}>E-Vote</h1>
          </div>
        </nav>
        <section className={styles.index_section}>
          <div className={styles.leftside}>
            <img className={styles.leftside_img} src="home_page.png" />
          </div>
          <div className={styles.rightside}>
            <h1 className={styles.rightside_header}>VOTE!</h1>
            <p className={styles.rightside_paragraph}>
              LET YOUR VOICE BE HEARD!
            </p>
            <a href="/admin">
              <button className={styles.rightside_button}>ADMIN LOGIN</button>
            </a>
            <a href="/election">
              <button className={styles.rightside_button}>DASHBOARD</button>
            </a>
          </div>
        </section>
      </header>
    </div>
  );
}
