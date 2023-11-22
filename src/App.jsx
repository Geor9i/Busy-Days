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
import EmployeeView from "./components/EmployeeView/EmployeeView.jsx";
import FirebaseService from "./services/firebaseService.js";
import ObjectUtil from "./utils/objectUtil.js";
import useLoader from "./hooks/useLoader.js";
import useSessionState from "./hooks/useSessionState.js";

const app = initializeApp(firebaseConfig);
const fireService = new FirebaseService(app);
const objectUtil = new ObjectUtil();

function App() {
  const [user, setUser] = useState(null);
  const { isLoading, setLoading, ScreenLoader } = useLoader(true);

  const initialValues = {
    business: {},
    roster: {},
    events: {},
  };

  const [userData, setUserData] = useSessionState("userData", initialValues);
  //Handle authentication changes
  useEffect(() => {
    setLoading(true);
    const unsubscribe = fireService.auth.onAuthStateChanged((user) => {
      setUser(user);

      // load all user data
      if (user && objectUtil.isEmpty(userData)) {
        fireService
          .fetchData(userData)
          .then((response) => setUserData(response))
          .catch((err) => console.log("DB error: ", err))
          .finally(() => setLoading(false));
      } else if (!user){
        setUserData(initialValues, {reset: true})
        setLoading(false);
        console.log(userData);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  console.log(userData);

  if (isLoading) {
    return (
      <main className={styles["main"]}>
        <ScreenLoader />
      </main>
    );
  }
  return (
    <GlobalCtx.Provider
      value={{ fireService, setUserData, userData, setLoading }}
    >
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
