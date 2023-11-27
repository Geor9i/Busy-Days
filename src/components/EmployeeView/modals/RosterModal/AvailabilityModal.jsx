import styles from "./availabilityModal.module.css";
import FormUtil from "../../../../utils/formUtil.js";
import ObjectUtil from "../../../../utils/objectUtil.js";
import DateUtil from "../../../../utils/dateUtil.js";
import StringUtil from "../../../../utils/stringUtil.js";
import { useState } from "react";

export default function AvailabilityModal({ onSubmitHandler, roles }) {
  const [page, setPage] = useState("availability");
  const [priority, setPriority] = useState("strict");

  const formUtil = new FormUtil();
  const objectUtil = new ObjectUtil();
  const stringUtil = new StringUtil();
  const dateUtil = new DateUtil();
  const weekdays = dateUtil
    .getWeekdays([])
    .map((day) => stringUtil.toPascalCase(day));

  function changePage(e) {
    const id = e.currentTarget.id;
    setPage(id);
  }

  function changePriority(e) {
    const id = e.currentTarget.id;
    setPriority(id);
  }

  const highlightedPageStyle = {
    backgroundColor: "rgb(0, 255, 255)",
  };
  const highlightedPriorityStyle = {
    backgroundColor: "rgb(255, 255, 255)",
    border: "2px inset white",
  };

  return (
    <div className={styles["modal-content"]}>
      <div className={styles["title-container"]}>
        <h2>Availability Manager</h2>
      </div>

      <div className={styles["category-setting-btn-container"]}>
        <div
          className={styles["category-setting-btn"]}
          style={page === "availability" ? highlightedPageStyle : {}}
          onClick={changePage}
          id="availability"
        >
          <h4>Availability</h4>
        </div>
        <div
          className={styles["category-setting-btn"]}
          style={page === "daysOff" ? highlightedPageStyle : {}}
          onClick={changePage}
          id="daysOff"
        >
          <h4>Days Off</h4>
        </div>
      </div>

      <div className={styles["main-content-container"]}>
        <div className={styles["availability-content-container"]}>
          <div className={styles["priority-setting-btn-container"]}>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["strict"]}`}
              style={priority === "strict" ? highlightedPriorityStyle : {}}
              onClick={changePriority}
              id="strict"
            >
              <h4>Strict</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["important"]}`}
              style={priority === "important" ? highlightedPriorityStyle : {}}
              onClick={changePriority}
              id="important"
            >
              <h4>Important</h4>
            </div>
            <div
              className={`${styles["priority-setting-btn"]} ${styles["optional"]}`}
              style={priority === "optional" ? highlightedPriorityStyle : {}}
              onClick={changePriority}
              id="optional"
            >
              <h4>Optional</h4>
            </div>
          </div>
          {page === "availability" ? (
            <div className={styles["availability-table-container"]}>
              <h4>Set availability time window</h4>
              <div className={styles["availability-table"]}>
                <div className={styles["availability-table-header"]}>
                  {weekdays.map((day) => (
                    <div
                      key={`${day}-header`}
                      className={styles["header-weekday"]}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className={styles["availability-table-body"]}>
                  {weekdays.map((day) => (
                    <div key={`${day}-body`} className={styles["body-weekday"]}>
                      <input maxLength={13} type="text" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles["days-off-content-container"]}>
              <div className={styles["days-off-category-content-container"]}>
                <div className={styles["days-off-select-content-container"]}>
                  <div className={styles["days-off-select-container"]}>
                    {weekdays.map((day) => (
                      <div
                        key={`${day}-day-off-selector`}
                        className={styles["day-off-weekday"]}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles["days-off-specifics-content-container"]}>
                  <div className={styles["days-off-specifics-content"]}>
                    <p>Minimum required days off</p>
                    <input type="text" className={styles["input-amount"]} />
                  </div>
                  <div className={styles["days-off-specifics-content"]}>
                    <p>Give Consecutive days</p>
                    <input
                      className={styles["checkbox-consecutive"]}
                      type="checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={styles["save-btn-container"]}>
            <button>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 *   <div className={styles["availability-content-container"]}>
            <div className={styles["priority-setting-btn-container"]}>
              <div
                className={`${styles["priority-setting-btn"]} ${styles["strict"]}`}
              >
                <h4>Strict</h4>
              </div>
              <div
                className={`${styles["priority-setting-btn"]} ${styles["important"]}`}
              >
                <h4>Important</h4>
              </div>
              <div
                className={`${styles["priority-setting-btn"]} ${styles["optional"]}`}
              >
                <h4>Optional</h4>
              </div>
            </div>

            <div className={styles["days-off-content-container"]}>
              <div className={styles["days-off-category-content-container"]}>
                <div className={styles["days-off-select-content-container"]}>
                  <div className={styles["days-off-select-container"]}>
                    {weekdays.map((day) => (
                      <div
                        key={`${day}-day-off-selector`}
                        className={styles["day-off-weekday"]}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
                  <div className={styles['days-off-specifics-content-container']}>
                      <div className={styles['days-off-specifics-content']}>
                        <p>Minimum required days off</p>
                        <input type="text" className={styles['input-amount']} />
                      </div>
                      <div className={styles['days-off-specifics-content']}>
                        <p>Give Consecutive days</p>
                        <input className={styles['checkbox-consecutive']} type="checkbox" />
                      </div>
                  </div>
              </div>

              <div className={styles["save-btn-container"]}>
                <button>Save</button>
              </div>
            </div>
          </div>
 */
