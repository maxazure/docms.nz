import type { Site, MenuItem } from '~/types'

export const useSiteData = () => {
  const api = useApi()

  // Site data state
  const site = useState<Site | null>('site', () => null)
  const menu = useState<MenuItem[]>('menu', () => [])

  // Fetch site data
  const fetchSite = async () => {
    if (!site.value) {
      try {
        site.value = await api.site.get()
      } catch (error) {
        console.error('Failed to fetch site data:', error)
      }
    }
    return site.value
  }

  // Fetch menu data
  const fetchMenu = async (menuCode = 'main') => {
    if (menu.value.length === 0) {
      try {
        menu.value = await api.menu.getAll(menuCode)
      } catch (error) {
        console.error('Failed to fetch menu data:', error)
      }
    }
    return menu.value
  }

  // Get theme tokens as CSS variables
  const themeVars = computed(() => {
    if (!site.value?.themeTokens) return {}

    const tokens = site.value.themeTokens
    return {
      '--primary-color': tokens.primaryColor || '#10B981',
      '--secondary-color': tokens.secondaryColor || '#059669',
      '--accent-color': tokens.accentColor || '#34D399',
      '--font-family': tokens.fontFamily || 'system-ui, sans-serif',
      '--font-size': tokens.fontSize || '16px',
      '--border-radius': tokens.borderRadius || '0.375rem',
      '--box-shadow': tokens.boxShadow || '0 1px 3px rgba(0,0,0,0.12)',
      '--spacing': tokens.spacing || '1rem',
    }
  })

  return {
    site,
    menu,
    themeVars,
    fetchSite,
    fetchMenu,
  }
}
