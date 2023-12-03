import { useEffect, useState } from 'react';
import styles from './shiftItem.module.css'

export default function ShiftItem({ firstName, lastName, display }) {
    console.log(display);

    const shiftTemplate = {
        startTime: '',
        endTime: '',
    }

    const [shifts, setShifts] = useState(Array(7).fill(''))

    // useEffect(() => {
    //     const arr = Array(7).fill({...shiftTemplate})
    //     const updatedShifts = arr.map((curr) => {
    //         if (curr.startTime !== '' && curr.endTime !== '') {
    //           return `${curr.startTime} - ${curr.endTime}`;
    //         } else {
    //           return '';
    //         }
    //       });
    //     setShifts(updatedShifts)
    // }, [shifts])

  return (
    <div className={styles["tr"]}>
      <div className={styles["td"]}>{`${firstName} ${lastName}`}</div>
       { shifts.map(shift => <div className={`${styles["td"]} ${styles['shift']}`}>{shift}</div>)}
      <div className={styles["td"]}></div>
      <div className={styles["td"]}></div>
      <div className={styles["td"]}></div>
    </div>
  );
}
