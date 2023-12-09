import StringUtil from "../../../utils/stringUtil.js";
import styles from "./messageListitem.module.css";

export default function MessageListItem({name, id, weekday, message}) {
  const stringUtil = new StringUtil()
  return (
    <>
     
      <div className={styles["list-item-container"]}>
        <div className={styles["message-td"]}>
          <p>{stringUtil.toPascalCase(weekday)}</p>
        </div>
        <div className={styles["message-td"]}>
          <p>{name}</p>
        </div>
        <div className={styles["message-td"]}>
          <p>{message}</p>
        </div>
      </div>
    </>
  );
}
