import styles from "./createEventModal.module.css";
import useForm from "../../../../hooks/useForm.js";
import FormUtil from "../../../../utils/formUtil.js";
import ObjectUtil from "../../../../utils/objectUtil.js";

export default function CreateEventModal({ onSubmitHandler, roles }) {
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
    ...formUtil.formKeys({ formKeys, empty: true }),
    contractType: "fullTime",
    positions: { ...objectUtil.reduceToObj(roles, false) },
  };

  const { formData, onChange, onSubmit } = useForm(
    initialValues,
    onSubmitHandler
  );
  return (
    <div className={styles["modal-content"]}>
      <h2> Create Event </h2>
      <form className={styles['form']} onSubmit={onSubmit}>
        <div className={styles["form-container"]}>
          <div className="input-div">
            <label htmlFor="name">Event Name</label>
            <input
              onChange={onChange}
              type="text"
              value={formData[formKeys.name]}
              name="name"
              required
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
                  onChange={(e) => onChange(e, {key: 'positions', useProp: 'checked'})}
                  type="checkbox"
                  checked={formData[formKeys.positions][role]}
                  name={role}
                />
              </div>
            ))}
          </div>
        </div>
        <button className={styles["submit-btn"]}>Create Event</button>
      </form>
    </div>
  );
}
