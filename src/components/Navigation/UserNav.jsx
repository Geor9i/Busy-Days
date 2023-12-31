import styles from "./userNav.module.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { useContext } from "react";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";

const UserNav = ({ user, resetValues }) => {
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState({
    user: false,
    app: false,
  });
  const { setUserData } = useContext(GlobalCtx);
  const menuHandler = (menuName) => {
    setMenuState((state) => ({ ...state, [menuName]: !state[menuName] }));
  };

  const logoutHandler = (e) => {
    e.preventDefault();
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUserData(resetValues);
        navigate("/");
      })
      .catch((err) => console.log(`Logout Error: ${err}`));
  };

  return (
    <div className={styles["user-nav"]}>
      <div className={styles["menu-button"]} onClick={() => menuHandler("app")}>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
      </div>

      <div
        className={`${styles["side-menu-backdrop"]} ${
          menuState.app ? styles["side-menu-backdrop-active"] : ""
        }`}
        onClick={() => setMenuState("app")}
      ></div>
      <div
        className={`${styles["side-menu"]} ${
          menuState.app ? styles["side-menu-active"] : ""
        }`}
        onClick={() => setMenuState("app")}
      >
        <nav className={styles["nav"]}>
          <div className={styles["home-button"]}>
            <Link className={styles["link-home"]} to="/">
              Busy Days
            </Link>
          </div>
          <Link className={styles["link"]} to="/scheduler">
            Scheduler
          </Link>
          <Link className={styles["link"]} to="/employee-view">
            Employee View
          </Link>
        </nav>
      </div>

      <div
        className={`${styles["user-menu-backdrop"]} ${
          menuState.user ? styles["user-menu-backdrop-active"] : ""
        }`}
        onClick={() => setMenuState("user")}
      ></div>
      <div className={styles["user-menu-container"]}>
        <div
          className={styles["user-menu-nav"]}
          onClick={() => menuHandler("user")}
        >
          <h4>
            {user?.displayName
              ? user.displayName.slice(0, 1).toUpperCase()
              : user.email.slice(0, 1).toUpperCase()}
          </h4>
        </div>
        <div
          className={`${styles["user-menu"]} ${
            menuState.user ? "" : styles["inactive"]
          }`}
          onClick={() => setMenuState("user")}
        >
          <div className={styles["user-menu-email-container"]}>
            <h3>{user.displayName}</h3>
            <h4>{user.email}</h4>
          </div>
          <div className={styles["user-menu-link-container"]}>
            <div className={styles["account-links"]}>
              <Link className={styles["link-user"]} onClick={logoutHandler}>
                Logout
              </Link>

              <Link className={styles["link-user"]} to="/account">
                Account
              </Link>
            </div>
            <Link className={styles["link-user"]} to="/business">
              Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNav;
