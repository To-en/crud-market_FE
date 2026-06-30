
// Some tailwind stuffs

const variants = {
  primary: 'bg-primary text-black hover:bg-opacity-80 shadow-glow-primary',
  secondary: 'bg-secondary text-white hover:bg-opacity-80 shadow-glow-secondary',
  success: 'bg-success text-black hover:bg-opacity-80',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-black',
  ghost: 'bg-transparent text-gray-400 hover:text-white',
};

// Generic button — wraps className variants (primary / edit / danger)
// Props: variant, onClick, disabled, loading, children
export function Button({ variant = "primary", onClick, disabled, loading, children }) {
  // TODO: map variant → className (btn-primary / btn-edit / btn-danger)
  // TODO: show <span className="spinner" /> when loading is true
  // TODO: disable when loading || disabled
  return (
    <button
      className=""
      id="" 
      onClick={}
      disabled=
      loading={}
      children=
    
    >
    </button>
  );

}


export const Button = ({ children, variant = 'primary', className, ...props }) => {
    return (
        <button
            className={twMerge(
                'px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-300 transform rounded-sm flex items-center gap-2',
                variants[variant],
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};