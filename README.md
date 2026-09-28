# TMDB Movies App - React Native CLI & TypeScript

Aplicación móvil de alto rendimiento desarrollada en **React Native CLI** y **TypeScript** que consume la API de **The Movie Database (TMDB)**. La arquitectura fue diseñada siguiendo patrones modulares de escala empresarial (*Feature-Driven Architecture* y *Shared Core*), con gestión de estado mediante **Redux Toolkit & RTK Query**, navegación fluida con **React Navigation** y manejo exhaustivo de estados de interfaz (carga, error y lista vacía).

---

## 📱 Capturas y Funcionalidades

- **Listado de Películas & Categorías Dinámicas:** Selector interactivo de categorías con chips animados para alternar sin recargas entre **Populares**, **Mejor Valoradas**, **En Cartelera** y **Próximamente**.
- **Paginación Infinita:** Scroll infinito fluido con deduplicación y carga automática de páginas adicionales.
- **Pull-to-Refresh:** Actualización rápida de la lista arrastrando hacia abajo.
- **Barra de Búsqueda:** Búsqueda en tiempo real por nombre con optimización de *debounce* (400ms) y botón de limpieza inmediata.
- **Pantalla de Detalle en Alta Resolución:**
  - Visualización de póster y *backdrop* en resolución máxima (`original` / `w500`).
  - Botón nativo para **Compartir** la película mediante el Share Sheet del sistema (iOS/Android).
  - Título, fecha de estreno formateada, duración, calificación detallada y géneros en badges.
  - **Reparto Principal (*Cast*):** Carrusel horizontal con fotos de actores, nombres y personajes.
  - Sinopsis completa y compañías de producción.
- **Estados de UI Visibles y Pulidos:**
  - **Carga:** Skeletons placeholders con **animación de pulso a 60fps** durante la carga inicial y spinners discretos para paginación.
  - **Error:** Vista de error con mensaje amigable y botón de **Reintentar** (*Retry*).
  - **Lista Vacía:** Retroalimentación cuando la búsqueda no arroja resultados o la lista está vacía, con botón para resetear la consulta.

---

## 🛠️ Stack Tecnológico

| Herramienta | Versión / Detalle | Justificación |
| :--- | :--- | :--- |
| **React Native CLI** | 0.87.1 | Requisito del desafío; brinda control directo del entorno nativo y máximo rendimiento. |
| **TypeScript** | Modo Estrito (`strict: true`) | Tipado estricto sin `any`, interfaces completas para DTOs y parámetros de navegación. |
| **Redux Toolkit & RTK Query** | ^2.6.0 / ^2.6.0 | Gestión de estado global y datos de red con caché automatizado, deduplicación de peticiones y control nativo de estados (`isLoading`, `isFetching`, `isError`). |
| **React Navigation** | Native Stack 7.x | Navegación nativa fluida con tipado estricto (`RootStackParamList`). |
| **React Native Safe Area Context** | ^5.5.2 | Soporte perfecto para notch, Dynamic Island y barras de navegación del sistema. |
| **Jest & React Test Renderer** | 29.x | Suite de pruebas unitarias para utilitarios, formateadores y componentes de feedback. |

---

## 🏗️ Arquitectura del Proyecto (Diseñada para Escalar)

Para garantizar que la aplicación pueda escalar a decenas de pantallas, múltiples dominios y varios equipos de desarrollo sin acoplamiento, se implementó una **Arquitectura Modular Basada en Features** (*Feature-Driven Architecture*) con un núcleo transversal compartido (*Shared Core*):

```text
src/
├── app/                              # Configuración central y bootstrap
│   ├── config/                       # Variables de entorno y endpoints (env.ts)
│   ├── providers/                    # AppProviders (Redux, SafeArea, Navigation)
│   └── store/                        # Redux Store, rootReducer y hooks tipados
│
├── navigation/                       # Roteo global
│   ├── RootNavigator.tsx             # Native Stack Navigator
│   ├── routes.ts                     # Constantes de nombres de rutas
│   └── types.ts                      # Tipos de parámetros y props de pantalla
│
├── features/                         # Fórmulas de Dominio (Vertical Slices)
│   ├── movies/                       # Módulo de Películas
│   │   ├── api/                      # RTK Query slice (moviesApi.ts, types.ts)
│   │   ├── store/                    # Redux Slice (moviesSlice.ts) para filtros y páginas
│   │   ├── hooks/                    # ViewModel Hook (useMoviesFlow.ts)
│   │   ├── components/               # MovieCard, MovieCardSkeleton, RatingBadge, CastList
│   │   ├── screens/                  # MovieListScreen, MovieDetailScreen
│   │   └── index.ts                  # Public API del módulo de películas
│   │
│   └── search/                       # Módulo de Búsqueda (reutilizable)
│       ├── components/               # SearchBar con botón de limpiar
│       ├── hooks/                    # useDebounce hook
│       └── index.ts
│
└── shared/                           # Núcleo Compartido Agnóstico de Negocio
    ├── api/                          # baseQuery autenticado para TMDB
    ├── components/                   # Design System y Feedback Views
    │   ├── ui/                       # AppText, Button, Badge
    │   └── feedback/                 # LoadingView, ErrorView, EmptyStateView
    ├── theme/                        # Tokens de diseño (colors, typography, spacing)
    └── utils/                        # Formateadores de fecha, rating e imágenes
```

