import styles from "./addSubstitutesModal.module.css";

const AddSubstitutesModal = ({ positions, displayModal, handler, index }) => {

  const getFormData = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formDataObject = Object.fromEntries(formData);
    const positionsArray = Object.keys(formDataObject);
      handler({data: positionsArray, index})
  }

  console.log("positions: ", positions);
  return (
    <>
      <form onSubmit={getFormData} className={styles["modal-container"]}>
        <div className={styles["list-container"]}>
          {positions && positions.length > 0 ? (
            <ul>
              {positions.map((pos) => (
                <li key={pos}>
                  <div className={styles["list-item-container"]}>
                    <p>{pos}</p>
                    <input type="checkbox" name={pos} />
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
        {positions && positions.length > 0 ? (
          <button className={styles["confirm-btn"]}>
            Confirm
          </button>
        ) : (
          <button
            className={styles["confirm-btn"]}
            onClick={(e) => displayModal(e)}
          >
            Exit
          </button>
        )}
      </form>
      <div
        className={styles["backdrop"]}
        onClick={(e) => displayModal(e)}
      ></div>
    </>
  );
};
export default AddSubstitutesModal;
