import useForm from "../../../hooks/useForm.js";
import StringUtil from "../../../utils/stringUtil.js";
import TimeUtil from "../../../utils/timeUtil.js";
import styles from "./shiftModal.module.css";

export default function ShiftModal({ data, handler, shiftData, weekday }) {
  const timeUtil = new TimeUtil();
  const stringUtil = new StringUtil();
  const initialPosition = data.positions[0]
  const initialValues = {
    startTime: shiftData.startTime ? shiftData.startTime : "",
    endTime: shiftData.endTime ? shiftData.endTime : "",
    position: shiftData.position ? shiftData.position : initialPosition,
     
  };
  const { formData, onSubmit, onChange, onBlur } = useForm(
    initialValues,
    handler
  );
  const filterTime = (value) =>
    stringUtil.filterString(value, {
      regexSymbols: "d:",
      keep: true,
    });
  const callbackArr = [filterTime, timeUtil.time().toTimeFormat];
  const blurCallbackArr = [
    timeUtil.time().fillTime,
    timeUtil.time().toTimeFormat,
  ];

  return (
    <form
      onSubmit={(e) => onSubmit(e, { empData: { ...data }, weekday })}
      className={styles["shift-container"]}
    >
      <h4>Select Shift Times</h4>
      <div className={styles["shift-input-main-container"]}>
        <div className={styles["shift-input-container"]}>
          <label htmlFor="startTime">Start</label>
          <input
            value={formData.startTime}
            autoFocus
            maxLength={5}
            onChange={(e) => onChange(e, { callbackArr })}
            onBlur={(e) => onBlur(e, { callbackArr: blurCallbackArr })}
            type="text"
            name="startTime"
          />
        </div>
        <div className={styles["shift-input-container"]}>
          <label htmlFor="endTime">End</label>
          <input
            value={formData.endTime}
            maxLength={5}
            onBlur={(e) => onBlur(e, { callbackArr: blurCallbackArr })}
            onChange={(e) => onChange(e, { callbackArr })}
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
    </form>
  );
}
