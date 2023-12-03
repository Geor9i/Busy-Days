import { useState } from "react";
import ObjectUtil from "../utils/objectUtil.js";

export default function useForm(initialValues, submitHandler, confirmHandler) {
  const [formData, setFormData] = useState(initialValues);
  const objUtil = new ObjectUtil();

  function applyCallbacks(callbackArr, value) {
   if (callbackArr.length <= 0) return value;
   for (let callbackFunc of callbackArr) {
    value = callbackFunc(value);
   }
    return value;
  }

  const onChange = (e, { key = null, useProp = null, useValue, callbackArr = [] } = {}) => {
    let { name, value } = e.target;
    if (key) {
      if (useProp) {
        const customValue = e.target[useProp];
        customValue = applyCallbacks(callbackArr, customValue);
        setFormData((state) => ({
          ...state,
          [key]: { ...state[key], [name]: customValue },
        }));
      return
    } 
  }
    value = applyCallbacks(callbackArr, value)
    setFormData((state) => ({ ...state, [name]: value }));
  };

  const onBlur = (e, { callbackArr = [] } = {}) => {
    let { name, value } = e.target;
    value = applyCallbacks(callbackArr, value)
    setFormData((state) => ({ ...state, [name]: value }));
  };

  const onSubmit = async(e, paramObj) => {
    e.preventDefault();
    if (confirmHandler) {
      try {
        const hasConfirmed = await Promise.resolve(confirmHandler());
  
        if (!hasConfirmed) {
          console.log('Confirmation rejected');
          return;
        }
      } catch (error) {
        console.error('Error in confirmHandler:', error);
        return;
      }
    }
    submitHandler({ e, formData, ...paramObj });
  };

  return { formData, onChange, onSubmit, onBlur };
}
