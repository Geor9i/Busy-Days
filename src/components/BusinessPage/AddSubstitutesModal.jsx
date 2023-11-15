const AddSubstitutesModal = (styles, positions) => {

  return (
    <div className={styles['modal-container']}>
        <ul>
          {positions.length > 0 ?
          positions.map(pos => <li><p>{pos}</p><input type="checkbox" />
          </li>)
          : null}
        </ul>
        <button>Confirm</button>
    </div>
  );
};
export default AddSubstitutesModal;
