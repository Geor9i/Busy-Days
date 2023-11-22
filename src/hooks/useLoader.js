import { useState } from "react";
import ScreenLoader from "../components/misc/ScreenLoader/ScreenLoader.jsx";

export default function UseLoader(initialState) {

    const [isLoading, setLoading] = useState(initialState);

    return {isLoading, setLoading, ScreenLoader}
} 


