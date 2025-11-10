# PR Validation Workflow Diagrams

Este directorio contiene diagramas de secuencia del workflow de validación de Pull Requests.

## 📊 Archivos Disponibles

### 1. **pr-validation-sequence.md** (Mermaid)
- ✅ **Recomendado**: Se renderiza automáticamente en GitHub
- Incluye 4 diagramas diferentes:
  - Secuencia completa
  - Flowchart de línea 368
  - State diagram
  - Graph del AI Optimizer
- **Visualizar**: Abrir directamente en GitHub

### 2. **pr-validation.puml** (PlantUML)
- Para documentación técnica
- Más detallado que Mermaid
- **Visualizar online**: https://www.plantuml.com/plantuml/uml/
- **Visualizar local**: Instalar extensión PlantUML en VS Code

### 3. **pr-validation.drawio** 
- Formato editable en Diagrams.net
- **Abrir en**: https://app.diagrams.net/
- **O usar**: Extensión Draw.io Integration en VS Code

## 🎯 Foco: Línea 368

Todos los diagramas destacan la ejecución de:
```bash
npx ts-node src/test-optimizer/index.ts execute
```

Este es el punto donde el AI Test Optimizer:
1. Lee el plan de optimización generado previamente
2. Selecciona tests basados en los cambios del PR
3. Ejecuta los tests con Cucumber
4. Genera reportes y actualiza el historial

## 🚀 Cómo Usar

### Ver en GitHub (Mermaid)
1. Navega a `pr-validation-sequence.md` en GitHub
2. Los diagramas se renderizan automáticamente

### Editar PlantUML
```bash
# Instalar extensión
code --install-extension jebbs.plantuml

# O usar online
# Copiar contenido de pr-validation.puml
# Pegar en https://www.plantuml.com/plantuml/uml/
```

### Exportar a PNG/SVG

#### Desde Mermaid:
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i pr-validation-sequence.md -o output.png
```

#### Desde PlantUML:
```bash
# Con Java instalado
plantuml pr-validation.puml
```

## 📖 Referencias

- [Mermaid Documentation](https://mermaid.js.org/)
- [PlantUML Guide](https://plantuml.com/)
- [Diagrams.net](https://app.diagrams.net/)

## 🎨 Leyenda

| Símbolo | Significado |
|---------|-------------|
| 🔐 | Flujo de autenticación prioritario |
| 🤖 | AI Test Optimizer en acción |
| 🔥 | Fallback a smoke tests |
| ✅ | Operación exitosa |
| ❌ | Error / Corrección requerida |
| ⚠️ | Advertencia / Continúa |
