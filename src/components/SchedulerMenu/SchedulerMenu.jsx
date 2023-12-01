import styles from './schedulerMenu.module.css'
import { Link, useNavigate } from 'react-router-dom'


export default function SchedulerMenu() {

    return (
        <>
        <div className={styles['menu-container']}>
        <div className={styles['title-container']}>
        <h1>Welcome to Scheduler</h1>
        </div>
        <div className={styles['content-container']}>

            <div className={styles['btn-container']}>
                <div className={styles['menu-btn']}><Link to='/scheduler'>Create New Schedule</Link></div>
            </div>
            <div className={styles['btn-container']}>
                <div className={styles['menu-btn']}><Link to='/schedule-catalog'>View Past Schedules</Link></div>
            </div>
        </div>
                
        </div>
        </>
    )
}