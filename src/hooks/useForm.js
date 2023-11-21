import { useState } from "react";

export default function useForm(initialValues, submitHandler) {
  const [formData, setFormData] = useState(initialValues);

  const onChange = (e, { key = null, useValue = null } = {}) => {
    let { name, value } = e.target;
    if (key) {
      if (useValue) {
        const customValue = e.target[useValue];
        setFormData((state) => ({
          ...state,
          [key]: { ...state[key], [name]: customValue },
        }));
      }
      return
    }

    setFormData((state) => ({ ...state, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    submitHandler({ e, formData });
  };

  return { formData, onChange, onSubmit };
}
