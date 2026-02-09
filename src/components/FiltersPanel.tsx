import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { Filter, Calendar, Building2, MapPin, Loader2, ChevronDown, Check } from 'lucide-react'

interface FiltersPanelProps {
    municipio: string
    ano: number
    tribunal: string
}



async function fetchAnos(): Promise<number[]> {
    const res = await fetch('/api/anos-disponiveis')
    if (!res.ok) throw new Error('Erro ao buscar anos')
    return res.json()
}

export default function FiltersPanel({ ano, tribunal }: FiltersPanelProps) {
    const navigate = useNavigate()

    // Buscar anos disponíveis
    const { data: anosDisponiveis = [], isLoading: loadingAnos } = useQuery({
        queryKey: ['anos-disponiveis'],
        queryFn: fetchAnos,
        staleTime: 1000 * 60 * 30, // 30 min cache
    })

    const handleFilterChange = (key: string, value: string) => {
        const searchParams = new URLSearchParams(window.location.search)
        searchParams.set(key, value)
        navigate(`?${searchParams.toString()}`)
    }

    return (
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-betim border border-gray-100 flex flex-col md:flex-row gap-4 sm:gap-6 md:items-center">

            <div className="flex items-center gap-2 text-betim-blue font-bold uppercase tracking-wider text-xs sm:text-sm min-w-max border-b md:border-b-0 md:border-r border-gray-100 pb-3 sm:pb-4 md:pb-0 md:pr-6">
                <Filter size={16} className="sm:hidden" />
                <Filter size={20} className="hidden sm:block" />
                <span>Filtros</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 flex-1">
                {/* Filtro Município */}
                <div className="flex-1 min-w-[140px] sm:min-w-[200px]">
                    <label htmlFor="municipio" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        <div className="flex items-center gap-1">
                            <MapPin size={12} /> Município
                        </div>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value="Betim"
                            disabled
                            className="w-full bg-gray-50 border border-gray-200 text-gray-500 py-2.5 px-4 rounded-lg font-medium cursor-not-allowed"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <MapPin size={16} />
                        </div>
                    </div>
                </div>

                {/* Filtro Ano */}
                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        <div className="flex items-center gap-1">
                            <Calendar size={12} /> Ano Referência
                        </div>
                    </label>
                    <div className="relative">
                        {loadingAnos ? (
                            <div className="w-full bg-gray-50 border border-gray-200 text-gray-400 py-2.5 px-4 rounded-lg font-medium flex items-center justify-between">
                                <span>Carregando...</span>
                                <Loader2 size={16} className="animate-spin" />
                            </div>
                        ) : (
                            <Listbox value={ano} onChange={(val) => handleFilterChange('ano', String(val))}>
                                <div className="relative mt-1">
                                    <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 pl-4 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-200/50 focus:outline-none focus:ring-2 focus:ring-betim-blue sm:text-sm sm:leading-6 hover:bg-gray-50 transition-colors">
                                        <span className="block truncate font-bold text-gray-900 text-lg">{ano}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </ListboxButton>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-gray-100 focus:outline-none sm:text-sm">
                                            {anosDisponiveis.map((a) => (
                                                <ListboxOption
                                                    key={a}
                                                    className={({ active }) =>
                                                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${active ? 'bg-betim-blue/10 text-betim-blue' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={a}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? 'font-black' : 'font-medium'
                                                                    }`}
                                                            >
                                                                {a}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-betim-blue">
                                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </Transition>
                                </div>
                            </Listbox>
                        )}
                    </div>
                </div>

                {/* Filtro Tribunal */}
                <div className="w-full md:w-48">
                    <label htmlFor="tribunal" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        <div className="flex items-center gap-1">
                            <Building2 size={12} /> Tribunal
                        </div>
                    </label>
                    <div className="relative">
                        <select
                            id="tribunal"
                            value={tribunal}
                            onChange={(e) => handleFilterChange('tribunal', e.target.value)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-betim-blue focus:ring-1 focus:ring-betim-blue transition-all font-medium opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <option value={tribunal}>{tribunal}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 opacity-50">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded border border-gray-100 min-w-max hidden lg:block">
                Base de dados: <span className="font-semibold text-gray-600">{tribunal} / {ano}</span>
            </div>
        </div>
    )
}
