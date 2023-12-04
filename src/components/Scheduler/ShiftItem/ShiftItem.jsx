import styles from "./shiftItem.module.css";

export default function ShiftItem({ data, shiftHandler, trStyles }) {
  function displayShift(shiftData) {
    if (shiftData.startTime !== "" && shiftData.endTime !== "") {
      return `${shiftData.startTime} - ${shiftData.endTime} | ${shiftData.position}`;
    }
    return "";
  }

  return (
    <div style={trStyles} className={styles["tr"]}>
      <div className={styles["td"]}>{data.name}</div>
      {data.shifts.map(([weekday, shiftData], i) => (
        <div
          key={i}
          onClick={(e) => {
            shiftHandler({ e, weekday, shiftData, empData: data });
          }}
          className={`${styles["td"]} ${styles["shift"]}`}
        >
          <p className={styles['shift-text']}>
          {displayShift(shiftData)}
          </p>
        </div>
      ))}
      <div className={styles["td"]}></div>
      <div className={styles["td"]}></div>
      <div className={styles["td"]}></div>
    </div>
  );
}
