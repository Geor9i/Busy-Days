import styles from "./UserNav.module.css";
import { Routes, Route, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";


const UserNav = () => {
  const navigate = useNavigate();

  const [menuState, setMenuState] = useState({
    user: false,
    app: false
  })

  const menuHandler = (menuName) => {
    setMenuState(state => ({...state, [menuName]: !state[menuName]}))
    console.log(menuState);
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
    <>
      <div className={styles['menu-button']} onClick={() => menuHandler('app')}>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
      </div>

      <div className={styles["side-menu-container"]}></div>
      <div className={styles[menuState.app ? "side-menu-active" : "side-menu"]}>
        <nav className={styles["nav"]}>
          <div className={styles["home-button"]}>
            <Link className={styles["link-home"]} to="/">
              Busy Days
            </Link>
          </div>
          <a href="/performance-tracker">Scheduler</a>
          <a href="/team-members">Roster</a>
        </nav>
      </div>

      <div className={styles["user-menu-container"]}>
        <div className={styles["user-menu-nav"]} onClick={() => menuHandler('user')}>
          <h4></h4>
        </div>
        <div className={styles[menuState.user ? "user-menu inactive" : "user-menu"]}>
          <div className={styles["user-menu-email-container"]}>
            <h4></h4>
          </div>
          <div className={styles["user-menu-account-container"]}>
            <Link className={styles["link"]} to="/members">
              Members
            </Link>
            <Link className={styles["link"]} to="/account">
              Account
            </Link>
            <Link className={styles["link"]} to="/business">
              Business
            </Link>
            <Link className={styles["link"]} onClick={logoutHandler}>
              Logout
            </Link>
          </div>
        </div>
      </div>
      <div className={styles["user-menu-cover"]}></div>
    </>
  );
};

export default UserNav;
