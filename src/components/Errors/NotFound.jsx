import { Link } from 'react-router-dom';
import styles from './notFound.module.css'

const NotFound = () => {
    return (
        <div className={styles['container']}>
          <h2 className={styles['not-found-title']}>404 - Not Found</h2>
          <p>Sorry, the page you are looking for does not exist.</p>

          <img src="https://www.iconpacks.net/icons/2/free-sad-face-icon-2691-thumb.png" alt="" />
          <p>Back to <Link to={'/'}>home</Link></p>
        </div>
      );
}
export default NotFound;