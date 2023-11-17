import { useState, useEffect } from "react";
import styles from "./app.module.css";
import GuestNav from "./components/Navigation/GuestNav.jsx";
import UserNav from "./components/Navigation/UserNav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import "./styles.css";
import GuestContent from "./components/GuestHome/GuestContent.jsx";
import { Routes, Route } from "react-router-dom";
import Members from "./components/Members/Members.jsx";
import LoginPage from "./components/Login/loginPage.jsx";
import SignUpPage from "./components/SignUp/SignUpPage.jsx";
import NotFound from "./components/Errors/NotFound.jsx";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../config/firebaseConfig.js";
import BusinessPage from "./components/BusinessPage/BusinessPage.jsx";
import ScreenLoader from "./components/misc/ScreenLoader/ScreenLoader.jsx";
import { getFirestore } from "firebase/firestore";
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [displayNameSet, setDisplayNameSet] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false); // Set loading to false once the authentication check is complete
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
    <>
      {user ? <UserNav user={user} /> : <GuestNav />}

      <main className={styles["main"]}>
        <Routes>
          <Route path="/" element={<GuestContent />} />
          <Route path="/members" element={<Members />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/account" element={<Members />} />
          <Route path="/business" element={<BusinessPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
