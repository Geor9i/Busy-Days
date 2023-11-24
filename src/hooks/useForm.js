import { useState } from "react";

export default function useForm(initialValues, submitHandler, confirmHandler) {
  const [formData, setFormData] = useState(initialValues);

  const onChange = (e, { key = null, useValue = null } = {}) => {
    let { name, value } = e.target;
    if (key) {
      if (useValue) {
        const customValue = e.target[useValue];
        console.log(customValue);
        setFormData((state) => ({
          ...state,
          [key]: { ...state[key], [name]: customValue },
        }));
      }
      return
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
