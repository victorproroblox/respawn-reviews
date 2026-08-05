import styles from './Button.module.css';

export const Button = ({ children, variant = 'primary', size, onClick, className = '', type = 'button', disabled = false, ...rest }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.btn} ${styles[variant]} ${size ? styles[size] : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};