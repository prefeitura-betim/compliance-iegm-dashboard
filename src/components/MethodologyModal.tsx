import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Info, Calculator, Percent, Award } from 'lucide-react'

interface MethodologyModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold leading-6 text-gray-900 flex items-center gap-2"
                                    >
                                        <Info className="text-betim-blue" />
                                        Metodologia de Pontuação IEGM
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* 1. Como funciona (Questão e Indicador) */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Calculator size={18} className="text-gray-500" />
                                            Cálculo da Pontuação
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <h5 className="font-bold text-sm text-gray-800 mb-2">Por Questão</h5>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Cada questão recebe <strong>pontos absolutos</strong> (não percentual).
                                                    A pontuação máxima (Pmáx) varia por questão.
                                                </p>
                                                <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc list-inside">
                                                    <li>Ex: Pmáx = 2 pontos</li>
                                                    <li>Ex: Pmáx = 10 pontos</li>
                                                    <li>Ex: Pmáx = 18 pontos</li>
                                                </ul>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <h5 className="font-bold text-sm text-gray-800 mb-2">Por Indicador</h5>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    A soma dos pontos de todas as questões gera a <strong>nota do indicador</strong>.
                                                    Essa nota é convertida em um percentual (0-100%) para compor o índice.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. IEGM Geral (Pesos) */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Percent size={18} className="text-gray-500" />
                                            Composição do IEGM Geral (Média Ponderada)
                                        </h4>
                                        <div className="overflow-hidden rounded-xl border border-gray-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dimensão</th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Peso</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                                    {[
                                                        { dim: 'i-Educ', peso: '20%' },
                                                        { dim: 'i-Saúde', peso: '20%' },
                                                        { dim: 'i-Planej', peso: '20%' },
                                                        { dim: 'i-Fiscal', peso: '20%' },
                                                        { dim: 'i-Amb', peso: '10%' },
                                                        { dim: 'i-Cidade', peso: '5%' },
                                                        { dim: 'i-GovTI', peso: '5%' },
                                                    ].map((item, idx) => (
                                                        <tr key={item.dim} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                            <td className="px-4 py-2 font-medium text-gray-700">{item.dim}</td>
                                                            <td className="px-4 py-2 text-right text-gray-600 font-mono">{item.peso}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 3. Faixas de Resultado */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Award size={18} className="text-gray-500" />
                                            Faixas de Classificação
                                        </h4>
                                        <div className="overflow-hidden rounded-xl border border-gray-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nota / Faixa</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Critério</th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Classificação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                                    {[
                                                        { nota: 'A', crit: '≥ 90% (e 5 notas A)', class: 'Altamente Efetiva', color: 'bg-green-100 text-green-800' },
                                                        { nota: 'B+', crit: '75,00% a 89,99%', class: 'Muito Efetiva', color: 'bg-teal-100 text-teal-800' },
                                                        { nota: 'B', crit: '60,00% a 74,99%', class: 'Efetiva', color: 'bg-yellow-100 text-yellow-800' },
                                                        { nota: 'C+', crit: '50,00% a 59,99%', class: 'Em Fase de Adequação', color: 'bg-orange-100 text-orange-800' },
                                                        { nota: 'C', crit: '< 49,99%', class: 'Baixo Nível de Adequação', color: 'bg-red-100 text-red-800' },
                                                    ].map((item) => (
                                                        <tr key={item.nota}>
                                                            <td className="px-4 py-2">
                                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${item.color}`}>
                                                                    {item.nota}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-600 font-medium">{item.crit}</td>
                                                            <td className="px-4 py-2 text-gray-800 font-semibold">{item.class}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 text-center text-xs text-gray-400">
                                    Fonte: Manual de Orientação do IEGM (TCEMG)
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
