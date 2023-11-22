import { useState } from "react";

export default function useSessionState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const persistedState = sessionStorage.getItem(key);
    if (persistedState) {
      return JSON.parse(persistedState)
    } else {
      sessionStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
  });

  const setPersistedState = (newValue, {reset = false} = {}) => {
    let isFunction = typeof newValue === "function";

    if (reset && !isFunction) {
      setState(newValue)
      sessionStorage.removeItem(key)
    }
    
    let resultState = isFunction ?  newValue(state) : newValue
    setState(resultState);
    sessionStorage.setItem(key, JSON.stringify(resultState));
  };

  return [state, setPersistedState];
}
