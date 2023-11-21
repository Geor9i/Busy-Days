import styles from "./profileModal.module.css";
import useForm from "../../../../hooks/useForm.js";

export default function ProfileModal({ onSubmitHandler }) {
  const valueKeys = {
    FirstName: "firstName",
    LastName: "lastName",
    PhoneNumber: "phoneNumber",
    Email: "email",
    ContractType: "contractType",
  };

  const initialValues = {
    [valueKeys.FirstName]: "",
    [valueKeys.LastName]: "",
    [valueKeys.PhoneNumber]: "",
    [valueKeys.Email]: "",
    [valueKeys.ContractType]: "fullTime",
  };

  const { values, onChange, onSubmit } = useForm(initialValues, onSubmitHandler);

  return (
    <div className={styles["modal-content"]}>
      <h2> Create Employee </h2>
      <form onSubmit={onSubmit}>
        <div className={styles["form-container"]}>
          <div className="input-div">
            <label htmlFor="firstName">First Name</label>
            <input
              onChange={onChange}
              type="text"
              placeholder="First Name"
              value={values[valueKeys.FirstName]}
              name="firstName"
              required
            />
          </div>

          <div className="input-div">
            <label htmlFor="lastName">Last Name</label>
            <input
              onChange={onChange}
              value={values[valueKeys.LastName]}
              type="text"
              placeholder="Last Name"
              name="lastName"
              required
            />
          </div>
          <div className="input-div">
            <label htmlFor="phoneNumber">Phone Number</label>

            <input
              onChange={onChange}
              value={values[valueKeys.PhoneNumber]}
              type="tel"
              placeholder="Phone Number"
              name="phoneNumber"
            />
          </div>
          <div className="input-div">
            <label htmlFor="email">Email</label>

            <input
              onChange={onChange}
              value={values[valueKeys.Email]}
              type="text"
              placeholder="Email"
              name="email"
            />
          </div>
        </div>
        <div className={styles["select-container"]}>
          <label htmlFor="contractType">
            <strong>Contract type</strong>
          </label>
          <select
            name="contractType"
            id="contractType"
            onChange={onChange}
            value={values[valueKeys.ContractType]}
          >
            <option value="fullTime">Full-Time</option>
            <option value="partTime">Part-Time</option>
            <option value="overTime">Full-time + Overtime</option>
            <option value="student">Student</option>
          </select>
        </div>

        <h2>Select Job roles</h2>
        <div className={styles["role-selector-container"]}>
          <div className={styles["role-list"]}>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input
                onChange={onChange}
                type="checkbox"
                value="ARGM"
                name="ARGM"
              />
            </div>
          </div>
        </div>
        <button className={styles["submit-btn"]}>Create Employee</button>
      </form>
    </div>
  );
}
