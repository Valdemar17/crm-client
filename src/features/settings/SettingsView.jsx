import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Users } from 'lucide-react';

const DEFAULT_MEMBERS = [
  { name: "Gustavo Mazón Escalante", role: "Presidente", type: "Voz y Voto" },
  { name: "Jesús Oscar Peraza Inda", role: "Vocal", type: "Voz y Voto" },
  { name: "Diego Mazón Escalante", role: "Vocal", type: "Voz y Voto" },
  { name: "José Santiago Peraza Chávez", role: "Vocal", type: "Voz y Voto" },
  { name: "Eduardo Salas G.", role: "Secretario", type: "Voz" },
  { name: "Daniel Vega López", role: "Invitado", type: "Voz" }
];

export default function SettingsView() {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('comiteMembers');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const handleSave = () => {
    localStorage.setItem('comiteMembers', JSON.stringify(members));
    alert('Configuración guardada correctamente');
  };

  const addMember = () => {
    setMembers([...members, { name: '', role: 'Vocal', type: 'Voz y Voto' }]);
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Configuración</h1>
        <p className="text-slate-500 mt-1">Administra los parámetros generales del sistema</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                <Users className="text-blue-600" size={20}/>
                Integrantes del Comité de Crédito
            </h2>
            <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all text-sm"
            >
                <Save size={16} className="mr-2" />
                Guardar Cambios
            </button>
        </div>
        
        <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">
                Define los miembros que aparecerán por defecto al crear una nueva Acta de Comité.
            </p>

            <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase px-3">
                    <div className="col-span-5">Nombre Completo</div>
                    <div className="col-span-4">Cargo</div>
                    <div className="col-span-2">Tipo de Voto</div>
                    <div className="col-span-1"></div>
                </div>

                {members.map((member, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="col-span-5">
                            <input 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={member.name}
                                onChange={(e) => updateMember(idx, 'name', e.target.value)}
                                placeholder="Nombre del integrante"
                            />
                        </div>
                        <div className="col-span-4">
                             <input 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={member.role}
                                onChange={(e) => updateMember(idx, 'role', e.target.value)}
                                placeholder="Cargo (Ej. Presidente)"
                            />
                        </div>
                        <div className="col-span-2">
                            <select 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={member.type}
                                onChange={(e) => updateMember(idx, 'type', e.target.value)}
                            >
                                <option>Voz y Voto</option>
                                <option>Voz</option>
                                <option>Oyente</option>
                            </select>
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <button 
                                onClick={() => removeMember(idx)}
                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={addMember}
                className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            >
                <Plus size={16} className="mr-2" /> Agregar Integrante
            </button>
        </div>
      </div>
    </div>
  );
}
