import styles from './notFound.module.css'

const NotFound = () => {
    return (
        <div className={styles['container']}>
          <h2 className={styles['not-found-title']}>404 - Not Found</h2>
          <p>Sorry, the page you are looking for does not exist.</p>
        </div>
      );
}
export default NotFound;