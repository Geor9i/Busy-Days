import styles from "./guestNav.module.css";
import { Routes, Route, Link } from "react-router-dom";
import logo from '../../assets/logo.png'

const GuestNav = () => {
  return (
    <>
      <nav className={styles["home-nav"]}>
          <div className={styles["home-btn-container"]}>
              <Link className={styles["link-home"]} to="/">
                {/* <img className={styles['logo']} src={logo} alt="logo" /> */}
                Busy Days
              </Link>
          </div>
          <div className={styles["side-link-holder"]}>
              <Link className={styles["link"]} to="/clients">
                Clients
              </Link>
              <Link className={styles["link"]} to="/login">
                Login
              </Link>
              <Link className={styles["link"]} to="/sign-up">
                Sign Up
              </Link>
          </div>
      </nav>
    </>
  );
};

export default GuestNav;
