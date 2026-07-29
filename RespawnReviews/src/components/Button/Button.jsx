import styles from './Button.module.css';

export const Button = ({ children, variant = 'primary', onClick, className = '', type = 'button', disabled = false, ...rest }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.btn} ${styles[variant]} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};