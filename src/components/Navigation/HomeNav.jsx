import styles from './homeNav.module.css'
import { Routes, Route, Link } from "react-router-dom";

const HomeNav = () => {
    return (
        <>
        <nav>
            <ul className={styles['home-nav']}>
                <li className={styles['home-button']}><Link  className={styles['link-home']} to="/">Busy Days</Link></li>
                <div className={styles['link-holder']}>
                    <li><Link  className={styles['link']} to="/members">Members</Link></li>
                    <li><Link  className={styles['link']} to="/login">Login</Link></li>
                    <li><Link  className={styles['link']} to="/register">Sign Up</Link></li>
                </div>
            </ul>

        </nav>
        </>
    )
}

export default HomeNav;
