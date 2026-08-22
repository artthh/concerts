// Spanish first, English second — same convention as the gym app.
export const LANGS = ['es', 'en']

const STRINGS = {
  es: {
    appName: 'Encore',
    tagline: 'Los conciertos que vienen y los que ya viviste',
    navHome: 'Home',
    navEvents: 'Events',
    navHistory: 'History',
    tabStats: 'Números',
    tabSettings: 'Ajustes',

    add: 'Agregar concierto',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Borrar',
    confirmDelete: '¿Borrar este concierto?',
    close: 'Cerrar',
    search: 'Buscar artista, ciudad, venue…',
    noResults: 'Nada coincide con tu búsqueda.',

    emptyUpcoming: 'No tienes conciertos agendados. Agrega el siguiente.',
    emptyHistory: 'Todavía no hay conciertos en tu historial.',
    emptyStats: 'Agrega conciertos para ver tus números.',

    today: 'Hoy',
    tomorrow: 'Mañana',
    inDays: 'En {n} días',
    daysAgo: 'Hace {n} días',
    nextUp: 'El siguiente',
    countdown: 'Cuenta regresiva',
    yesterday: 'Ayer',
    daysLeft: 'días restantes',
    daysSince: 'días desde',

    artist: 'Artista',
    photo: 'Foto del artista',
    emoji: 'Emoji',
    emojiHint: 'Se muestra junto al nombre en las tarjetas.',
    photoHint: 'Se recorta automáticamente para las tarjetas del inicio.',
    addPhoto: 'Elegir foto',
    changePhoto: 'Cambiar foto',
    removePhoto: 'Quitar',
    photoFailed: 'No pudimos leer esa imagen',
    photoNotSaved: 'Guardamos el concierto, pero no hubo espacio para la foto',
    moreDetails: 'Más detalles',
    hideDetails: 'Ocultar detalles',
    openers: 'Teloneros',
    tour: 'Tour o festival',
    venue: 'Venue',
    city: 'Ciudad',
    country: 'País',
    date: 'Fecha',
    time: 'Hora',
    price: 'Precio',
    currency: 'Moneda',
    seat: 'Asiento / zona',
    company: 'Con quién',
    rating: 'Calificación',
    notes: 'Notas',
    setlist: 'Setlist',
    ticketUrl: 'Liga del boleto',
    listHint: 'Uno por línea o separados por coma',
    setlistHint: 'Una canción por línea',
    artistRequired: 'El artista es obligatorio',

    total: 'Conciertos',
    pastCount: 'Vividos',
    upcomingCount: 'Por venir',
    uniqueArtists: 'Artistas distintos',
    uniqueCities: 'Ciudades',
    spend: 'Gasto en boletos',
    perYear: 'Por año',
    topArtists: 'Artistas más vistos',
    topCities: 'Ciudades',
    topCompany: 'Compañía frecuente',
    bestRated: 'Mejor calificados',
    averageRating: 'Calificación promedio',

    theme: 'Tema',
    dark: 'Oscuro',
    light: 'Claro',
    language: 'Idioma',
    data: 'Datos',
    exportBackup: 'Exportar respaldo',
    importBackup: 'Importar respaldo',
    importReplace: 'Reemplazar todo',
    importMerge: 'Combinar',
    importDone: 'Se importaron {n} conciertos',
    importFailed: 'No pudimos leer ese archivo',
    storageNote: 'Todo se guarda en este dispositivo. Exporta un respaldo antes de cambiar de teléfono.',
    installTitle: 'Agregar a la pantalla de inicio',
    installBody: 'En Safari: Compartir → Agregar a inicio. En Chrome: menú → Agregar a pantalla principal.',
  },
  en: {
    appName: 'Encore',
    tagline: 'The shows ahead and the ones you already lived',
    navHome: 'Home',
    navEvents: 'Events',
    navHistory: 'History',
    tabStats: 'Stats',
    tabSettings: 'Settings',

    add: 'Add concert',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDelete: 'Delete this concert?',
    close: 'Close',
    search: 'Search artist, city, venue…',
    noResults: 'Nothing matches your search.',

    emptyUpcoming: 'No shows on the calendar. Add the next one.',
    emptyHistory: 'No concerts in your history yet.',
    emptyStats: 'Add concerts to see your numbers.',

    today: 'Today',
    tomorrow: 'Tomorrow',
    inDays: 'In {n} days',
    daysAgo: '{n} days ago',
    nextUp: 'Next up',
    countdown: 'Countdown',
    yesterday: 'Yesterday',
    daysLeft: 'days left',
    daysSince: 'days since',

    artist: 'Artist',
    photo: 'Artist photo',
    emoji: 'Emoji',
    emojiHint: 'Shown next to the name on the cards.',
    photoHint: 'Cropped automatically for the home cards.',
    addPhoto: 'Choose photo',
    changePhoto: 'Change photo',
    removePhoto: 'Remove',
    photoFailed: 'We could not read that image',
    photoNotSaved: 'Concert saved, but there was no room for the photo',
    moreDetails: 'More details',
    hideDetails: 'Hide details',
    openers: 'Opening acts',
    tour: 'Tour or festival',
    venue: 'Venue',
    city: 'City',
    country: 'Country',
    date: 'Date',
    time: 'Time',
    price: 'Price',
    currency: 'Currency',
    seat: 'Seat / section',
    company: 'Went with',
    rating: 'Rating',
    notes: 'Notes',
    setlist: 'Setlist',
    ticketUrl: 'Ticket link',
    listHint: 'One per line or comma separated',
    setlistHint: 'One song per line',
    artistRequired: 'Artist is required',

    total: 'Concerts',
    pastCount: 'Attended',
    upcomingCount: 'Upcoming',
    uniqueArtists: 'Distinct artists',
    uniqueCities: 'Cities',
    spend: 'Ticket spend',
    perYear: 'Per year',
    topArtists: 'Most seen artists',
    topCities: 'Cities',
    topCompany: 'Frequent company',
    bestRated: 'Best rated',
    averageRating: 'Average rating',

    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
    data: 'Data',
    exportBackup: 'Export backup',
    importBackup: 'Import backup',
    importReplace: 'Replace everything',
    importMerge: 'Merge',
    importDone: 'Imported {n} concerts',
    importFailed: 'We could not read that file',
    storageNote: 'Everything is stored on this device. Export a backup before switching phones.',
    installTitle: 'Add to home screen',
    installBody: 'Safari: Share → Add to Home Screen. Chrome: menu → Add to Home screen.',
  },
}

