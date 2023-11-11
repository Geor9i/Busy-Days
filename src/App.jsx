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

function App() {
  return (
    <div className="app-container">
      <HomeNav />
      <Routes>
        <Route path="/" element={<GuestContent />}></Route>
        <Route path="/members" element={<Members />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/sign-up" element={<SignUpPage />}></Route>
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
