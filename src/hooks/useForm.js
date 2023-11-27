import { useState } from "react";
import ObjectUtil from "../utils/objectUtil.js";

export default function useForm(initialValues, submitHandler, confirmHandler) {
  const [formData, setFormData] = useState(initialValues);
  const objUtil = new ObjectUtil();

  const onChange = (e, { key = null, useProp = null, useValue } = {}) => {
    let { name, value } = e.target;
    if (key) {
      if (useProp) {
        const customValue = e.target[useProp];
        console.log(customValue);
        setFormData((state) => ({
          ...state,
          [key]: { ...state[key], [name]: customValue },
        }));
      return
    } 
  }
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

  return { formData, onChange, onSubmit };
}
