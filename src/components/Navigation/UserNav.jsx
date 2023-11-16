import styles from "./userNav.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";


const UserNav = ({user, back}) => {
  const navigate = useNavigate();

  const [menuState, setMenuState] = useState({
    user: false,
    app: false
  })
  const menuHandler = (menuName) => {
    setMenuState(state => ({...state, [menuName]: !state[menuName]}))
  }

  const logoutHandler = (e) => {
    e.preventDefault();
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((err) => console.log(`Logout Error: ${err}`));
  };

  return (
    <div className={styles['user-nav']}>
      <div className={styles['menu-button']} onClick={() => menuHandler('app')}>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
      </div>

      <div className={`${styles["side-menu-backdrop"]} ${menuState.app ? styles["side-menu-backdrop-active"] : ""}`} onClick={() => setMenuState('app')}></div>
      <div className={`${styles['side-menu']} ${menuState.app ? styles['side-menu-active'] : ''}`} onClick={() => setMenuState('app')}>
        <nav className={styles["nav"]}>
          <div className={styles["home-button"]}>
            <Link className={styles["link-home"]} to="/">
              Busy Days
            </Link>
          </div>
          <Link className={styles["link"]} to="/scheduler">
          Scheduler
            </Link>
          <Link className={styles["link"]} to="/roster">
          Roster
            </Link>
          <Link className={styles["link"]} to="/members">
              Members
            </Link>
        </nav>
      </div>

      <div className={`${styles["user-menu-backdrop"]} ${menuState.user ? styles['user-menu-backdrop-active'] : ''}`}  onClick={() => setMenuState('user')} ></div>
      <div className={styles["user-menu-container"]}>
        <div className={styles["user-menu-nav"]} onClick={() => menuHandler('user')}>
          <h4>{user.displayName.slice(0,1)}</h4>
        </div>
        <div className={`${styles['user-menu']} ${menuState.user ? '' : styles['inactive']}`}  onClick={() => setMenuState('user')}>
          <div className={styles["user-menu-email-container"]}>
            <h4>{user.email}</h4>
          </div>
          <div className={styles["user-menu-link-container"]}>
            <Link className={styles["link"]} onClick={logoutHandler}>
              Logout
            </Link>
          
            <Link className={styles["link"]} to="/account">
              Account
            </Link>
            <Link className={styles["link"]} to="/business">
              Business
            </Link>
          </div>
        </div>
      </div>
      </div>
  );
};

export default UserNav;
