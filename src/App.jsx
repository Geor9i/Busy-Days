import { useState, useEffect } from "react";
import styles from "./app.module.css";
import HomeNav from "./components/Navigation/HomeNav.jsx";
import UserNav from "./components/Navigation/UserNav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import "./styles.css";
import GuestContent from "./components/GuestHome/GuestContent.jsx";
import { Routes, Route, Link } from "react-router-dom";
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
  let [user, setUser] = useState(null);
  const auth = getAuth();
console.log(user);

useEffect(() => {
  auth.onAuthStateChanged((user) => {
    setUser(user);
  });

  // Cleanup the subscription when the component unmounts
}, [auth]);


  return (
    <div className={styles['app-container']}>
      {user ? <UserNav /> : <HomeNav />}

      <div className={styles['content']}>
      <Routes>
        <Route path="/" element={<GuestContent />} />
        <Route path="/members" element={<Members />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
