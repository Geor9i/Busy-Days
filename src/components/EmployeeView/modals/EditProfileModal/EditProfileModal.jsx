import styles from "./editProfileModal.module.css";
import useForm from "../../../../hooks/useForm.js";
import FormUtil from "../../../../utils/formUtil.js";
import ObjectUtil from "../../../../utils/objectUtil.js";
import deleteIcon from "../../../../assets/delete_user.png";

export default function EditProfileModal({ onSubmitHandler, roles, data }) {
  const formUtil = new FormUtil();
  const objectUtil = new ObjectUtil();

  const formKeys = formUtil.formKeys({
    formKeys: [
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
      "contractType",
      "positions",
    ],
  });

  const initialValues = {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    email: data.email,
    contractType: data.contractType,
    positions: {
      ...objectUtil.reduceToObj(roles, false),
      ...objectUtil.reduceToObj(data.positions, true),
    },
  };
  console.log(initialValues);

  const { formData, onChange, onSubmit } = useForm(
    initialValues,
    onSubmitHandler
  );
  return (
    <div className={styles["modal-content"]}>
      <div className={styles["edit-modal-header"]}>
        <h2> Edit Employee </h2>
        <div className={styles["delete-employee-btn-container"]}>
          <div className={styles["delete-employee-btn"]}>
            <img src={deleteIcon} />
          </div>
        </div>
      </div>
      <form className={styles["form"]} onSubmit={(e) => onSubmit(e, id)}>
        <div className={styles["form-container"]}>
          <div className="input-div">
            <label htmlFor="firstName">First Name</label>
            <input
              onChange={onChange}
              type="text"
              placeholder="First Name"
              value={formData[formKeys.firstName]}
              name="firstName"
              required
            />
          </div>

          <div className="input-div">
            <label htmlFor="lastName">Last Name</label>
            <input
              onChange={onChange}
              value={formData[formKeys.lastName]}
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
              value={formData[formKeys.phoneNumber]}
              type="tel"
              placeholder="Phone Number"
              name="phoneNumber"
            />
          </div>
          <div className="input-div">
            <label htmlFor="email">Email</label>

            <input
              onChange={onChange}
              value={formData[formKeys.email]}
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
            value={formData[formKeys.contractType]}
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
            {roles.map((role) => (
              <div key={role} className={styles["role-list-item"]}>
                <label htmlFor={role}>{role}</label>
                <input
                  onChange={(e) =>
                    onChange(e, { key: "positions", useValue: "checked" })
                  }
                  type="checkbox"
                  checked={formData[formKeys.positions][role]}
                  name={role}
                />
              </div>
            ))}
          </div>
        </div>
        <button className={styles["submit-btn"]} id="submit-edit-btn">Edit Details</button>
      </form>
    </div>
  );
}
