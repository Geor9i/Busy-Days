import { useEffect, useState } from "react";
import styles from "./employeeListItem.module.css";
import icon from "../../assets/userIcon_transparent.png";
import DateUtil from "../../utils/dateUtil.js";

export default function EmployeeListItem({
  data,
  id,
  detailsHandler,
  editModalHandler,
  availabilityHandler,
}) {
  const dateUtil = new DateUtil();
  const weekdays = dateUtil.getWeekdays([]);
  const [onDisplay, setDisplay] = useState(false);
  const [style, setStyle] = useState({
    backgroundColor: "",
  });
  const [availability, setAvailability] = useState({
    strict: [],
    hasStrict: false,
    important: [],
    hasImportant: false,
    optional: [],
    hasOptional: false,

  });

  useEffect(() => {
    const strictArr = getAvailability("strict");
    const hasStrict = strictArr.filter((day) => day[1] === "").length < 7;
    let strict = [...strictArr];
    if (hasStrict) {
      strict = strict.map((day) => (day[1] === "" ? [day[0], "off"] : day));
    }
    const importantArr = getAvailability("important");
    const hasImportant = importantArr.filter((day) => day[1] === "").length < 7;
    let important = [...importantArr];
    if (hasImportant) {
      important = important.map((day) => {
        if (day[1] === "" && hasStrict) {
          const isOff = strict.find(
            (strictDay) => strictDay[0] === day[0] && strictDay[1] === "off"
          );
          return isOff ? [day[0], "off"] : day;
        }
        return [day[0], "off"];
      });
    }
    const optionalArr = getAvailability("optional");
    const hasOptional = optionalArr.filter((day) => day[1] === "").length < 7;
    let optional = [...optionalArr];
    if (hasOptional) {
      optional = optional.map((day) => {
        if (day[1] === "" && hasImportant) {
          const isOff = important.find(
            (importantDay) =>
              importantDay[0] === day[0] && importantDay[1] === "off"
          );
          return isOff ? [day[0], "off"] : day;
        } else if (day[1] === "" && hasStrict) {
          const isOff = strict.find(
            (strictDay) => strictDay[0] === day[0] && strictDay[1] === "off"
          );
          return isOff ? [day[0], "off"] : day;
        }
        return [day[0], "off"];
      });
    }

    setAvailability({
      strict: strict,
      hasStrict,
      important: important,
      hasImportant,
      optional: optional,
      hasOptional
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

  function getAvailability(option) {
    const toArr = (obj) => Object.entries(obj);
    let result = [];
    if (option === "strict" && data?.availability?.strict) {
      result = toArr(data.availability.strict);
    } else if (option === "important" && data?.availability?.important) {
      result = toArr(data.availability.important);
    } else if (option === "optional" && data?.availability?.optional) {
      result = toArr(data.availability.optional);
    } else {
      return [...weekdays].map((day) => [day, ""]);
    }
    result = result.map((el) => {
      if (el[1].startTime !== "" && el[1].endTime !== "") {
        return [el[0], `${el[1].startTime} - ${el[1].endTime}`];
      }
      return [el[0], ""];
    });
    return result.sort(
      (a, b) => weekdays.indexOf(a[0]) - weekdays.indexOf(b[0])
    );
  }

  return (
    <>
      <div
        onClick={showEmployeeDetails}
        className={styles["employee-list-item"]}
        style={style}
      >
        <div className={styles["content-cell"]}>{data.firstName}</div>
        <div className={styles["content-cell"]}>{data.lastName}</div>
        <div className={styles["content-cell"]}>{data.contractType}</div>
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
                  <p>{data.contractType}</p>
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
                      {availability.hasStrict && availability.strict.map((day) => {
                        if (!day[1]) {
                          return <td className={styles["blank-td"]}>{day[1]}</td>
                        } else if (day[1] !== "off") {
                          return <td className={styles["strict"]}>{day[1]}</td>;
                        } else {
                          return <td className={styles["off-td"]}>Day off</td>;
                        }
                      })}
                    </tr>
                    <tr>
                    {availability.hasImportant && availability.important.map((day) => {
                        if (!day[1]) {
                          return <td className={styles["blank-td"]}>{day[1]}</td>
                        } else if (day[1] !== "off") {
                          return <td className={styles["strict"]}>{day[1]}</td>;
                        } else {
                          return <td className={styles["off-td"]}>Day off</td>;
                        }
                      })}
                    </tr>
                    <tr>
                    {availability.hasOptional && availability.optional.map((day) => {
                        if (!day[1]) {
                          return <td className={styles["blank-td"]}>{day[1]}</td>
                        } else if (day[1] !== "off") {
                          return <td className={styles["strict"]}>{day[1]}</td>;
                        } else {
                          return <td className={styles["off-td"]}>Day off</td>;
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
