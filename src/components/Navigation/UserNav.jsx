import styles from './homeNav.module.css'
import { Routes, Route, Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import {
    getAuth,
    signOut,
  } from "firebase/auth";

const UserNav = () => {
    const navigate = useNavigate();

    const logoutHandler = (e) => {
        e.preventDefault();
        const auth = getAuth();
        signOut(auth)
        .then(() => {
            navigate('/');
        })
        .catch(err => console.log(`Logout Error: ${err}`))
    }

    return (
        <>
        <nav>
            <ul className={styles['home-nav']}>
                <li className={styles['home-button']}><Link  className={styles['link-home']} to="/">Busy Days</Link></li>
                <div className={styles['link-holder']}>
                    <li><Link  className={styles['link']} to="/members">Members</Link></li>
                    <li><Link  className={styles['link']} to="/account">Account</Link></li>
                    <li><Link  className={styles['link']} to="/business">Business</Link></li>
                    <li><button  className={styles['link']} onClick={logoutHandler}>Logout</button></li>
                </div>
            </ul>

        </nav>
        </>
    )
}

export default UserNav;
