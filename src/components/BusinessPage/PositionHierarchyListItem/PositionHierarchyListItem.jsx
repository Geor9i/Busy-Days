import ObjectUtil from "../../../utils/objectUtil.js";
import styles from "./positionHierarchy.module.css";

const PositionHierarchyListItem = ({
  position,
  changeHandler,
  index,
  positions,
  displayModal,
}) => {
  const objUtil = new ObjectUtil();
  const substitutionsHandler = (e) => {
    e.preventDefault();
    const startPosition = position.title;
    let positionIndex;
    let positionsList = positions
      .reverse()
      .map((pos, i) => {
        let currentPosition = pos.title;
        if (startPosition === currentPosition) {
          positionIndex = i;
        } else if (i > positionIndex) {
          return currentPosition;
        }
        return "";
      })
      .filter((el) => el !== "")
      positionsList = objUtil.reduceToObj(positionsList, false);
      const substitutesObj = objUtil.reduceToObj(position.substitutes, true);
      const synchedData = {...positionsList, ...substitutesObj}
    displayModal(e, { data: synchedData, index });
  };

  return (
    <>
      <tr>
        <td className={styles["role-hierarchy-td-role"]}>
          <input
            type="text"
            name="title"
            value={position.title}
            onChange={(e) => changeHandler(e, index)}
          />
        </td>
        <td className={styles["role-hierarchy-td-select"]}>
          <select
            value={position.responsibility}
            name="responsibility"
            onChange={(e) => changeHandler(e, index)}
          >
            <option value="manager">management</option>
            <option value="staff">staff</option>
          </select>
        </td>
        <td className={styles["role-hierarchy-td-select"]}>
          <select
            value={position.canSubstitute}
            name="canSubstitute"
            onChange={(e) => changeHandler(e, index)}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </td>
        <td className={styles["role-hierarchy-td"]}>
          <input type="text" disabled value={position.substitutes} />
          <button
            className={`${
              position.canSubstitute
                ? styles["add-additional-role"]
                : styles["add-additional-role-disabled"]
            }`}
            disabled={position.canSubstitute ? false : true}
            onClick={substitutionsHandler}
          >
            Edit
          </button>
        </td>
        <td className={styles["role-hierarchy-td"]}>
          <button
            className={styles["insert-btn"]}
            onClick={(e) => changeHandler(e, index, { add: true })}
          >
            &#129145;
          </button>
          <button
            className={styles["delete-btn"]}
            onClick={(e) => changeHandler(e, index, { del: true })}
          >
            X
          </button>
        </td>
      </tr>
    </>
  );
};
export default PositionHierarchyListItem;
