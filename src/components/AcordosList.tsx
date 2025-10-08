import React from 'react';
import { useAcordos } from '../hooks/useAcordos';

export const AcordosList: React.FC = () => {
  const { acordos, loading, error, refetch } = useAcordos();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando termos de cooperação...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="font-medium">Erro ao carregar termos de cooperação</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Termos de Cooperação Técnica - Roraima ({acordos.length})
        </h2>
        <button
          onClick={refetch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {acordos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum termo de cooperação encontrado
        </div>
      ) : (
        <div className="grid gap-4">
          {acordos.map((acordo, index) => (
            <div
              key={acordo.id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(acordo)
                  .filter(([key]) => key !== 'id')
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {value?.toString() || '-'}
                      </dd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
