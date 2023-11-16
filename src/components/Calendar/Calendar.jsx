import CalendarCore from "./calendarCore"
import styles from './calendar.module.css'
import { useState } from "react";
import DateUtil from "../../utils/dateUtil";

export default function Calendar() {
    const dateUtil = new DateUtil();
    const core = new CalendarCore()
    const date = new Date();
    const [calendarState, setCalendarState] = useState({
        today: date,
        year: date.getFullYear(),
        month: date.getMonth(),
        originMonth: date.getMonth(),
        originYear: date.getFullYear(),
    })

    // const calendarData = () => {
    //     let todayDate = calendarState.today;
    //     let year = calendarState.year;
    //     let month = calendarState.month;
    //     let day = todayDate.getDate();

    //     let selectedMonth = [...core.calendarMonth(year, month)];
    //     let prevMonth = core.getRightDate(year, month, 'back');
    //     prevMonth = [...core.calendarMonth(prevMonth.year, prevMonth.month - 1)];

    //     let nextMonth = core.getRightDate(year, month, 'next');
    //     nextMonth = [...core.calendarMonth(nextMonth.year, nextMonth.month - 1)];
    //     let isCurrent = false;

    //     //Get the index for the last monday of the previous month
    //     let prevMonthIndex = prevMonth.reduce((acc, curr, i) => {
    //         if (curr[1] === "Monday") {
    //             acc.pop();
    //             acc.push(i);
    //         }
    //         return acc;
    //     }, [])[0];
    //     let currentMonthIndex = 0;
    //     let nextMonthIndex = 0;
    //     // calenderHeaderTextElement.innerText = `${year} ${this.util.getMonth(month)}`;

    //     let matrix = Array(7).fill(Array(7))

    //     //iterate over activeRows to map dates
    //     for (let row = 0; row < matrix.length; row++) {
    //         let colCollection = matrix[row];
    //         for (let col = 0; col < colCollection.length; col++) {
    //             //if the current date's weekday calender mapping does not match the first weekday of the selected month
    //             if (!isCurrent && prevMonth.length > prevMonthIndex) {
    //                 colCollection[col] = { value: prevMonth[prevMonthIndex][0], style: 'notCurrent' };
    //                 // colCollection[col].style.backgroundColor = "rgba(200,200,200,0.5)";
    //                 // colCollection[col].style.color = "rgba(100,100,100,0.5)";

    //                 let dateValues = core.getRightDate(year, month, "back");
    //                 prevMonthIndex++;
    //             }
    //             //if the two weekdays match confirm in boolean
    //             if (dateUtil.getWeekDays(col) === selectedMonth[0][1]) {
    //                 isCurrent = true;
    //             }
    //             //begin printing current month
    //             if (isCurrent) {
    //                 //if there are no more days in the current month begin printing next month
    //                 if (currentMonthIndex > selectedMonth.length - 1) {
    //                     colCollection[col] = { value: nextMonth[nextMonthIndex][0], style: 'current' };
    //                     // colCollection[col].style.backgroundColor = "rgba(200,200,200,0.5)";
    //                     // colCollection[col].style.color = "rgba(100,100,100,0.5)";
    //                     nextMonthIndex++;
    //                     continue;
    //                 }
    //                 // else print current month
    //                 //-------------------------
    //                 //have the current date always selected on the calender
    //                 if (selectedMonth[currentMonthIndex][0] === day) {
    //                     if (month === calendarState.originMonth && year === calendarState.originYear) {
    //                         colCollection[col].style.border = "1px solid rgba(255,72,0, 0.5)";
    //                     }
    //                 } else {
    //                     colCollection[col].style.border = "";
    //                 }
    //                 colCollection[col] = {value:selectedMonth[currentMonthIndex][0], style: 'notCurrent'};
    //                 // colCollection[col].style.backgroundColor = "rgba(243,243,243,1)";
    //                 // colCollection[col].style.color = "rgba(0,0,0,0.8)";
    //                 currentMonthIndex++;
    //             }
    //         }
    //     }
    //     setCalendarState(state => ({ ...state, year, month }))
    //     return matrix;
    // }

    // console.log(calendarData());

    const upArrowClick = () => {
        if (calendarState.month + 1 < 12) {
            calendarState.month++;
        } else {
            calendarState.month = 0;
            calendarState.year++;
        }
    }

    const downArrowClick = () => {
        if (calendarState.month - 1 >= 0) {
            calendarState.month--;
        } else {
            calendarState.month = 11;
            calendarState.year--;
        }
    }

    return (
        <div className={styles['calendar-container']}>
            <div className={styles['calendar-body']}>
                <div className={styles['calendar-header']}>
                    <div className={styles['in-header-container']}>
                        <h2 className={styles['calendar-header-text']}>2025 June</h2>
                    </div>
                    <div className={styles['in-header-container']}>
                        <div className={styles['arrow-container']}></div>
                        <div className={styles['arrow-container']}>
                            <div className={styles['arrow-up']} onClick={core.upArrowClick}></div>
                        </div>
                        <div className={styles['arrow-container']}>
                            <div className={styles['arrow-down']} onClick={core.downArrowClick}></div>
                        </div>
                    </div>
                </div>
                <table className={styles['day-table']}>
                    <tbody onClick={core.clickDate} className={styles['day-table-tbody']}>
                        {Array.from({ length: 7 }, (_, i) =>
                            <tr> {Array.from({ length: 7 }, (_, index) => i === 0 ? <th> {dateUtil.getWeekdays(index + 1).slice(0, 3)}</th> : <td>NA</td>)}</tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
