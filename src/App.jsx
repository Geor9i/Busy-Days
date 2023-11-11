import { useState } from "react";
import styles from "./app.module.css";
import HomeNav from "./components/Navigation/homeNav.jsx";
import Footer from "./components/Footer/Footer.jsx";
import './styles.css'
function App() {
  return (
    <>
      <HomeNav />
      <Footer/>
    </>
  );
}

export default App;