export function translator(lang) {
  const table = STRINGS[lang] || STRINGS.es
  return function t(key, vars) {
    let value = table[key] ?? STRINGS.es[key] ?? key
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll('{' + name + '}', String(replacement))
      }
    }
    return value
  }
}

export function formatDate(dateISO, lang) {
  const parsed = Date.parse(String(dateISO) + 'T00:00:00')
  if (Number.isNaN(parsed)) return String(dateISO || '')
  return new Date(parsed).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// 1st, 2nd, 3rd, 4th... 11th, 12th, 13th, 21st.
function ordinal(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return day + 'th'
  return day + ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : day % 10]
}

// The card format: "September 9th | 2026" / "9 de septiembre | 2026".
export function formatEventDate(dateISO, lang) {
  const parsed = Date.parse(String(dateISO) + 'T00:00:00')
  if (Number.isNaN(parsed)) return String(dateISO || '')
  const date = new Date(parsed)
  const day = date.getDate()
  const year = date.getFullYear()
  if (lang === 'en') {
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    return `${month} ${ordinal(day)} | ${year}`
  }
  return `${day} de ${MONTHS_ES[date.getMonth()]} | ${year}`
}

export function formatMoney(amount, currency, lang) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return ''
  try {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ${currency || ''}`.trim()
  }
}

// "In 3 days" / "3 days ago" / "Today", from a day delta.
export function relativeDays(delta, t) {
  if (delta === null) return ''
  if (delta === 0) return t('today')
  if (delta === 1) return t('tomorrow')
  if (delta > 1) return t('inDays', { n: delta })
  return t('daysAgo', { n: Math.abs(delta) })
}
