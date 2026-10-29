import React from 'react';

const FormInput = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  helperText,
  disabled = false,
  className = '',
  rows,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-charcoal">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows || 4}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3.5 py-2 text-sm rounded-card border bg-white placeholder-charcoal-subtle focus:outline-none focus:ring-1 transition-all ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-charcoal-border focus:border-primary focus:ring-primary/20'
          } ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3.5 py-2 text-sm rounded-card border bg-white placeholder-charcoal-subtle focus:outline-none focus:ring-1 transition-all ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-charcoal-border focus:border-primary focus:ring-primary/20'
          } ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
          {...props}
        />
      )}

      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-charcoal-muted">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormInput;

