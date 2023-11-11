import { useState } from "react";
import styles from "./app.module.css";
import HomeNav from "./components/Navigation/homeNav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import "./styles.css";
import GuestContent from "./components/GuestHome/GuestContent.jsx";
import { Routes, Route, Link } from "react-router-dom";
import Members from "./components/Members/Members.jsx";
import LoginPage from "./components/Login/loginPage.jsx";
import SignUpPage from "./components/SignUp/SignUpPage.jsx";
import NotFound from "./components/Errors/NotFound.jsx";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8wCR98lowGhbXrN_bPuUw4D-WaenIbDQ",
  authDomain: "busy-dayz.firebaseapp.com",
  projectId: "busy-dayz",
  storageBucket: "busy-dayz.appspot.com",
  messagingSenderId: "668014678034",
  appId: "1:668014678034:web:040b52eec494c72c15c8cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function App() {
  return (
    <div className="app-container">
      <HomeNav />
      <Routes>
        <Route path="/" element={<GuestContent />} />
        <Route path="/members" element={<Members />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
