import styles from './guestContent.module.css'
import Calendar from '../Calendar/Calendar';

const GuestContent = () => {


    return (
            <div className={styles['main-container']}>
                {/* <Calendar/> */}
                <h1>Welcome to Busy Days</h1>
                <h1>Schedule the easy way!</h1>
            </div>
        )
}

export default GuestContent;