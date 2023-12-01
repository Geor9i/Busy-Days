import { useEffect, useState } from "react";
import styles from "./employeeListItem.module.css";
import icon from "../../assets/userIcon_transparent.png";
import DateUtil from "../../utils/dateUtil.js";
import EmployeeTools from "../../lib/employeeTools.js";

export default function EmployeeListItem({
  data,
  id,
  detailsHandler,
  editModalHandler,
  availabilityHandler,
}) {
  const dateUtil = new DateUtil();
  const empTools = new EmployeeTools();
  const weekdays = dateUtil.getWeekdays([]);
  const [onDisplay, setDisplay] = useState(false);
  const [style, setStyle] = useState({
    backgroundColor: "",
  });
  const [availability, setAvailability] = useState({
    strict: [],
    important: [],
    optional: [],

  });

  useEffect(() => {
    
    const availability = empTools.calcAvailabilityArr(data.availability)
    setAvailability({
      strict: availability?.strict ? availability.strict : null,
      important: availability?.important ? availability.important : null,
      optional: availability?.optional ? availability.optional : null,
    });
  }, [data]);

  const showEmployeeDetails = () => {
    setDisplay((state) => !state);
    detailsHandler(!onDisplay, id);
    if (!onDisplay) {
      setStyle({ backgroundColor: "#befcff" });
    } else {
      setStyle({ backgroundColor: "" });
    }
  };
  /**
     * Rita: {
    firstName: "Rita",
    surname: "Sunuwar",
    positions: ["SR"],
    contractType: "overtime",
    availability: {
      "14:00 - close": { important: ["m", "t", "w", "th", "f", "su"] },
      "12:00 - close": { strict: ["m", "t", "w", "th", "f", 's', "su"] },
    },
    daysOff: { strict: ["s"] },
    minHours: { strict: "53:00" },
  },
     */

 
  return (
    <>
      <div
        onClick={showEmployeeDetails}
        className={styles["employee-list-item"]}
        style={style}
      >
        <div className={styles["content-cell"]}>{data.firstName}</div>
        <div className={styles["content-cell"]}>{data.lastName}</div>
        <div className={styles["content-cell"]}>{empTools.contractTypeFormat(data.contractType)}</div>
        <div className={styles["content-cell"]}>
          {data.positions.join(", ")}
        </div>
        <div className={styles["content-cell"]}>
          {dateUtil.op().fromISO(data.createdOn)}
        </div>
        <div className={styles["content-cell"]}>
          {dateUtil.op().fromISO(data.updatedOn)}
        </div>
      </div>

      <div className={styles["employee-details"]}>
        <div
          className={`${styles["employee-details-content-container"]} ${
            onDisplay ? "" : styles["collapse"]
          }`}
        >
          <div className={styles["employee-details-content"]}>
            <div className={styles["employee-header"]}>
              <div className={styles["employee-personal-details"]}>
                <div className={styles["user-icon-container"]}>
                  <img src={icon} className={styles["user-icon"]} />
                </div>
                <button
                  onClick={(e) => editModalHandler({ e, oldData: data, id })}
                  id="edit-profile-btn"
                  className={styles["edit-profile-btn"]}
                >
                  Manage Employee
                </button>
              </div>
              <div className={styles["employment-details"]}>
                <div className={styles["text-container"]}>
                  <strong>First name: </strong>
                  <p>{data.firstName}</p>
                </div>
                <div className={styles["text-container"]}>
                  <strong>Last name: </strong>
                  <p>{data.lastName}</p>
                </div>
                <div className={styles["text-container"]}>
                  <strong>Contract Type: </strong>
                  <p>{empTools.contractTypeFormat(data.contractType)}</p>
                </div>
                <div className={styles["text-container"]}>
                  <strong>Job roles :</strong>
                  <p>{data.positions.slice(0, 4).join(", ")}</p>
                </div>
              </div>
              <div className={styles["employee-contact-details"]}>
                <div className={styles["text-container"]}>
                  <strong>Phone number: </strong>
                  <p>{data.phoneNumber}</p>
                </div>
                <div className={styles["text-container"]}>
                  <strong>Email: </strong>
                  <p>{data.email}</p>
                </div>
              </div>
            </div>
            <div className={styles["employee-main"]}>
              <div className={styles["availability-header"]}>
                <h2>Availability</h2>
              </div>
              <div className={styles["availability-container"]}>
                <button
                  onClick={() => availabilityHandler(id, data)}
                  className={styles["edit-availability-btn"]}
                >
                  Edit
                </button>

                <table className={styles["availability-table"]}>
                  <thead>
                    <tr>
                      <th>Monday</th>
                      <th>Tuesday</th>
                      <th>Wednesday</th>
                      <th>Thursday</th>
                      <th>Friday</th>
                      <th>Saturday</th>
                      <th>Sunday</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      {availability.strict && availability.strict.map((day) => {
                       if (day[1] !== "off") {
                          return <td key={day[0]} className={styles["strict"]}>{day[1]}</td>;
                        } else {
                          return <td key={day[0]} className={styles["off-td"]}>Day off</td>;
                        }
                      })}
                    </tr>
                    <tr>
                    {availability.important && availability.important.map((day) => {
                       if (day[1] !== "off") {
                          return <td key={day[0]} className={styles["important"]}>{day[1]}</td>;
                        } else {
                          return <td key={day[0]} className={styles["off-td"]}>Day off</td>;
                        }
                      })}
                    </tr>
                    <tr>
                    {availability.optional && availability.optional.map((day) => {
                        if (day[1] !== "off") {
                          return <td key={day[0]} className={styles["optional"]}>{day[1]}</td>;
                        } else {
                          return <td key={day[0]} className={styles["off-td"]}>Day off</td>;
                        }
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
