import { useState, useEffect } from "react";
import useLoader from "./hooks/useLoader.js";
import { Routes, Route } from "react-router-dom";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseConfig.js";

import styles from "./app.module.css";
import "./styles.css";
import { GlobalCtx } from "./contexts/GlobalCtx.js";
import {
  BUSINESS_KEY,
  ROSTER_KEY,
  EVENTS_KEY,
} from "../config/constants.js";

import FirebaseService from "./services/firebaseService.js";
import ObjectUtil from "./utils/objectUtil.js";

import GuestNav from "./components/Navigation/GuestNav.jsx";
import UserNav from "./components/Navigation/UserNav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import GuestContent from "./components/GuestHome/GuestContent.jsx";
import LoginPage from "./components/Login/loginPage.jsx";
import SignUpPage from "./components/SignUp/SignUpPage.jsx";
import NotFound from "./components/Errors/NotFound.jsx";
import BusinessPage from "./components/BusinessPage/BusinessPage.jsx";
import EmployeeView from "./components/EmployeeView/EmployeeView.jsx";
import EventsView from "./components/EventsView/EventView.jsx";
import Clients from "./components/Clients/Clients.jsx";
import Account from "./components/Account/Account.jsx";
import SchedulerMenu from "./components/SchedulerMenu/SchedulerMenu.jsx";
import Scheduler from "./components/Scheduler/Scheduler.jsx";

const app = initializeApp(firebaseConfig);
const fireService = new FirebaseService(app);
const objectUtil = new ObjectUtil();

function App() {
  const [user, setUser] = useState(null);
  const {
    isLoading: isMainLoading,
    setLoading: setMainLoader,
    ScreenLoader,
  } = useLoader(true);

  const initialValues = {
    [BUSINESS_KEY]: {},
    [ROSTER_KEY]: {},
    [EVENTS_KEY]: {},
  };

  const [userData, setUserData] = useState(initialValues);
  //Handle authentication changes
  useEffect(() => {
    setMainLoader(true);
    const unsubscribe = fireService.auth.onAuthStateChanged((user) => {
      setUser(user);

      // load all user data
      if (user && objectUtil.isEmpty(userData)) {
        fireService
          .fetchData(userData)
          .then((response) => setUserData(response))
          .catch((err) => console.log("DB error: ", err))
          .finally(() => setMainLoader(false));
      }else {
        setMainLoader(false);
      }
    });

    return () => unsubscribe();
  }, [user]);
  console.log(userData);

  if (isMainLoading) {
    return (
      <main className={styles["main"]}>
        <ScreenLoader />
      </main>
    );
  }
  return (
    <GlobalCtx.Provider
      value={{
        fireService,
        setUserData,
        userData,
        setMainLoader,
        app
      }}
    >
      {user ? <UserNav user={user} resetValues={initialValues} /> : <GuestNav />}

      <main className={styles["main"]}>
        <Routes>
          <Route path="/" element={<GuestContent />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/scheduler-menu" element={<SchedulerMenu />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/employee-view" element={<EmployeeView />} />
          <Route path="/events-view" element={<EventsView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </GlobalCtx.Provider>
  );
}

export default App;
