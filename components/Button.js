import styles from './Button.module.css';

export default function Button({ onClick, children, primary }) {
  return (
    <button
      onClick={onClick}
      className={primary ? styles.primary : styles.button}
    >
      {children}
    </button>
  );
}