### ¿Por qué esta arquitectura?
1. **Aislamiento de Dominios:** Agregar nuevas secciones (por ejemplo, Series de TV en `features/tv-shows` o Favoritos en `features/favorites`) no altera ni ensucia el código de películas.
2. **Public APIs (`index.ts`):** Cada módulo expone únicamente los componentes y hooks públicos que el resto de la app necesita consumir.
3. **Mantenibilidad en Equipo:** Múltiples desarrolladores o squads pueden trabajar en distintas features simultáneamente sin generar conflictos de merge constantes.

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de contar con el entorno de React Native CLI configurado:
- **Node.js:** Versión `>= 20.x` (recomendado `>= 22.x`)
- **Gestor de paquetes:** `npm` o `yarn`
- **Para iOS:** macOS con Xcode 15+, Ruby (>= 3.1) y CocoaPods instalado (`pod --version`)
- **Para Android:** Android Studio con Android SDK (API 34/35) y variable `ANDROID_HOME` configurada.

---

## 📦 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd rn-desafio
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz copiando el archivo de ejemplo:
```bash
cp .env.example .env
```
> **Nota:** La aplicación ya incluye una clave de demostración funcional preconfigurada en `src/app/config/env.ts` para permitir una evaluación inmediata sin bloqueos. Si deseas utilizar tu propia API Key de TMDB, puedes colocarla en el archivo `.env`:
> ```env
> TMDB_API_KEY=tu_api_key_aqui
> ```

---

### 4. Compilación y Ejecución en iOS

1. Instalar las dependencias de CocoaPods:
```bash
bundle install
bundle exec pod install --project-directory=ios
```

2. Ejecutar en el simulador de iOS:
```bash
npm run ios
```
*(Opcional: puedes abrir `ios/TMDBApp.xcworkspace` en Xcode y presionar el botón **Run**).*

---

### 5. Compilación y Ejecución en Android

1. Iniciar un emulador de Android o conectar un dispositivo con depuración USB activada.
2. Ejecutar:
```bash
npm run android
```

---

## 🧪 Verificación de Calidad y Pruebas

El proyecto cuenta con validación estricta de TypeScript y pruebas unitarias con Jest:

### Verificación de tipos TypeScript:
```bash
npm run typecheck
```

### Ejecución de pruebas unitarias:
```bash
npm test
```

Las pruebas cubren:
- Montaje del árbol de componentes raíz y proveedores (`App.test.tsx`).
- Redux Slice de películas y seletores memoizados con `createSelector` (`moviesSlice.test.ts`).
- Redux Slice normalizado de favoritos con operaciones CRUD (`favoritesSlice.test.ts`).
- Componentes de UI, pestañas de categorías y estados de feedback (`ui.test.tsx`).
- Utilitarios de formato de fecha en español, cálculo de duración y calificaciones numéricas (`formatters.test.ts`).
- Construcción y resolución de URLs de imágenes del TMDB en distintas densidades (`imageHelpers.test.ts`).

---

## 💡 Decisiones Técnicas Destacadas

1. **Redux Toolkit + RTK Query (Capa Redux de Alto Nivel):**
   - **Gestión de Estado Global Dual:** Combina RTK Query para sincronización de red con un slice de domínio normalizado (`favoritesSlice`) y de filtros (`moviesSlice`).
   - **Estructura de Datos Normalizada:** El slice de favoritos implementa el patrón estándar de la industria `{ byId, allIds }`, garantizando lecturas O(1) al verificar si una película es favorita.
   - **Seletores Memoizados (`createSelector` / Reselect):** Evita recalcular datos derivados innecesariamente, previniendo re-renderizados en la UI.
   - **Middleware Global de Errores (`rtkQueryErrorLogger`):** Intercepta de forma centralizada cualquier acción `isRejectedWithValue` para telemetría y diagnóstico sin saturar los componentes.
   - **Prefetching Optimista en Toque (`onPressIn`):** Dispara `moviesApi.util.prefetch` en milisegundos para que los detalles ya estén en memoria cuando la pantalla se abre.

2. **Optimización de Rendimiento en Listas:**
   - Implementación de `FlatList` configurada con `removeClippedSubviews={true}`, `maxToRenderPerBatch={10}` y `windowSize={10}` para garantizar una tasa de refresco constante de 60fps.
   - Elementos de lista envueltos en `React.memo` para evitar renderizados redundantes al paginar o ingresar texto.

3. **Carga Inteligente de Imágenes:**
   - Se utiliza resolución `w342` en la cuadrícula de listado para ahorrar ancho de banda y acelerar la carga en redes móviles.
   - En la pantalla de detalles se cargan imágenes en resolución completa (`original` para fondo y `w500` para póster).
   - Manejo de fallbacks visuales automáticos en caso de pósters no disponibles o errores de red.

4. **Búsqueda Eficiente con Debounce:**
   - Hook reactivo `useDebounce` con retardo de 400ms para evitar saturar el endpoint de búsqueda en cada pulsación de tecla.

---

## 🔮 Qué mejoraría con más tiempo

1. **Soporte Completo a Series de TV (`features/tv-shows`):**
   - Incorporar una barra de navegación inferior (Bottom Tabs) para alternar entre "Películas" y "Series", reutilizando los componentes del *Shared Core*.
2. **Persistencia y Modo Offline:**
   - Integrar almacenamiento local (como `redux-persist` con `react-native-mmkv`) para permitir explorar películas cacheadas sin conexión a internet.
3. **Favoritos y Watchlist:**
   - Implementar un slice de Redux para que los usuarios puedan guardar películas favoritas en su dispositivo.
4. **Animaciones de Transición Suave:**
   - Integrar `react-native-reanimated` para transiciones de elementos compartidos (*Shared Element Transitions*) entre el póster de la lista y la pantalla de detalle.
5. **Pruebas End-to-End (E2E):**
   - Configurar pruebas E2E con Maestro o Detox para validar automáticamente los flujos de navegación, búsqueda y paginación en emuladores reales.
