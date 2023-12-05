import CalendarCore from "./calendarCore";
import styles from "./calendar.module.css";
import { useState } from "react";
import DateUtil from "../../utils/dateUtil.js";
import StringUtil from "../../utils/stringUtil.js";

export default function Calendar({ handler }) {
  const dateUtil = new DateUtil();
  const stringUtil = new StringUtil();
  const core = new CalendarCore();
  const date = new Date();
  const [calendarState, setCalendarState] = useState({
    today: date,
    year: date.getFullYear(),
    month: date.getMonth(),
    originMonth: date.getMonth(),
    originYear: date.getFullYear(),
  });

  const calendarData = () => {
    let todayDate = calendarState.today;
    let year = calendarState.year;
    let month = calendarState.month;
    let day = todayDate.getDate();
    const classNames = {
      other: "other",
      current: "current",
      currentDay: "current-day",
    };

    let selectedMonth = [...core.calendarMonth(year, month)];
    let prevMonth = core.getRightDate(year, month, "back");
    let prevMonthDays = [
      ...core.calendarMonth(prevMonth.year, prevMonth.month - 1),
    ];

    let nextMonth = core.getRightDate(year, month, "next");
    let nextMonthDays = [
      ...core.calendarMonth(nextMonth.year, nextMonth.month - 1),
    ];
    let isCurrent = false;

    let prevMonthIndex = prevMonthDays.findLastIndex(
      (el) => el[1] === "monday"
    );
    let currentMonthIndex = 0;
    let nextMonthIndex = 0;
    // calenderHeaderTextElement.innerText = `${year} ${this.util.getMonth(month)}`;

    let matrix = Array(6)
      .fill(null)
      .map(() =>
        Array(7)
          .fill(null)
          .map(() => ({ value: 0, style: {}, data: {} }))
      );

    //iterate over activeRows to map dates
    for (let row = 0; row < matrix.length; row++) {
      let colCollection = matrix[row];
      for (let col = 0; col < colCollection.length; col++) {
        //if the current date's weekday calender mapping does not match the first weekday of the selected month
        if (!isCurrent && prevMonthDays.length > prevMonthIndex) {
          colCollection[col] = {
            value: prevMonthDays[prevMonthIndex][0],
            class: classNames.other,
            data: {
              day: prevMonthDays[prevMonthIndex][0],
              weekday: prevMonthDays[prevMonthIndex][1],
              month: prevMonth.month + 1,
              year: prevMonth.year,
            },
          };
          prevMonthIndex++;
        }
        //if the two weekdays match confirm in boolean
        if (dateUtil.getWeekdays(col + 1) === selectedMonth[0][1]) {
          isCurrent = true;
        }
        //begin printing current month
        if (isCurrent) {
          //if there are no more days in the current month begin printing next month
          if (currentMonthIndex > selectedMonth.length - 1) {
            colCollection[col] = {
              value: nextMonthDays[nextMonthIndex][0],
              class: classNames.other,
              data: {
                day: nextMonthDays[nextMonthIndex][0],
                weekday: nextMonthDays[nextMonthIndex][1],
                month: nextMonth.month + 1,
                year: nextMonth.year,
              },
            };
            nextMonthIndex++;
            continue;
          }
          // else print current month
          //-------------------------
          //have the current date always selected on the calender
          if (selectedMonth[currentMonthIndex][0] === day) {
            if (
              month === calendarState.originMonth &&
              year === calendarState.originYear
            ) {
              colCollection[col] = {
                value: selectedMonth[currentMonthIndex][0],
                class: classNames.currentDay,
                data: {
                  day: selectedMonth[currentMonthIndex][0],
                  weekday: selectedMonth[currentMonthIndex][1],
                  month: month + 1,
                  year,
                },
              };
              currentMonthIndex++;
              continue;
            }
          }
          colCollection[col] = {
            value: selectedMonth[currentMonthIndex][0],
            class: classNames.current,
            data: {
              day: selectedMonth[currentMonthIndex][0],
              weekday: selectedMonth[currentMonthIndex][1],
              month: month + 1,
              year,
            },
          };
          currentMonthIndex++;
        }
      }
    }
    return matrix;
  };

  const calendarArr = calendarData();

  const upArrowClick = () => {
    if (calendarState.month + 1 < 12) {
      setCalendarState((state) => ({ ...state, month: state.month + 1 }));
    } else {
      setCalendarState((state) => ({
        ...state,
        month: 0,
        year: state.year + 1,
      }));
    }
  };

  const downArrowClick = () => {
    if (calendarState.month - 1 >= 0) {
      setCalendarState((state) => ({ ...state, month: state.month - 1 }));
    } else {
      setCalendarState((state) => ({
        ...state,
        month: 11,
        year: state.year - 1,
      }));
    }
  };

  return (
    <>
      <div className={styles["calendar-container"]}>
        <div onClick={handler} className={styles["calendar-body"]}>
          <div className={styles["calendar-header"]}>
            <div className={styles["in-header-container"]}>
              <h2 className={styles["calendar-header-text"]}>
                {calendarState.year}{" "}
                {dateUtil.getMonth(calendarState.month, { full: true })}
              </h2>
            </div>
            <div className={styles["in-header-container"]}>
              <div className={styles["arrow-container"]}></div>
              <div className={styles["arrow-container"]}>
                <div
                  id="arrow-up"
                  className={styles["arrow-up"]}
                  onClick={upArrowClick}
                ></div>
              </div>
              <div className={styles["arrow-container"]}>
                <div
                  id="arrow-down"
                  className={styles["arrow-down"]}
                  onClick={downArrowClick}
                ></div>
              </div>
            </div>
          </div>
          <table className={styles["day-table"]}>
            <tbody
              onClick={core.clickDate}
              className={styles["day-table-tbody"]}
            >
              <tr>
                {dateUtil.getWeekdays([]).map((day) => (
                  <th key={day}>{stringUtil.toPascalCase(day).slice(0, 3)}</th>
                ))}
              </tr>
              {calendarArr.map((row, iR) => (
                <tr key={iR}>
                  {row.map((day, iC) => (
                    <td
                      key={`${iR}${iC}`}
                      data-id={JSON.stringify(day.data)}
                      className={styles[day.class]}
                    >
                      {day.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div onClick={handler} className={styles["modal-backdrop"]}></div>
    </>
  );
}
