import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import styles from "./app.module.css";
import "./styles.css";
import { GlobalCtx } from "./contexts/GlobalCtx.js";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseConfig.js";

import GuestNav from "./components/Navigation/GuestNav.jsx";
import UserNav from "./components/Navigation/UserNav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import GuestContent from "./components/GuestHome/GuestContent.jsx";
import Members from "./components/Members/Members.jsx";
import LoginPage from "./components/Login/loginPage.jsx";
import SignUpPage from "./components/SignUp/SignUpPage.jsx";
import NotFound from "./components/Errors/NotFound.jsx";
import BusinessPage from "./components/BusinessPage/BusinessPage.jsx";
import ScreenLoader from "./components/misc/ScreenLoader/ScreenLoader.jsx";
import EmployeeView from "./components/EmployeeView/EmployeeView.jsx";
import FirebaseService from "./services/firebaseService.js";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    business: null,
    roster: null,
    events: null,
  });

  const app = initializeApp(firebaseConfig);
  const fireService = new FirebaseService(app);
  const auth = fireService.auth;

  //Handle authentication changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      //load all user data
      if (user) {
        fireService.fetchData(userData)
        .then(response => setUserData(response))
        .catch(err => console.log('DB error: ', err))
        .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (isLoading) {
    return (
      <main className={styles["main"]}>
        <ScreenLoader />
      </main>
    );
  }
  return (
    <GlobalCtx.Provider value={{ fireService, setLoading, userData }}>
      {user ? <UserNav user={user} /> : <GuestNav />}

      <main className={styles["main"]}>
        <Routes>
          <Route path="/" element={<GuestContent />} />
          <Route path="/members" element={<Members />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/account" element={<Members />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/employee-view" element={<EmployeeView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </GlobalCtx.Provider>
  );
}

export default App;
