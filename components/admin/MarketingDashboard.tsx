import React, { useState, useEffect } from 'react';
import { TwitterPreview } from './preview/TwitterPreview';
import { LinkedInPreview } from './preview/LinkedInPreview';
import { InstagramPreview } from './preview/InstagramPreview';
import { BlogPreview } from './preview/BlogPreview';

/**
 * ==============================================================================
 * Archivo: components/admin/MarketingDashboard.tsx
 * ==============================================================================
 * Descripción:
 *  Centro Integral de Automatización de Marketing y Publicidad.
 *  Contiene el Dashboard de Métricas de Campañas y el Kanban de Contenidos.
 * ==============================================================================
 */

type MarketingTab = 'analytics' | 'calendar' | 'campaigns';

interface Draft {
  id: string;
  tema: string;
  blog_md: string;
  copy_x: string;
  copy_linkedin: string;
  copy_fb: string;
  copy_ig: string;
  estado: string;
  created_at: string;
  image_url?: string;
}

export default function MarketingDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<MarketingTab>('analytics');
  
  // Estados para la generación de contenido
  const [showModal, setShowModal] = useState(false);
  const [tema, setTema] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estados para la lista de borradores
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

  // Estados para la vista detallada (Modal) y Edición
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [draftViewTab, setDraftViewTab] = useState<'blog' | 'redes' | 'preview' | 'media'>('blog');
  const [isApproving, setIsApproving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState<Draft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleApprove = async (id: string) => {
    setIsApproving(true);
    try {
      const res = await fetch('/api/admin/marketing/drafts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setDrafts(prev => prev.filter(d => d.id !== id));
        setSelectedDraft(null);
        setIsEditing(false);
        alert('¡Borrador Aprobado! Ya está listo para ser publicado o enviado a redes.');
      } else {
        alert('Error al aprobar el borrador.');
      }
    } catch (e) {
      alert('Error de red al aprobar.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!editedDraft) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/marketing/drafts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedDraft)
      });
      
      if (res.ok) {
        setDrafts(prev => prev.map(d => d.id === editedDraft.id ? editedDraft : d));
        setSelectedDraft(editedDraft);
        setIsEditing(false);
      } else {
        alert('Error al guardar los cambios.');
      }
    } catch (error) {
      alert('Error de red al intentar guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDrafts = async () => {
    setIsLoadingDrafts(true);
    try {
      const res = await fetch('/api/admin/marketing/drafts');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDrafts((currentDrafts) => {
            const tempDrafts = currentDrafts.filter(d => d.estado === 'generando');
            if (tempDrafts.length > 0) {
              const result = [...json.data];
              tempDrafts.forEach(temp => {
                const isFound = result.find((d: Draft) => d.tema === temp.tema);
                if (!isFound) {
                  result.unshift(temp);
                }
              });
              return result;
            }
            return json.data;
          });
          return json.data;
        }
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setIsLoadingDrafts(false);
    }
    return null;
  };

  useEffect(() => {
    if (activeSubTab === 'calendar') {
      fetchDrafts();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(el => {
          el.style.height = 'auto';
          el.style.height = el.scrollHeight + 'px';
        });
      }, 50);
    }
  }, [isEditing, draftViewTab, selectedDraft]);

  const handleGenerateImage = async () => {
    if (!selectedDraft) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/admin/marketing/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDraft.id, tema: selectedDraft.tema })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newDraft = { ...selectedDraft, image_url: data.image_url };
        setSelectedDraft(newDraft);
        setDrafts(prev => prev.map(d => d.id === selectedDraft.id ? newDraft : d));
        if (editedDraft?.id === selectedDraft.id) setEditedDraft(newDraft);
      } else {
        alert('Error al generar la imagen: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      alert('Error de red al intentar generar la imagen.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!tema.trim()) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch('https://cerebro.agencialquimia.com/webhook/generar-borrador-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tema, keywords }),
      });
      
      if (res.ok) {
        setShowModal(false);
        const currentTema = tema;
        setTema('');
        
        // Añadir draft temporal con estado 'generando'
        setDrafts((prev) => [
          {
            id: 'temp-generating',
            tema: currentTema,
            blog_md: 'El cerebro está redactando el contenido. Esto puede tomar unos segundos...',
            copy_x: '',
            copy_linkedin: '',
            copy_fb: '',
            copy_ig: '',
            estado: 'generando',
            created_at: new Date().toISOString()
          },
          ...prev
        ]);

        // Iniciar polling para recargar hasta que aparezca el contenido (max 2 mins)
        const checkStatus = async (attempts = 0) => {
          if (attempts > 12) return; 
          const currentData = await fetchDrafts();
          if (currentData) {
            const found = currentData.find((d: Draft) => d.tema === currentTema);
            if (!found) {
              setTimeout(() => checkStatus(attempts + 1), 10000);
            }
          } else {
            setTimeout(() => checkStatus(attempts + 1), 10000);
          }
        };
        setTimeout(() => checkStatus(0), 10000);
      } else {
        alert('Hubo un error al contactar al webhook.');
      }
    } catch (error) {
      alert('Error de red. Asegúrate de que el workflow en n8n esté activo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navegación (Tabs) */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200/60 shadow-sm inline-flex gap-2">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          📊 Dashboard Ads
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'calendar'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          📝 Contenidos IA
        </button>
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === 'campaigns'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          ⚙️ Control de Campañas
        </button>
      </div>

      {/* Vistas Condicionales */}
      <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm min-h-[500px]">
        
        {/* VISTA 1: ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Rendimiento de Publicidad</h2>
                <p className="text-sm text-stone-500">Métricas extraídas vía n8n desde Meta y Google Ads.</p>
              </div>
              <button className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                🔄 Refrescar datos
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-stone-50 border border-stone-200/80 p-5 rounded-2xl">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Inversión Total</span>
                <p className="text-3xl font-black text-stone-900 mt-2">0,00 €</p>
                <span className="text-xs text-stone-400">Últimos 30 días</span>
              </div>
              <div className="bg-stone-50 border border-stone-200/80 p-5 rounded-2xl">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Leads Generados</span>
                <p className="text-3xl font-black text-stone-900 mt-2">0</p>
                <span className="text-xs text-stone-400">Atribuidos a campañas</span>
              </div>
              <div className="bg-stone-50 border border-stone-200/80 p-5 rounded-2xl">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">CPA Promedio</span>
                <p className="text-3xl font-black text-stone-900 mt-2">0,00 €</p>
                <span className="text-xs text-stone-400">Coste por adquisición</span>
              </div>
            </div>

            <div className="mt-8 bg-stone-100/50 rounded-2xl border border-stone-200/60 h-64 flex items-center justify-center">
              <p className="text-stone-400 font-medium text-sm text-center">
                El gráfico se mostrará aquí cuando la tabla <code>campaign_metrics</code> reciba los primeros datos.
              </p>
            </div>
          </div>
        )}

        {/* VISTA 2: CONTENIDOS IA */}
        {activeSubTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Pipeline de Contenidos</h2>
                <p className="text-sm text-stone-500">Borradores generados por Gemini 2.5 Pro (Blog + Redes).</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchDrafts}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  🔄 Refrescar
                </button>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  ✨ Generar Nuevo Tema
                </button>
              </div>
            </div>
            
            {isLoadingDrafts ? (
              <div className="bg-stone-100/50 rounded-2xl border border-stone-200/60 p-10 flex flex-col items-center justify-center gap-3">
                <span className="text-4xl animate-pulse">⏳</span>
                <p className="text-stone-500 font-medium text-sm text-center max-w-md">
                  Cargando borradores desde Supabase...
                </p>
              </div>
            ) : drafts.length === 0 ? (
              <div className="bg-stone-100/50 rounded-2xl border border-stone-200/60 p-10 flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">📝</span>
                <p className="text-stone-500 font-medium text-sm text-center max-w-md">
                  No hay borradores pendientes. ¡Genera un nuevo tema para empezar!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drafts.map((draft) => (
                  <div key={draft.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      {draft.estado === 'generando' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Redactando IA...
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {draft.estado}
                        </span>
                      )}
                      <span className="text-xs text-stone-400">
                        {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-2 leading-tight">
                      {draft.tema}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-3 mb-4">
                      {draft.blog_md}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        disabled={draft.estado === 'generando'} 
                        onClick={() => { 
                          setSelectedDraft(draft); 
                          setEditedDraft(draft);
                          setDraftViewTab('blog'); 
                          setIsEditing(false);
                        }}
                        className="bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-1"
                      >
                        Ver Blog
                      </button>
                      <button 
                        disabled={draft.estado === 'generando'} 
                        onClick={() => { 
                          setSelectedDraft(draft); 
                          setEditedDraft(draft);
                          setDraftViewTab('redes'); 
                          setIsEditing(false);
                        }}
                        className="bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-1"
                      >
                        Ver Redes
                      </button>
                      <button 
                        disabled={draft.estado === 'generando'} 
                        onClick={() => handleApprove(draft.id)}
                        className="bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        ✅ Aprobar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA 3: CAMPAÑAS */}
        {activeSubTab === 'campaigns' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold text-stone-900">Control Automático de Presupuesto</h2>
            <p className="text-sm text-stone-500">Define reglas para que n8n pause anuncios si el CPA es muy alto.</p>
            
            <div className="bg-stone-100/50 rounded-2xl border border-stone-200/60 p-10 flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🛡️</span>
              <p className="text-stone-500 font-medium text-sm text-center max-w-md">
                Interfaz de configuración de reglas en construcción.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE GENERACIÓN DE CONTENIDO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-stone-900">✨ Nuevo Pilar de Contenido</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-stone-500 mb-4">
              Ingresa el tema central. Nuestro agente de IA (Gemini 2.5 Pro) redactará el artículo del blog y extraerá los copys para X, Facebook, LinkedIn e Instagram.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">TEMA PRINCIPAL</label>
                <input 
                  type="text" 
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ej: Automatización de WhatsApp para Clínicas"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-3"
                  autoFocus
                />
                
                <label className="block text-xs font-bold text-stone-700 mb-1">PALABRAS CLAVE (SEO)</label>
                <input 
                  type="text" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ej: IA para pymes, automatizar ventas, bot whatsapp"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button 
                onClick={handleGenerateContent}
                disabled={isGenerating || !tema.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Procesando con IA...
                  </>
                ) : (
                  <>🚀 Lanzar a Producción</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISTA DETALLADA DEL BORRADOR */}
      {selectedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-bold text-stone-900 leading-tight">
                  {selectedDraft.tema}
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                  {selectedDraft.estado}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDraft(null)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Tabs del Modal */}
            <div className="flex border-b border-stone-100 px-6">
              <button 
                onClick={() => setDraftViewTab('blog')}
                className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${draftViewTab === 'blog' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                📝 Blog (Markdown)
              </button>
              <button 
                onClick={() => setDraftViewTab('redes')}
                className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${draftViewTab === 'redes' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                📱 Redes Sociales (Vista de Edición)
              </button>
              <button 
                onClick={() => setDraftViewTab('preview')}
                className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${draftViewTab === 'preview' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                👀 Previsualización Real
              </button>
              <button 
                onClick={() => setDraftViewTab('media')}
                className={`py-3 px-4 font-bold text-sm border-b-2 transition-colors ${draftViewTab === 'media' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
              >
                📸 Multimedia
              </button>
            </div>

            {/* Contenido desplazable */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
              {draftViewTab === 'blog' && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                  {isEditing ? (
                    <textarea 
                      className="w-full min-h-[400px] bg-stone-50 border border-emerald-500/50 rounded-xl p-4 text-stone-800 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none overflow-hidden"
                      value={editedDraft?.blog_md}
                      onChange={(e) => {
                        setEditedDraft({ ...editedDraft!, blog_md: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-stone-700 text-sm leading-relaxed">
                      {selectedDraft.blog_md}
                    </pre>
                  )}
                </div>
              )}
              {draftViewTab === 'redes' && (
                <div className="space-y-6">
                  {/* Twitter / X */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm relative pt-10">
                    <span className="absolute -top-3 left-4 bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">𝕏 Twitter (X)</span>
                    {isEditing ? (
                      <textarea 
                        className="w-full min-h-[128px] bg-stone-50 border border-emerald-500/50 rounded-xl p-3 text-stone-800 text-base font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none overflow-hidden mt-2"
                        value={editedDraft?.copy_x}
                        onChange={(e) => {
                          setEditedDraft({ ...editedDraft!, copy_x: e.target.value });
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-stone-700 text-base leading-relaxed mt-2">
                        {selectedDraft.copy_x}
                      </pre>
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm relative pt-10">
                    <span className="absolute -top-3 left-4 bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">👔 LinkedIn (B2B Corporativo)</span>
                    {isEditing ? (
                      <textarea 
                        className="w-full min-h-[192px] bg-stone-50 border border-emerald-500/50 rounded-xl p-3 text-stone-800 text-base font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none overflow-hidden mt-2"
                        value={editedDraft?.copy_linkedin}
                        onChange={(e) => {
                          setEditedDraft({ ...editedDraft!, copy_linkedin: e.target.value });
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-stone-700 text-base leading-relaxed mt-2">
                        {selectedDraft.copy_linkedin || "Genera un nuevo borrador para ver el copy."}
                      </pre>
                    )}
                  </div>

                  {/* Facebook */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm relative pt-10">
                    <span className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">📘 Facebook (Local / PYME)</span>
                    {isEditing ? (
                      <textarea 
                        className="w-full min-h-[192px] bg-stone-50 border border-emerald-500/50 rounded-xl p-3 text-stone-800 text-base font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none overflow-hidden mt-2"
                        value={editedDraft?.copy_fb}
                        onChange={(e) => {
                          setEditedDraft({ ...editedDraft!, copy_fb: e.target.value });
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-stone-700 text-base leading-relaxed mt-2">
                        {selectedDraft.copy_fb || "Genera un nuevo borrador para ver el copy."}
                      </pre>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm relative pt-10">
                    <span className="absolute -top-3 left-4 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">📸 Instagram (Carrusel)</span>
                    {isEditing ? (
                      <textarea 
                        className="w-full min-h-[256px] bg-stone-50 border border-emerald-500/50 rounded-xl p-3 text-stone-800 text-base font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none overflow-hidden mt-2"
                        value={editedDraft?.copy_ig}
                        onChange={(e) => {
                          setEditedDraft({ ...editedDraft!, copy_ig: e.target.value });
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-stone-700 text-base leading-relaxed mt-2">
                        {selectedDraft.copy_ig || "Genera un nuevo borrador para ver el copy de Instagram."}
                      </pre>
                    )}
                  </div>
                </div>
              )}
              {draftViewTab === 'preview' && (
                <div className="space-y-12 pb-12">
                  <div className="max-w-4xl mx-auto w-full">
                    <h4 className="text-stone-400 font-bold text-xs tracking-widest uppercase mb-4 text-center">— Previsualización del Blog —</h4>
                    <BlogPreview 
                      title={selectedDraft.tema} 
                      content={isEditing ? editedDraft?.blog_md || '' : selectedDraft.blog_md} 
                    />
                  </div>
                  
                  <div className="border-t border-stone-200/60 pt-12">
                    <h4 className="text-stone-400 font-bold text-xs tracking-widest uppercase mb-8 text-center">— Previsualización en Redes Sociales —</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                      <div className="space-y-8">
                        <TwitterPreview text={isEditing ? editedDraft?.copy_x || '' : selectedDraft.copy_x} />
                        <InstagramPreview text={isEditing ? editedDraft?.copy_ig || '' : selectedDraft.copy_ig} />
                      </div>
                      <div>
                        <LinkedInPreview text={isEditing ? editedDraft?.copy_linkedin || '' : selectedDraft.copy_linkedin} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {draftViewTab === 'media' && (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                  {selectedDraft.image_url ? (
                    <div className="flex flex-col items-center w-full">
                      <img src={selectedDraft.image_url} alt="Portada generada" className="w-full max-w-lg rounded-xl shadow-md mb-6 object-cover aspect-video" />
                      <button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className="bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-700 px-4 py-2 rounded-xl font-bold transition-colors text-sm"
                      >
                        {isGeneratingImage ? '⏳ Regenerando...' : '🔄 Regenerar Imagen'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center max-w-md">
                      <span className="text-6xl mb-4">🎨</span>
                      <h4 className="text-lg font-bold text-stone-900 mb-2">Sin Imagen de Portada</h4>
                      <p className="text-stone-500 text-sm mb-6">Genera una imagen corporativa usando IA para acompañar tu post del blog y redes sociales.</p>
                      <button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm w-full"
                      >
                        {isGeneratingImage ? '⏳ Pintando obra de arte...' : '✨ Generar Portada con IA'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Acciones Footer */}
            <div className="p-4 border-t border-stone-100 bg-white flex justify-between items-center">
              <div>
                {isEditing ? (
                  <button 
                    onClick={handleSaveEdits}
                    disabled={isSaving}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center gap-2"
                  >
                    {isSaving ? '💾 Guardando...' : '💾 Guardar Cambios'}
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center gap-2"
                  >
                    ✏️ Editar Borrador
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setSelectedDraft(null); setIsEditing(false); }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm"
                >
                  Cerrar
                </button>
                <button 
                  disabled={isApproving || isEditing}
                  onClick={() => handleApprove(selectedDraft.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm"
                >
                  {isApproving ? 'Aprobando...' : '✅ Aprobar y Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}