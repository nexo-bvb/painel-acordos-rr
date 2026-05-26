import React, { useState, useMemo, useEffect } from 'react';
import { useAcordos } from '../hooks/useAcordos';
import type { Acordo } from '../types/acordos';
import jsPDF from 'jspdf';

export const TermosTable: React.FC = () => {
  const { acordos, loading, error, refetch } = useAcordos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedAcordo, setSelectedAcordo] = useState<Acordo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar dados baseado na busca
  const filteredAcordos = useMemo(() => {
    if (!searchTerm) return acordos;
    
    return acordos.filter(acordo => 
      Object.values(acordo).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [acordos, searchTerm]);


  // Função para obter o link real da consulta pública
  const getConsultaLink = (acordo: Acordo) => {
    // Primeiro tentar usar o link real extraído do Excel
    if (acordo.link_consulta_pública && acordo.link_consulta_pública.trim()) {
      return acordo.link_consulta_pública;
    }
    
    // Fallback: gerar link baseado no texto (caso não tenha link)
    const consultaPublica = acordo.consulta_pública_sei || '';
    const processo = acordo.processo || '';
    
    const seiNumber = consultaPublica.match(/SEI\/GRR\s*-\s*(\d+)/i);
    if (seiNumber) {
      return `https://sei.rr.gov.br/sei/controlador.php?acao=procedimento_trabalhar&id_procedimento=${seiNumber[1]}`;
    }
    
    if (processo) {
      return `https://sei.rr.gov.br/sei/controlador.php?acao=procedimento_pesquisar&txt_numero_procedimento=${processo}`;
    }
    
    return null;
  };

  // Função para exportar dados para PDF
  const exportToPDF = (acordo: Acordo) => {
    const doc = new jsPDF();
    
    // Configurações do PDF
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    let yPosition = 20;
    
    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE COOPERAÇÃO TÉCNICA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Separador
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Função para adicionar texto com quebra de linha
    const addText = (label: string, value: string, isBold = false) => {
      if (!value || value === '-') return;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      // Label
      doc.text(label + ':', margin, yPosition);
      yPosition += lineHeight;
      
      // Value (com quebra de linha)
      const maxWidth = pageWidth - (margin * 2);
      const lines = doc.splitTextToSize(value, maxWidth);
      
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin + 5, yPosition);
      yPosition += (lines.length * lineHeight) + 5;
      
      // Verificar se precisa de nova página
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = 20;
      }
    };
    
    // Dados do acordo
    addText('Ano', acordo.ano || '', true);
    addText('Processo', acordo.processo || '');
    addText('Instrumento', acordo.instrumento || '');
    addText('Partes Envolvidas', acordo.partes || '');
    addText('Objeto', acordo.objeto || '');
    addText('Data de Assinatura/Publicação', acordo.data_assinatura_publicação || '');
    addText('Término de Vigência', acordo.término_de_vigência || '');
    addText('Consulta Pública SEI', acordo.consulta_pública_sei || '');
    
    // Rodapé
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento gerado em: ' + new Date().toLocaleDateString('pt-BR'), pageWidth / 2, yPosition, { align: 'center' });
    
    // Salvar PDF
    const fileName = `termo_cooperacao_${acordo.ano || 'sem_ano'}_${acordo.processo || 'sem_processo'}.pdf`;
    doc.save(fileName);
  };

  // Função para exportar múltiplos acordos selecionados
  const exportSelectedToPDF = () => {
    if (selectedRows.size === 0) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    let yPosition = 20;
    let isFirstAcordo = true;
    
    // Título principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMOS DE COOPERAÇÃO TÉCNICA - ESTADO DE RORAIMA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Documentos Selecionados: ${selectedRows.size}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Separador
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Função para adicionar texto com quebra de linha
    const addText = (label: string, value: string, isBold = false, fontSize = 10) => {
      if (!value || value === '-') return;
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      // Label
      doc.text(label + ':', margin, yPosition);
      yPosition += lineHeight;
      
      // Value (com quebra de linha)
      const maxWidth = pageWidth - (margin * 2);
      const lines = doc.splitTextToSize(value, maxWidth);
      
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin + 5, yPosition);
      yPosition += (lines.length * lineHeight) + 5;
      
      // Verificar se precisa de nova página
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = 20;
      }
    };
    
    // Processar cada acordo selecionado
    selectedRows.forEach((index) => {
      const acordo = filteredAcordos[index];
      if (!acordo) return;
      
      // Título do acordo (se não for o primeiro)
      if (!isFirstAcordo) {
        yPosition += 10;
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 15;
        
        // Verificar se precisa de nova página
        if (yPosition > doc.internal.pageSize.height - 100) {
          doc.addPage();
          yPosition = 20;
        }
      }
      
      // Título do acordo
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`TERMO ${index + 1} - ${acordo.ano || 'Sem Ano'}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Dados do acordo
      addText('Processo', acordo.processo || '');
      addText('Instrumento', acordo.instrumento || '');
      addText('Partes Envolvidas', acordo.partes || '');
      addText('Objeto', acordo.objeto || '');
      addText('Data de Assinatura/Publicação', acordo.data_assinatura_publicação || '');
      addText('Término de Vigência', acordo.término_de_vigência || '');
      addText('Consulta Pública SEI', acordo.consulta_pública_sei || '');
      
      isFirstAcordo = false;
    });
    
    // Rodapé
    yPosition += 20;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Documento gerado em: ' + new Date().toLocaleDateString('pt-BR'), pageWidth / 2, yPosition, { align: 'center' });
    
    // Salvar PDF
    const fileName = `termos_cooperacao_selecionados_${selectedRows.size}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };


  // Função para selecionar/deselecionar linha
  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  // Função para abrir modal com detalhes
  const openAcordoDetails = (acordo: Acordo) => {
    setSelectedAcordo(acordo);
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAcordo(null);
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);


  // Função para selecionar todos
  const toggleSelectAll = () => {
    if (selectedRows.size === filteredAcordos.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAcordos.map((_, index) => index)));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Carregando termos de cooperação...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3>Erro ao carregar termos de cooperação</h3>
          <p>{error}</p>
        </div>
        <button onClick={refetch} className="retry-button">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (acordos.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum termo de cooperação encontrado</p>
        <button onClick={refetch} className="refresh-button">
          Atualizar
        </button>
      </div>
    );
  }

      // Pegar as chaves do primeiro item para criar as colunas
      const columns = Object.keys(filteredAcordos[0] || {}).filter(key => key !== 'id');
      const displayColumns = columns.slice(0, 8); // Limitar a 8 colunas principais

  return (
    <div className="table-panel">
          {/* Cabeçalho removido */}

          {/* Barra de busca e filtros */}
          <div className="search-bar">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Buscar em todos os campos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="selection-info">
              {selectedRows.size > 0 && (
                <>
                  <span className="selected-count">
                    {selectedRows.size} selecionado(s)
                  </span>
                  <button 
                    className="export-selected-button"
                    onClick={exportSelectedToPDF}
                    title="Exportar selecionados para PDF"
                  >
                    📄 Exportar Selecionados
                  </button>
                </>
              )}
            </div>
          </div>

      {/* Tabela */}
      <div className="table-container">
        <table className="data-table">
          <thead>
                <tr>
                  <th className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredAcordos.length && filteredAcordos.length > 0}
                      onChange={toggleSelectAll}
                      className="select-checkbox"
                    />
                  </th>
                  <th className="actions-column">AÇÕES</th>
                  {displayColumns.map((column, index) => (
                    <th key={column} className={index >= 6 ? 'compact-column' : ''}>
                      {column.replace(/_/g, ' ').toUpperCase()}
                    </th>
                  ))}
                </tr>
          </thead>
          <tbody>
            {filteredAcordos.map((acordo, index) => (
                <tr 
                  key={acordo.id || index}
                  className={selectedRows.has(index) ? 'selected-row' : ''}
                >
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => toggleRowSelection(index)}
                      className="select-checkbox"
                    />
                  </td>
                  <td className="actions-column">
                    <button 
                      className="consult-button"
                      title="Ver detalhes completos"
                      onClick={() => openAcordoDetails(acordo)}
                    >
                      Ver Detalhes
                    </button>
                  </td>
                  {displayColumns.map((column, colIndex) => {
                  const cellValue = acordo[column]?.toString();
                  const isConsultaPublica = column.toLowerCase().includes('consulta') || column.toLowerCase().includes('sei');
                  const isDateColumn = column.toLowerCase().includes('data') || column.toLowerCase().includes('vigencia');
                  
                  return (
                        <td 
                          key={column} 
                          className={`data-cell ${colIndex >= 6 ? 'compact-column' : ''} ${isDateColumn ? 'date-cell' : ''}`}
                          title={cellValue}
                        >
                      {isConsultaPublica && cellValue && cellValue !== '-' ? (
                        <a
                          href={getConsultaLink(acordo) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sei-link"
                          title="Abrir consulta pública no SEI"
                        >
                          Consulte aqui
                        </a>
                      ) : (
                        cellValue || '-'
                      )}
                    </td>
                  );
                })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Rodapé informativo */}
      <div className="panel-footer">
        <p>
          Painel de consulta aos termos de cooperação técnicas do estado de Roraima.
        </p>
      </div>

      {/* Modal de detalhes */}
      {isModalOpen && selectedAcordo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Termo de Cooperação</h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Ano:</label>
                  <span>{selectedAcordo.ano || '-'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Processo:</label>
                  <span>{selectedAcordo.processo || '-'}</span>
                </div>
                
                <div className="detail-item full-width">
                  <label>Instrumento:</label>
                  <span>{selectedAcordo.instrumento || '-'}</span>
                </div>
                
                <div className="detail-item full-width">
                  <label>Partes Envolvidas:</label>
                  <div className="detail-text">
                    {selectedAcordo.partes || '-'}
                  </div>
                </div>
                
                <div className="detail-item full-width">
                  <label>Objeto:</label>
                  <div className="detail-text">
                    {selectedAcordo.objeto || '-'}
                  </div>
                </div>
                
                    <div className="detail-item date-field">
                      <label>Data de Assinatura/Publicação:</label>
                      <span>{selectedAcordo.data_assinatura_publicação || '-'}</span>
                    </div>
                    
                    <div className="detail-item date-field">
                      <label>Término de Vigência:</label>
                      <span>{selectedAcordo.término_de_vigência || '-'}</span>
                    </div>
                
                    <div className="detail-item full-width">
                      <label>Consulta Pública SEI:</label>
                      <div className="detail-text">
                        {selectedAcordo.consulta_pública_sei ? (
                          <a
                            href={getConsultaLink(selectedAcordo) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sei-link-modal"
                          >
                            Consulte aqui
                          </a>
                        ) : '-'}
                      </div>
                    </div>
              </div>
            </div>
            
            <div className="modal-footer">
                  <button 
                    className="modal-action-button"
                    onClick={() => {
                      const link = getConsultaLink(selectedAcordo);
                      if (link) {
                        window.open(link, '_blank');
                      }
                    }}
                  >
                🔍 Abrir no SEI
              </button>
              <button 
                className="modal-action-button secondary"
                onClick={() => exportToPDF(selectedAcordo)}
                style={{ backgroundColor: '#dc3545' }}
              >
                📄 Exportar PDF
              </button>
              <button 
                className="modal-action-button secondary"
                onClick={() => {
                  const dataToCopy = Object.entries(selectedAcordo)
                    .filter(([key]) => key !== 'id')
                    .map(([key, value]) => `${key}: ${value || '-'}`)
                    .join('\n');
                  navigator.clipboard.writeText(dataToCopy);
                  alert('Detalhes copiados para a área de transferência!');
                }}
              >
                📋 Copiar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
