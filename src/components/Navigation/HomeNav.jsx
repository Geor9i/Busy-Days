import styles from './homeNav.module.css'

const HomeNav = () => {
    return (
        <>
        <nav>
            <ul className={styles['home-nav']}>
                <li className={styles['home-button']}><a  className={styles['link-home']} href="/">Busy Days</a></li>
                <div className={styles['link-holder']}>
                    <li><a  className={styles['link']} href="/electronics">Members</a></li>
                    <li><a  className={styles['link']} href="/users/login">Login</a></li>
                    <li><a  className={styles['link']} href="/users/register">Sign Up</a></li>
                </div>
            </ul>

        </nav>
        </>
    )
}

export default HomeNav;
