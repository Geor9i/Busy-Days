import styles from "./profileModal.module.css";

export default function ProfileModal({ onSubmit }) {
  return (
    <div className={styles["modal-content"]}>
      <h2> Create Employee </h2>
      <form onSubmit={onSubmit}>
        <div className={styles["form-container"]}>
          <div className="input-div">
            <label htmlFor="firstName">First Name</label>
            <input type="text" placeholder="First Name" name="firstName" required/>
          </div>

          <div className="input-div">
          <label htmlFor="lastName">Last Name</label>
            <input type="text" placeholder="Last Name" name="lastName" required />
          </div>
          <div className="input-div">
          <label htmlFor="phoneNumber">Phone Number</label>

            <input type="tel" placeholder="Phone Number" name="phoneNumber" />
          </div>
          <div className="input-div">
          <label htmlFor="email">Email</label>

            <input type="text" placeholder="Email" name="email" />
          </div>
        </div>
        <div className={styles["select-container"]}>
          <label htmlFor="contractType">Contract type</label>
          <select
            name="contractType"
            defaultValue="Contract Type"
            id="contractType"
          >
            <option value="fullTime">Full-Time</option>
            <option value="fullTime">Part-Time</option>
            <option value="fullTime">Full-time + Overtime</option>
            <option value="fullTime">Student</option>
          </select>
        </div>

        <h2>Select Job roles</h2>
        <div className={styles["role-selector-container"]}>
          <div className={styles["role-list"]}>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
            <div className={styles["role-list-item"]}>
              <label htmlFor="ARGM">ARGM</label>
              <input type="checkbox" name="ARGM" />
            </div>
          </div>
        </div>
        <button className={styles["submit-btn"]}>Create Employee</button>
      </form>
    </div>
  );
}
