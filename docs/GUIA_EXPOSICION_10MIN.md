# GUÍA Y GUION DE EXPOSICIÓN (10 MINUTOS) — SPLITPAY
### *Curso: Desarrollo de Aplicaciones Móviles (100000ST91) — Entregable APF1*

---

## ⏱️ Estructura Minuto a Minuto

| Tiempo | Sección | Diapositiva / Demostración sugerida |
| :--- | :--- | :--- |
| **00:00 - 01:30** | **1. Introducción y Problemática** | Portada + Problema real de la división de gastos en grupos (depas, viajes, pichangas). |
| **01:30 - 03:00** | **2. Objetivos y Solución Propuesta** | Objetivos generales/específicos + Solución SplitPay (cálculo de balance, liquidación mínima). |
| **03:00 - 05:00** | **3. Arquitectura y Stack Tecnológico** | Diagrama de carpetas + React Native + Expo + AsyncStorage + API REST RandomUser. |
| **05:00 - 07:30** | **4. Demostración en Vivo del Prototipo** | Ejecución de la app: Dashboard -> Crear Grupo -> Registrar Gasto -> Balances -> Liquidar. |
| **07:30 - 09:00** | **5. Sustentación de la Rúbrica** | Mapeo de conceptos: Flexbox/Layouts, Botones/onPress, ListView/FlatList, Ciclo de Vida (useEffect / AppState). |
| **09:00 - 10:00** | **6. Beneficios y Conclusiones** | Beneficios principales + Conclusiones + Ronda de preguntas. |

---

## 🗣️ Guion Sugerido para los Expositores

### Minuto 00:00 - 01:30: Introducción
> *"Buenos días profesor y compañeros. Hoy les presentamos **SplitPay**, una aplicación móvil desarrollada en React Native y Expo para la gestión inteligente de gastos compartidos.*
> *En nuestro día a día, al convivir en un departamento universitario, salir de viaje o compartir un evento con amigos, una persona suele pagar la cuenta general. Calcular manualmente quién le debe a quién o llevarlo en hojas de cálculo genera confusiones, cobros duplicados y discusiones innecesarias. SplitPay soluciona esto de manera automatizada e intuitiva."*

### Minuto 01:30 - 03:00: Objetivos y Propuesta de Valor
> *"Nuestro objetivo principal ha sido construir una solución multiplataforma rápida y Offline-First, con moneda en soles (S/.) y métodos de pago nacionales como Yape y Plin.*
> *Entre sus características clave destacan:*
> 1. *Creación de grupos temáticos de gastos.*
> 2. *Registro de gastos con división automática y adjunto de comprobantes.*
> 3. *Cálculo en tiempo real del balance neto individual.*
> 4. *Un algoritmo de liquidación que minimiza las transferencias necesarias."*

### Minuto 03:00 - 05:00: Arquitectura del Software
> *"Para este proyecto seguimos una arquitectura modular en React Native:*
> - *En la capa de **Vistas (Screens)** tenemos el Dashboard, el Detalle de Grupo con pestañas, el Formulario de Gasto y la Liquidación.*
> - *En la capa de **Lógica de Negocio y Estado**, implementamos React Context API con `ExpenseContext` y `ThemeContext` (para soporte de Modo Claro y Oscuro), acompañados de Custom Hooks como `useExpenses` y `useBalances`.*
> - *En la capa de **Datos**, aplicamos persistencia local con `AsyncStorage` y consumo de servicios REST con la API de RandomUser para avatares."*

### Minuto 05:00 - 07:30: Demostración en Vivo
> *(Proyectar la pantalla de la app o emulador Expo)*
> 1. *"Aquí vemos el **Dashboard principal**, con una tarjeta superior que indica el balance general del usuario (verde si le deben, roja si debe).*
> 2. *Podemos alternar entre el **Modo Claro** y el **Modo Oscuro** al instante.*
> 3. *Al presionar sobre un grupo como 'Depa Universitario', entramos al **Detalle de Grupo**. Aquí vemos la pestaña de **Gastos** cronológicos con filtros por categoría (Comida, Transporte, Casa, Ocio) y la pestaña de **Balances** con la situación de cada participante.*
> 4. *Procedemos a **Registrar un Gasto**: colocamos el concepto, el monto, seleccionamos quién pagó y entre quiénes se divide, calculando la cuota en tiempo real.*
> 5. *Por último, en la pantalla de **Liquidar**, el sistema nos indica exactamente qué transferencia realizar para saldar la deuda vía Yape o Plin."*

### Minuto 07:30 - 09:00: Sustentación de la Rúbrica
> *"Respecto a los puntos de la rúbrica del curso:*
> - *El **anclaje y diseño de layouts** se implementó mediante Flexbox y StyleSheet nativo.*
> - *Los **botones y eventos onClick** corresponden a `TouchableOpacity` con manejadores `onPress` y animaciones de toque.*
> - *Las **Activities y menús** se gestionan con React Navigation (`Stack` y `Tabs`).*
> - *El componente **ListView** se desarrolló utilizando `FlatList` con optimización de memoria.*
> - *Y el **Ciclo de Vida** (`onCreate`, `onResume`, `onPause`, `onDestroy`) se cubre con el hook `useEffect` y el listener `AppState` de React Native."*

### Minuto 09:00 - 10:00: Conclusiones
> *"En conclusión, SplitPay no solo cumple con todos los objetivos técnicos y académicos del entregable, sino que ofrece una solución real, escalable y moderna. Muchas gracias, quedamos atentos a sus preguntas."*
