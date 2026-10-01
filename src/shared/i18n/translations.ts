/**
 * UI translations.
 *
 * `es-PY` (Spanish — Paraguay) is the source of truth for the key set.
 * `pt-BR` (Brazilian Portuguese) must implement every key, enforced by the
 * `Record<TranslationKey, string>` type below.
 */
export const esPY = {
  'app.brand': 'MangoCine',
  'app.tagline': 'Tu catálogo de películas',

  'welcome.badge': 'Catálogo TMDB',
  'welcome.subtitle':
    'Miles de películas, reparto y calificaciones en un solo lugar.',
  'welcome.cta': 'Explorar catálogo',
  'welcome.footer': 'Datos provistos por TMDB',

  'search.placeholder': 'Buscar películas por título...',
  'search.clear': 'Limpiar búsqueda',
  'search.tooShort': 'Escribe al menos 2 caracteres para buscar.',

  'list.resultsFor': 'Resultados para "{query}"',
  'list.titles': '{count} títulos',
  'list.footerError': 'No se pudieron cargar más películas.',
  'list.loadingMore': 'Cargando más películas...',
  'list.limitReached':
    'Mostrando los primeros resultados. Refina la búsqueda para ver más.',
  'list.errorTitle': 'Error al cargar películas',
  'list.errorMessage':
    'No se pudo conectar con el servicio de TMDB. Por favor, revisa tu conexión e inténtalo nuevamente.',
  'list.emptySearchTitle': 'Sin resultados',
  'list.emptySearchMessage':
    'No encontramos películas con el término "{query}". Intenta con otro nombre.',
  'list.emptyTitle': 'Lista vacía',
  'list.emptyMessage': 'No hay películas disponibles en este momento.',
  'list.clearSearch': 'Limpiar búsqueda',
  'list.reload': 'Recargar',

  'category.popular': 'Populares',
  'category.top_rated': 'Mejor Valoradas',
  'category.now_playing': 'En Cartelera',
  'category.upcoming': 'Próximamente',

  'detail.shareAction': 'Compartir',
  'detail.errorTitle': 'Error al cargar detalles',
  'detail.errorMessage':
    'No pudimos obtener la información completa de la película. Por favor, inténtalo de nuevo.',
  'detail.loadingExtra': 'Cargando información adicional...',
  'detail.votes': '({count} votos)',
  'detail.genres': 'GÉNEROS',
  'detail.synopsis': 'SINOPSIS',
  'detail.synopsisEmpty':
    'No hay sinopsis disponible para esta película en este momento.',
  'detail.productionCompanies': 'COMPAÑÍAS DE PRODUCCIÓN',
  'detail.castTitle': 'REPARTO PRINCIPAL',
  'detail.unknown': 'Desconocido',
  'detail.shareMessage':
    '¡Mira esta película: "{title}"! Más info en TMDB: {url}',

  'common.retry': 'Reintentar',
  'common.back': 'Atrás',
  'common.addFavorite': 'Agregar a favoritos',
  'common.removeFavorite': 'Quitar de favoritos',
  'common.notAvailable': 'N/D',
  'common.noDate': 'Fecha no disponible',
  'common.noYear': 'N/D',

  'feedback.errorTitle': 'Ha ocurrido un error',
  'feedback.errorMessage':
    'No pudimos cargar la información. Por favor, verifica tu conexión e inténtalo nuevamente.',
  'feedback.emptyTitle': 'No hay resultados',
  'feedback.emptyMessage':
    'No encontramos películas que coincidan con tu búsqueda.',
  'feedback.emptyAction': 'Limpiar búsqueda',

  'language.title': 'Idioma',
  'language.es': 'Español (Paraguay)',
  'language.pt': 'Português (Brasil)',

  'menu.open': 'Abrir menú',
  'menu.close': 'Cerrar',
  'menu.catalog': 'Catálogo',
  'menu.favorites': 'Favoritos',

  'favorites.title': 'Mis favoritos',
  'favorites.count': '{count} películas',
  'favorites.countOne': '1 película',
  'favorites.emptyTitle': 'Aún no tienes favoritos',
  'favorites.emptyMessage':
    'Toca el corazón en una película para guardarla aquí.',
  'favorites.emptyAction': 'Explorar catálogo',
} as const;

