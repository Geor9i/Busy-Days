import styles from './openingTimesTd.module.css'

export default function OpeningTimesTd ({weekday, handler, data, setLastKey, onBlur}) {
    return (
        <td className={styles["opening-times-td"]}>
        <div className={styles["opening-times-td-div"]}>
          <div className={styles["opening-times-window-container"]}>
            <div
              className={
                styles["opening-times-window-sub-container"]
              }
            >
              <div className={styles["time-window"]}>
                <label htmlFor={`startTime-${weekday}`}>open</label>
                <input
                  type="text"
                  id={`startTime-${weekday}`}
                  name={`startTime-${weekday}`}
                  value={data.startTime}
                  onKeyDown={(e) => setLastKey(e.key)}
                  onChange={handler}
                  onBlur={onBlur}
                />
              </div>
              <div className={styles["time-window"]}>
                <label htmlFor={`endTime-${weekday}`}>close</label>
                <input
                  type="text"
                  id={`endTime-${weekday}`}
                  name={`endTime-${weekday}`}
                  value={data.endTime}
                  onKeyDown={(e) => setLastKey(e.key)}
                  onChange={handler}
                  onBlur={onBlur}
                />
              </div>
            </div>
          </div>
        </div>
      </td>
    )
}

