import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Users, X, Edit2, ShieldCheck, UserCheck, Shield, ChevronDown, ChevronUp, LayoutGrid, CheckSquare, CreditCard, Calculator, FileText, Calendar as CalendarIcon, UserPlus, Database, PieChart, Settings, Package, Percent, Lock, Key, Eye } from 'lucide-react';

const DEFAULT_MEMBERS = [
  { name: "Gustavo Mazón Escalante", role: "Presidente", type: "Voz y Voto" },
  { name: "Jesús Oscar Peraza Inda", role: "Vocal", type: "Voz y Voto" },
  { name: "Diego Mazón Escalante", role: "Vocal", type: "Voz y Voto" },
  { name: "José Santiago Peraza Chávez", role: "Vocal", type: "Voz y Voto" },
  { name: "Eduardo Salas G.", role: "Secretario", type: "Voz" },
  { name: "Daniel Vega López", role: "Invitado", type: "Voz" }
];

const DEFAULT_PRODUCTS = [
  { name: "Crédito Revolvente", rate: "12%", term: "12 meses" },
  { name: "Crédito Simple", rate: "15%", term: "24-48 meses" },
  { name: "Arrendamiento Puro", rate: "10%", term: "36 meses" },
  { name: "Factoraje", rate: "8%", term: "N/A" }
];

const AVAILABLE_ACTIONS = [
    { id: 'new_request', label: 'Nueva Solicitud', icon: <CreditCard size={18}/>, route: 'credito' },
    { id: 'simulate_credit', label: 'Simular Crédito', icon: <Calculator size={18}/>, route: 'cotizador' },
    { id: 'check_buro', label: 'Consulta Buró', icon: <Database size={18}/>, route: 'clients' },
    { id: 'view_agenda', label: 'Ver Agenda', icon: <CalendarIcon size={18}/>, route: 'calendar' },
    { id: 'new_prospect', label: 'Nuevo Prospecto', icon: <UserPlus size={18}/>, route: 'prospectos' },
    { id: 'pld_report', label: 'Reporte PLD', icon: <FileText size={18}/>, route: 'pld' },
    { id: 'accounting_balance', label: 'Balance General', icon: <PieChart size={18}/>, route: 'accounting' },
    { id: 'app_settings', label: 'Configuración', icon: <Settings size={18}/>, route: 'settings' }
];

