import useForm from "../../../hooks/useForm.js";
import EmployeeTools from "../../../lib/employeeTools.js";
import styles from "./shiftModal.module.css";

export default function ShiftModal({ data, handler, positionHierarchy }) {
  const empTools = new EmployeeTools();
  const initialValues = {
    startTime: "",
    endTime: "",
    position: "",
  };
  const availablePositions = empTools.getCurrentEmployeePositions(
    positionHierarchy,
    data.positions
  );
  console.log(availablePositions);
  const { formData, onSubmit, onChange } = useForm(initialValues, handler);

  return (
    <div className={styles["shift-container"]}>
      <h4>Select Shift Times</h4>
      <div className={styles["shift-input-main-container"]}>
        <div className={styles["shift-input-container"]}>
          <label htmlFor="startTime">Start</label>
          <input
            value={formData.startShift}
            onChange={onChange}
            type="text"
            name="startTime"
          />
        </div>
        <div className={styles["shift-input-container"]}>
          <label htmlFor="endTime">End</label>
          <input
            value={formData.endShift}
            onChange={onChange}
            type="text"
            name="endTime"
          />
        </div>
      </div>

      <div className={styles["shift-select-main-container"]}>
        <label htmlFor="position">Position</label>
        <select value={formData.position} onChange={onChange} name="position">
          {data.positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <div className={styles["confirm-btn-container"]}>
        <button className={styles["confirm-btn"]}>Confirm</button>
      </div>
    </div>
  );
}
