import React, { useState } from 'react';
import {
  ChevronLeft, Database, Mail, Eye, EyeOff, LogIn, ScanFace,
  Moon, Sun
} from 'lucide-react';
import logo from '../assets/sofimas-logo.png';

export default function Login({ isDarkMode, toggleTheme, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@crm.com' && password === 'admin123') {
      onLogin({ name: 'Administrador', email: 'admin@crm.com', role: 'admin' });
      setError('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col geometric-bg font-display text-[#0d121b] dark:text-white overflow-x-hidden">
      {/* Top App Bar */}
      <div className="flex items-center bg-transparent p-4 pb-2 justify-between relative z-10">
        <button
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-[#0d121b] dark:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
          aria-label="Volver"
        >
          <ChevronLeft size={28} />
        </button>

        <h2 className="text-[#0d121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          S-Core
        </h2>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute right-4 top-4 p-2 rounded-full text-[#0d121b] dark:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden p-8 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          {/* Branding Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="Sofimas Logo"
              className="h-32 w-auto object-contain transition-transform hover:scale-105 duration-300"
            />
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-[#0d121b] dark:text-white text-[28px] font-bold leading-tight">
              Bienvenido
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-2">
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium text-center border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="flex flex-col">
              <label className="text-[#0d121b] dark:text-white text-sm font-medium leading-normal pb-2">
                Correo Electrónico
              </label>
              <div className="flex w-full items-stretch rounded-lg group">
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 border border-r-0 border-[#cfd7e7] dark:border-slate-700 bg-[#f8f9fc] dark:bg-slate-800 focus:border-[#135bec] dark:focus:border-[#135bec] h-14 placeholder:text-slate-400 p-[15px] text-base font-normal transition-colors"
                  placeholder="nombre@empresa.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="text-slate-400 dark:text-slate-500 flex border border-l-0 border-[#cfd7e7] dark:border-slate-700 bg-[#f8f9fc] dark:bg-slate-800 items-center justify-center pr-[15px] rounded-r-lg group-focus-within:border-[#135bec] group-focus-within:ring-2 group-focus-within:ring-[#135bec]/20 transition-colors">
                  <Mail size={20} />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[#0d121b] dark:text-white text-sm font-medium leading-normal pb-2">
                Contraseña
              </label>
              <div className="flex w-full items-stretch rounded-lg group">
                <input
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#0d121b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 border border-r-0 border-[#cfd7e7] dark:border-slate-700 bg-[#f8f9fc] dark:bg-slate-800 focus:border-[#135bec] dark:focus:border-[#135bec] h-14 placeholder:text-slate-400 p-[15px] text-base font-normal transition-colors"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="text-slate-400 dark:text-slate-500 hover:text-[#135bec] dark:hover:text-[#135bec] cursor-pointer flex border border-l-0 border-[#cfd7e7] dark:border-slate-700 bg-[#f8f9fc] dark:bg-slate-800 items-center justify-center pr-[15px] rounded-r-lg group-focus-within:border-[#135bec] group-focus-within:ring-2 group-focus-within:ring-[#135bec]/20 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a className="text-[#135bec] text-sm font-semibold hover:underline" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button className="w-full bg-[#135bec] hover:bg-[#135bec]/90 text-white font-bold py-4 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              Iniciar Sesión
              <LogIn size={20} />
            </button>

          </form>
        </div>
      </div>
      {/* Footer */}
      <div className="pb-8 pt-4">
        <p className="text-slate-400 dark:text-slate-500 text-xs text-center font-medium">
          Versión 2.4.0 • <a className="hover:text-[#135bec] transition-colors" href="#">Términos de Servicio</a>
        </p>
      </div>
    </div>
  );
}
