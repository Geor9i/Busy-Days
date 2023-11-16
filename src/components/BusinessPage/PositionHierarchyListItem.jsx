import { useState } from "react";

const PositionHierarchyListItem = ({
  styles,
  position,
  changeHandler,
  index,
  positions,
  showModal,
}) => {
  const substitutionsHandler = (e) => {
    e.preventDefault();
    const startPosition = position.position;
    let positionIndex;
    const positionArr = positions
      .reverse()
      .map((pos, i) => {
        let currentPosition = pos.position;
        if (startPosition === currentPosition) {
          positionIndex = i;
        } else if (i > positionIndex) {
          return currentPosition;
        }
        return "";
      })
      .filter((el) => el !== "");
    showModal(e, { data: positionArr, index });
  };

  return (
    <>
      <tr>
        <td className={styles["role-hierarchy-td-role"]}>
          <input
            type="text"
            name="position"
            value={position.position}
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
            className={styles["add-additional-role"]}
            disabled={position.canSubstitute ? false : true}
            onClick={substitutionsHandler}
          >
            Edit
          </button>
        </td>
      </tr>
    </>
  );
};
export default PositionHierarchyListItem;
