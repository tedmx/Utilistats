export type CounterType = 'elec_t1' | 'elec_t2' | 'water_cold' | 'water_hot' | 'gas'

export interface Property {
  id: string
  name: string
  address: string
  activeCounters: CounterType[] // Какие счетчики есть на объекте
}

export interface Tariff {
  resource: CounterType
  price: number
  startDate: string // ISO дата начала действия
}

export const MOCK_TARIFFS: Tariff[] = [
  // Электроэнергия T1
  { resource: 'elec_t1', price: 6.91, startDate: '2022-01-01' },
  { resource: 'elec_t1', price: 7.45, startDate: '2024-07-01' },
  { resource: 'elec_t1', price: 8.60, startDate: '2025-07-01' },

  // Электроэнергия T2
  { resource: 'elec_t2', price: 2.62, startDate: '2022-01-01' },
  { resource: 'elec_t2', price: 3.02, startDate: '2024-07-01' },
  { resource: 'elec_t2', price: 3.71, startDate: '2025-07-01' },

  // Холодная вода
  { resource: 'water_cold', price: 50.93, startDate: '2022-01-01' },
  { resource: 'water_cold', price: 59.80, startDate: '2024-07-01' },
  { resource: 'water_cold', price: 62.18, startDate: '2025-07-01' },

  // Горячая вода
  { resource: 'water_hot', price: 243.16, startDate: '2022-01-01' },
  { resource: 'water_hot', price: 272.14, startDate: '2024-07-01' },
  { resource: 'water_hot', price: 278.76, startDate: '2025-07-01' },

  // Тарифы на Газ (добавим историческую ретроспективу)
  { resource: 'gas', price: 7.10, startDate: '2023-01-01' },
  { resource: 'gas', price: 7.85, startDate: '2024-07-01' },
  { resource: 'gas', price: 8.50, startDate: '2025-07-01' }
]

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Квартира на Пушкина',
    address: 'ул. Пушкина, д. 10, кв. 42',
    activeCounters: ['elec_t1', 'elec_t2', 'water_cold', 'water_hot']
  },
  {
    id: '2',
    name: 'Дача',
    address: 'СНТ "Ромашка", уч. 15',
    activeCounters: ['water_cold', 'gas']
  }
]

