import styles from './Button.module.css';

export const Button = ({ children, variant = 'primary', onClick, className = '' }) => {
  return (
    <button 
      className={`${styles.btn} ${styles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};