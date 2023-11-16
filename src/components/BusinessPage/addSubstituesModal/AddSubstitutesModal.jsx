import styles from "./addSubstitutesModal.module.css";
const AddSubstitutesModal = ({ positions, handler }) => {
  console.log("positions: ", positions);
  return (
    <>
      <div className={styles["modal-container"]}>
        <div className={styles["list-container"]}>
          {positions && positions.length > 0 ? (
            <ul>
              {positions.map((pos) => (
                <li>
                  <div className={styles["list-item-container"]}>
                    <p>{pos}</p>
                    <input type="checkbox" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles["list-center"]}>
              <p> There are no higher positions available!</p>
            </div>
          )}
        </div>
        <button className={styles["confirm-btn"]}>Confirm</button>
      </div>
      <div className={styles["backdrop"]} onClick={() => handler()}></div>
    </>
  );
};
export default AddSubstitutesModal;
