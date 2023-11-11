import styles from './footer.module.css'

const Footer = () => {
    return (
        <footer className={styles["footer-container"]}>

            <h3 className={styles['contact-us']}>Contact us</h3>
            <h3 className={styles['about-us']}>About us</h3>

        </footer>
    )
}

export default Footer;