const MODULES_LIST = [
  { id: 'prospectos', label: 'Prospectos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'creditos', label: 'Créditos' },
  { id: 'cotizador', label: 'Cotizador' },
  { id: 'pld', label: 'PLD / Riesgos' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'configuracion', label: 'Configuración' }
];

const PERMISSIONS_TYPES = [
  { id: 'view', label: 'Ver', icon: <Eye size={14}/> },
  { id: 'create', label: 'Crear', icon: <Plus size={14}/> },
  { id: 'edit', label: 'Editar', icon: <Edit2 size={14}/> },
  { id: 'delete', label: 'Eliminar', icon: <Trash2 size={14}/> }
];

const DEFAULT_ROLES_PERMISSIONS = {
  'Administrador': MODULES_LIST.reduce((acc, mod) => ({
    ...acc, [mod.id]: { view: true, create: true, edit: true, delete: true }
  }), {}),
  'Gerente': MODULES_LIST.reduce((acc, mod) => ({
    ...acc, [mod.id]: { view: true, create: true, edit: true, delete: false }
  }), {}),
  'Analista': MODULES_LIST.reduce((acc, mod) => ({
    ...acc, [mod.id]: { view: true, create: true, edit: false, delete: false }
  }), {}),
  'Promotor': MODULES_LIST.reduce((acc, mod) => ({
    ...acc, [mod.id]: { view: true, create: true, edit: false, delete: false } 
  }), {})
};

const EditPermissionsModal = ({ isOpen, onClose, initialPermissions, onSave }) => {
  const [localPermissions, setLocalPermissions] = useState(initialPermissions);
  const [selectedRole, setSelectedRole] = useState('Administrador');
  const roles = Object.keys(localPermissions);

  useEffect(() => {
    if (isOpen) {
      setLocalPermissions(JSON.parse(JSON.stringify(initialPermissions)));
    }
  }, [isOpen, initialPermissions]);

  const togglePermission = (role, module, type) => {
    setLocalPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [type]: !prev[role][module][type]
        }
      }
    }));
  };

  const handleSave = () => {
    onSave(localPermissions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
               <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ShieldCheck size={24} className="text-orange-600" />
                Matriz de Permisos
              </h2>
              <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                {roles.map(role => (
                    <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                            selectedRole === role 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {role}
                    </button>
                ))}
              </div>
          </div>
         
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3 w-1/4">Módulo</th>
                            {PERMISSIONS_TYPES.map(type => (
                                <th key={type.id} className="px-4 py-3 text-center w-1/6">
                                    <div className="flex flex-col items-center">
                                        {type.icon}
                                        <span className="text-xs mt-1">{type.label}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {MODULES_LIST.map(module => (
                            <tr key={module.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                                    {module.label}
                                </td>
                                {PERMISSIONS_TYPES.map(type => {
                                    const isChecked = localPermissions[selectedRole]?.[module.id]?.[type.id];
                                    return (
                                        <td key={type.id} className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => togglePermission(selectedRole, module.id, type.id)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isChecked 
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
                                                }`}
                                            >
                                                {isChecked ? <CheckSquare size={18} /> : <CheckSquare size={18} />}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg flex items-start gap-3">
                 <Shield className="text-yellow-600 mt-1 shrink-0" size={18} />
                 <div>
                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500">Nota de Seguridad</h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-600 mt-1">
                        Los cambios en los permisos de "Administrador" pueden afectar tu propio acceso. Asegúrate de mantener al menos los permisos de edición en el módulo de Configuración.
                    </p>
                 </div>
            </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <Save size={18} className="mr-2" />
            Guardar Permisos
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProductsModal = ({ isOpen, onClose, initialProducts, onSave }) => {
  const [localProducts, setLocalProducts] = useState(initialProducts);

  useEffect(() => {
    if (isOpen) {
      setLocalProducts(JSON.parse(JSON.stringify(initialProducts)));
    }
  }, [isOpen, initialProducts]);

  const addProduct = () => {
    setLocalProducts([...localProducts, { name: '', rate: '', term: '' }]);
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...localProducts];
    newProducts[index][field] = value;
    setLocalProducts(newProducts);
  };

  const removeProduct = (index) => {
    setLocalProducts(localProducts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localProducts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package size={24} className="text-indigo-600" />
            Editar Catálogo de Productos
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase px-3 mb-2">
              <div className="col-span-6">Nombre del Producto</div>
              <div className="col-span-3">Tasa Base</div>
              <div className="col-span-2">Plazo Estándar</div>
              <div className="col-span-1"></div>
            </div>

            {localProducts.map((product, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 group">
                <div className="col-span-6">
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    value={product.name}
                    onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                    placeholder="Nombre del producto"
                    autoFocus={idx === localProducts.length - 1 && product.name === ''}
                  />
                </div>
                <div className="col-span-3">
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    value={product.rate}
                    onChange={(e) => updateProduct(idx, 'rate', e.target.value)}
                    placeholder="Ej. TIIE + 5%"
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    value={product.term}
                    onChange={(e) => updateProduct(idx, 'term', e.target.value)}
                    placeholder="Ej. 12 meses"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button 
                    onClick={() => removeProduct(idx)}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addProduct}
            className="mt-6 text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-2 rounded-lg transition-colors border border-dashed border-indigo-200 hover:border-indigo-300 w-full justify-center"
          >
            <Plus size={16} className="mr-2" /> Agregar Nuevo Producto
          </button>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <Save size={18} className="mr-2" />
            Guardar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
};

const EditCommitteeModal = ({ isOpen, onClose, initialMembers, onSave }) => {
  const [localMembers, setLocalMembers] = useState(initialMembers);

  useEffect(() => {
    if (isOpen) {
      setLocalMembers(JSON.parse(JSON.stringify(initialMembers)));
    }
  }, [isOpen, initialMembers]);

  const addMember = () => {
    setLocalMembers([...localMembers, { name: '', role: 'Vocal', type: 'Voz y Voto' }]);
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...localMembers];
    newMembers[index][field] = value;
    setLocalMembers(newMembers);
  };

  const removeMember = (index) => {
    setLocalMembers(localMembers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localMembers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Editar Integrantes del Comité
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase px-3 mb-2">
              <div className="col-span-5">Nombre Completo</div>
              <div className="col-span-4">Cargo</div>
              <div className="col-span-2">Tipo de Voto</div>
              <div className="col-span-1"></div>
            </div>

            {localMembers.map((member, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 group">
                <div className="col-span-5">
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    value={member.name}
                    onChange={(e) => updateMember(idx, 'name', e.target.value)}
                    placeholder="Nombre del integrante"
                    autoFocus={idx === localMembers.length - 1 && member.name === ''}
                  />
                </div>
                <div className="col-span-4">
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    value={member.role}
                    onChange={(e) => updateMember(idx, 'role', e.target.value)}
                    placeholder="Cargo (Ej. Presidente)"
                  />
                </div>
                <div className="col-span-2">
                  <select 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
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
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar integrante"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addMember}
            className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-colors border border-dashed border-blue-200 hover:border-blue-300 w-full justify-center"
          >
            <Plus size={16} className="mr-2" /> Agregar Nuevo Integrante
          </button>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <Save size={18} className="mr-2" />
            Guardar Lista
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SettingsView() {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('comiteMembers');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const [quickActions, setQuickActions] = useState(() => {
    const saved = localStorage.getItem('dashboardQuickActions');
    return saved ? JSON.parse(saved) : ['new_request', 'simulate_credit', 'check_buro', 'view_agenda'];
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('productsCatalog');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('rolesPermissions');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES_PERMISSIONS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  
  const [isCommitteeExpanded, setIsCommitteeExpanded] = useState(true);
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);
  const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false);

  const saveMembers = (newMembers) => {
    setMembers(newMembers);
    localStorage.setItem('comiteMembers', JSON.stringify(newMembers));
  };

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('productsCatalog', JSON.stringify(newProducts));
  };
  
  const savePermissions = (newPermissions) => {
    setPermissions(newPermissions);
    localStorage.setItem('rolesPermissions', JSON.stringify(newPermissions));
  };
  
  const toggleAction = (actionId) => {
    setQuickActions(prev => {
        const newActions = prev.includes(actionId) 
            ? prev.filter(id => id !== actionId)
            : [...prev, actionId];
        localStorage.setItem('dashboardQuickActions', JSON.stringify(newActions));
        return newActions;
    });
  };

  const getRoleIcon = (role) => {
    const lower = role.toLowerCase();
    if (lower.includes('presidente')) return <ShieldCheck className="text-blue-600" size={18} />;
    if (lower.includes('secretario')) return <UserCheck className="text-emerald-600" size={18} />;
    return <Shield className="text-slate-400" size={18} />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[#0d121b] dark:text-white">Configuración</h1>
        <p className="text-slate-500 mt-1">Administra los parámetros generales del sistema</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
        <div 
          className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          onClick={() => setIsCommitteeExpanded(!isCommitteeExpanded)}
        >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                {isCommitteeExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                  <Users className="text-blue-600" size={20}/>
                  Integrantes del Comité de Crédito
              </h2>
            </div>
            
            {isCommitteeExpanded && (
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all text-sm"
              >
                  <Edit2 size={16} className="mr-2" />
                  Editar Lista
              </button>
            )}
        </div>
        
        {isCommitteeExpanded && (
          <div className="p-6 animate-fade-in-down">
            <p className="text-sm text-slate-500 mb-4">
                Miembros actuales configurados para las Actas de Comité.
            </p>

            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Cargo</th>
                            <th className="px-4 py-3">Permisos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {members.map((member, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                    {member.name}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    {getRoleIcon(member.role)}
                                    {member.role}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        member.type === 'Voz y Voto' 
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {member.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex justify-end">
                <p className="text-xs text-slate-400">
                    Total: <span className="font-bold text-slate-600 dark:text-slate-300">{members.length} integrantes</span>
                </p>
            </div>
          </div>
        )}
      </div>

      <EditCommitteeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialMembers={members}
        onSave={saveMembers}
      />

      <EditProductsModal 
        isOpen={isProductsModalOpen} 
        onClose={() => setIsProductsModalOpen(false)} 
        initialProducts={products}
        onSave={saveProducts}
      />

      <EditPermissionsModal 
        isOpen={isPermissionsModalOpen} 
        onClose={() => setIsPermissionsModalOpen(false)} 
        initialPermissions={permissions}
        onSave={savePermissions}
      />

        {/* Products Configuration Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <div 
            className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsProductsExpanded(!isProductsExpanded)}
            >
                <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        {isProductsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                        <Package className="text-indigo-600" size={20}/>
                        Catálogo de Productos Financieros
                    </h2>
                </div>
                
                {isProductsExpanded && (
                  <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProductsModalOpen(true);
                      }}
                      className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all text-sm"
                  >
                      <Edit2 size={16} className="mr-2" />
                      Editar Catálogo
                  </button>
                )}
            </div>
            
            {isProductsExpanded && (
            <div className="p-6 animate-fade-in-down">
                <p className="text-sm text-slate-500 mb-4">
                    Productos activos disponibles para cotizaciones y solicitudes.
                </p>
                
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Producto</th>
                                <th className="px-4 py-3">Tasa Referencia</th>
                                <th className="px-4 py-3">Plazo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {products.map((product, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                                            <Package size={14} />
                                        </div>
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                            <Percent size={10} className="mr-1"/>
                                            {product.rate}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                                        {product.term}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>

        {/* Permissions Configuration Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <div 
            className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsPermissionsExpanded(!isPermissionsExpanded)}
            >
                <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        {isPermissionsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                        <ShieldCheck className="text-orange-600" size={20}/>
                        Matriz de Permisos y Roles
                    </h2>
                </div>
                
                {isPermissionsExpanded && (
                  <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPermissionsModalOpen(true);
                      }}
                      className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg flex items-center font-bold shadow-sm transition-all text-sm"
                  >
                      <Settings size={16} className="mr-2" />
                      Configurar Accesos
                  </button>
                )}
            </div>
            
            {isPermissionsExpanded && (
            <div className="p-6 animate-fade-in-down">
                <p className="text-sm text-slate-500 mb-4">
                     Define qué acciones puede realizar cada perfil dentro del sistema.
                </p>
                
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-center">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Rol / Perfil</th>
                                <th className="px-4 py-3">Total Módulos</th>
                                <th className="px-4 py-3">Permisos Activos</th>
                                <th className="px-4 py-3">Nivel de Acceso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.keys(permissions).map((role, idx) => {
                                const rolePerms = permissions[role];
                                const activeModules = Object.values(rolePerms).filter(m => m.view).length;
                                const totalPermsCount = Object.values(rolePerms).reduce((acc, m) => 
                                    acc + (m.view?1:0) + (m.create?1:0) + (m.edit?1:0) + (m.delete?1:0), 0);
                                const strength = totalPermsCount > 20 ? 'Alto' : totalPermsCount > 10 ? 'Medio' : 'Restringido';
                                const strengthColor = totalPermsCount > 20 ? 'text-orange-600' : totalPermsCount > 10 ? 'text-blue-600' : 'text-slate-500';

                                return (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white text-left">
                                            {role}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full text-xs font-bold">
                                                {activeModules} / {MODULES_LIST.length}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                                            {totalPermsCount} acciones habilitadas
                                        </td>
                                        <td className={`px-4 py-3 text-xs font-bold uppercase ${strengthColor}`}>
                                            {strength}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>

        {/* Quick Actions Configuration Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <div 
            className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsActionsExpanded(!isActionsExpanded)}
            >
                <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        {isActionsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <h2 className="text-lg font-bold text-[#0d121b] dark:text-white flex items-center gap-2">
                        <LayoutGrid className="text-blue-600" size={20}/>
                        Acciones Rápidas en Dashboard
                    </h2>
                </div>
            </div>
            
            {isActionsExpanded && (
            <div className="p-6 animate-fade-in-down">
                <p className="text-sm text-slate-500 mb-4">
                    Selecciona los accesos directos que deseas ver en el panel principal.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {AVAILABLE_ACTIONS.map((action) => (
                        <div 
                            key={action.id}
                            onClick={() => toggleAction(action.id)} 
                            className={`
                                cursor-pointer p-4 rounded-lg border-2 transition-all flex items-center gap-3
                                ${quickActions.includes(action.id) 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'}
                            `}
                        >
                            <div className={`p-2 rounded-lg ${quickActions.includes(action.id) ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                                {action.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-bold ${quickActions.includes(action.id) ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {action.label}
                                </h3>
                            </div>
                            {quickActions.includes(action.id) && <CheckSquare size={18} className="text-blue-500" />}
                        </div>
                    ))}
                </div>
            </div>
            )}
        </div>
    </div>
  );
}