export const MOCK_READINGS = {
  '1': [
    // 2024 год - Старт
    { id: '101', date: '2024-01-01', elec_t1: 5000, elec_t2: 2000, water_cold: 100, water_hot: 50 },
    { id: '102', date: '2024-02-01', elec_t1: 5110, elec_t2: 2090, water_cold: 105, water_hot: 54 }, // Пик зимы
    { id: '103', date: '2024-03-01', elec_t1: 5200, elec_t2: 2160, water_hot: 57, water_cold: 109 },
    { id: '104', date: '2024-04-01', elec_t1: 5275, elec_t2: 2215, water_hot: 60, water_cold: 112 },
    { id: '105', date: '2024-05-01', elec_t1: 5340, elec_t2: 2265, water_hot: 62, water_cold: 115 },
    { id: '106', date: '2024-06-01', elec_t1: 5400, elec_t2: 2310, water_hot: 63, water_cold: 117 }, // Минимум (июнь)
    { id: '107', date: '2024-07-01', elec_t1: 5480, elec_t2: 2370, water_hot: 66, water_cold: 121 }, // Повышение тарифа!
    { id: '108', date: '2024-08-01', elec_t1: 5570, elec_t2: 2435, water_hot: 70, water_cold: 126 },
    { id: '109', date: '2024-09-01', elec_t1: 5655, elec_t2: 2495, water_hot: 73, water_cold: 130 },
    { id: '110', date: '2024-10-01', elec_t1: 5745, elec_t2: 2565, water_hot: 76, water_cold: 134 },
    { id: '111', date: '2024-11-01', elec_t1: 5850, elec_t2: 2650, water_hot: 80, water_cold: 139 },
    { id: '112', date: '2024-12-01', elec_t1: 5960, elec_t2: 2740, water_hot: 84, water_cold: 144 },

    // 2025 год
    { id: '201', date: '2025-01-01', elec_t1: 6070, elec_t2: 2830, water_hot: 88, water_cold: 149 },
    { id: '202', date: '2025-02-01', elec_t1: 6175, elec_t2: 2915, water_hot: 91, water_cold: 153 },
    { id: '203', date: '2025-03-01', elec_t1: 6265, elec_t2: 2985, water_hot: 94, water_cold: 157 },
    { id: '204', date: '2025-04-01', elec_t1: 6345, elec_t2: 3045, water_hot: 96, water_cold: 160 },
    { id: '205', date: '2025-05-01', elec_t1: 6415, elec_t2: 3095, water_hot: 98, water_cold: 162 },
    { id: '206', date: '2025-06-01', elec_t1: 6475, elec_t2: 3140, water_hot: 99, water_cold: 164 },
    { id: '207', date: '2025-07-01', elec_t1: 6565, elec_t2: 3215, water_hot: 102, water_cold: 168 }, // Второе повышение!
    { id: '208', date: '2025-08-01', elec_t1: 6660, elec_t2: 3295, water_hot: 106, water_cold: 173 },
    { id: '209', date: '2025-09-01', elec_t1: 6740, elec_t2: 3360, water_hot: 109, water_cold: 177 },
    { id: '210', date: '2025-10-01', elec_t1: 6830, elec_t2: 3435, water_hot: 112, water_cold: 181 },
    { id: '211', date: '2025-11-01', elec_t1: 6940, elec_t2: 3525, water_hot: 116, water_cold: 186 },
    { id: '212', date: '2025-12-01', elec_t1: 7050, elec_t2: 3615, water_hot: 120, water_cold: 191 },

    // 2026 год
    { id: '301', date: '2026-01-01', elec_t1: 7160, elec_t2: 3705, water_hot: 124, water_cold: 196 },
    { id: '302', date: '2026-02-01', elec_t1: 7265, elec_t2: 3790, water_hot: 127, water_cold: 200 }
  ],
  '2': [
    // 2024 год: Сезон открывается в мае
    { id: 'd1', date: '2024-05-01', water_cold: 100, gas: 1500 }, // Точка отсчета
    { id: 'd2', date: '2024-06-01', water_cold: 103, gas: 1510 }, // Начало лета: вода пошла, газ приутих
    { id: 'd3', date: '2024-07-01', water_cold: 108, gas: 1512 }, // Июль: пик полива (+5 кубов), газ почти 0
    { id: 'd4', date: '2024-08-01', water_cold: 112, gas: 1515 }, // Август: жара
    { id: 'd5', date: '2024-09-01', water_cold: 115, gas: 1550 }, // Сентябрь: полив меньше, начали греться
    { id: 'd6', date: '2024-10-01', water_cold: 116, gas: 1750 }, // Октябрь: закрытие сезона воды, старт котла (+200 кубов)
    { id: 'd7', date: '2024-11-01', water_cold: 116, gas: 2200 }, // Ноябрь: мороз (+450 кубов)
    { id: 'd8', date: '2024-12-01', water_cold: 116, gas: 2820 }, // Декабрь: пик зимы (+620 кубов — около 20/день)

    // 2025 год
    { id: 'd9', date: '2025-01-01', water_cold: 116, gas: 3440 }, // Январь: мороз
    { id: 'd10', date: '2025-02-01', water_cold: 116, gas: 4000 }, // Февраль
    { id: 'd11', date: '2025-03-01', water_cold: 116, gas: 4400 }, // Март: все еще греем
    { id: 'd12', date: '2025-04-01', water_cold: 117, gas: 4600 }, // Апрель: приехали проверить, помыли руки
    { id: 'd13', date: '2025-05-01', water_cold: 120, gas: 4700 }, // Май: старт сезона
    { id: 'd14', date: '2025-06-01', water_cold: 124, gas: 4720 },
    { id: 'd15', date: '2025-07-01', water_cold: 129, gas: 4725 }, // Пик воды, новый тариф на газ
    { id: 'd16', date: '2025-08-01', water_cold: 133, gas: 4730 },
    { id: 'd17', date: '2025-09-01', water_cold: 136, gas: 4780 },
    { id: 'd18', date: '2025-10-01', water_cold: 137, gas: 5000 },
    { id: 'd19', date: '2025-11-01', water_cold: 137, gas: 5500 },
    { id: 'd20', date: '2025-12-01', water_cold: 137, gas: 6120 },

    // 2026 год
    { id: 'd21', date: '2026-01-01', water_cold: 137, gas: 6740 },
    { id: 'd22', date: '2026-02-01', water_cold: 137, gas: 7300 }
  ]
}