export type TranslationKey = keyof typeof esPY;

const ptBR: Record<TranslationKey, string> = {
  'app.brand': 'MangoCine',
  'app.tagline': 'Seu catálogo de filmes',

  'welcome.badge': 'Catálogo TMDB',
  'welcome.subtitle': 'Milhares de filmes, elenco e avaliações em um só lugar.',
  'welcome.cta': 'Acessar catálogo',
  'welcome.footer': 'Dados fornecidos pelo TMDB',

  'search.placeholder': 'Buscar filmes por título...',
  'search.clear': 'Limpar busca',
  'search.tooShort': 'Digite ao menos 2 caracteres para buscar.',

  'list.resultsFor': 'Resultados para "{query}"',
  'list.titles': '{count} títulos',
  'list.footerError': 'Não foi possível carregar mais filmes.',
  'list.loadingMore': 'Carregando mais filmes...',
  'list.limitReached':
    'Mostrando os primeiros resultados. Refine a busca para ver mais.',
  'list.errorTitle': 'Erro ao carregar filmes',
  'list.errorMessage':
    'Não foi possível conectar ao serviço do TMDB. Verifique sua conexão e tente novamente.',
  'list.emptySearchTitle': 'Sem resultados',
  'list.emptySearchMessage':
    'Não encontramos filmes com o termo "{query}". Tente outro nome.',
  'list.emptyTitle': 'Lista vazia',
  'list.emptyMessage': 'Não há filmes disponíveis no momento.',
  'list.clearSearch': 'Limpar busca',
  'list.reload': 'Recarregar',

  'category.popular': 'Populares',
  'category.top_rated': 'Melhores avaliados',
  'category.now_playing': 'Em cartaz',
  'category.upcoming': 'Em breve',

  'detail.shareAction': 'Compartilhar',
  'detail.errorTitle': 'Erro ao carregar detalhes',
  'detail.errorMessage':
    'Não foi possível obter as informações completas do filme. Tente novamente.',
  'detail.loadingExtra': 'Carregando informações adicionais...',
  'detail.votes': '({count} votos)',
  'detail.genres': 'GÊNEROS',
  'detail.synopsis': 'SINOPSE',
  'detail.synopsisEmpty':
    'Não há sinopse disponível para este filme no momento.',
  'detail.productionCompanies': 'PRODUTORAS',
  'detail.castTitle': 'ELENCO PRINCIPAL',
  'detail.unknown': 'Desconhecido',
  'detail.shareMessage':
    'Confira este filme: "{title}"! Mais informações no TMDB: {url}',

  'common.retry': 'Tentar novamente',
  'common.back': 'Voltar',
  'common.addFavorite': 'Adicionar aos favoritos',
  'common.removeFavorite': 'Remover dos favoritos',
  'common.notAvailable': 'N/D',
  'common.noDate': 'Data indisponível',
  'common.noYear': 'N/D',

  'feedback.errorTitle': 'Ocorreu um erro',
  'feedback.errorMessage':
    'Não conseguimos carregar as informações. Verifique sua conexão e tente novamente.',
  'feedback.emptyTitle': 'Sem resultados',
  'feedback.emptyMessage':
    'Não encontramos filmes que correspondam à sua busca.',
  'feedback.emptyAction': 'Limpar busca',

  'language.title': 'Idioma',
  'language.es': 'Espanhol (Paraguai)',
  'language.pt': 'Português (Brasil)',

  'menu.open': 'Abrir menu',
  'menu.close': 'Fechar',
  'menu.catalog': 'Catálogo',
  'menu.favorites': 'Favoritos',

  'favorites.title': 'Meus favoritos',
  'favorites.count': '{count} filmes',
  'favorites.countOne': '1 filme',
  'favorites.emptyTitle': 'Você ainda não tem favoritos',
  'favorites.emptyMessage': 'Toque no coração de um filme para salvá-lo aqui.',
  'favorites.emptyAction': 'Explorar catálogo',
};

export const translations = {
  'es-PY': esPY,
  'pt-BR': ptBR,
} as const;
