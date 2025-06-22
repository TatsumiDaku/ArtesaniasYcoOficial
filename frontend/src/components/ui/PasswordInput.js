'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ register, name, placeholder, className, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        {...register(name)}
        placeholder={placeholder}
        className={`input input-bordered w-full pr-10 ${className || ''}`}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/70 hover:text-base-content"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default PasswordInput; 