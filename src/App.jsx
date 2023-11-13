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

// Initialize Firebase
initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Set loading to false once the authentication check is complete
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [auth]);

  if (isLoading) {
    // Show a loading indicator or a splash screen while checking authentication
    return <div>Loading...</div>;
  }

  return (
    <>
    {user ? <UserNav user={user} /> : <GuestNav />}

   <main className={styles['main']}>
        <Routes>
          <Route path="/" element={<GuestContent />} />
          <Route path="/members" element={<Members />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      </>
  );
}

export default App;
