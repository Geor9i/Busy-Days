import styles from './guestContent.module.css'
import logo from '../../assets/logo.png'

const GuestContent = () => {


    return (
            <div className={styles['main-container']}>
                <h1>Welcome to Busy Days</h1>
                <h1>Schedule the easy way!</h1>
                <div className={styles['logo-container']}>
                    <img className={styles['logo']} src={logo} alt="logo" />
                </div>
            </div>
        )
}

export default GuestContent;