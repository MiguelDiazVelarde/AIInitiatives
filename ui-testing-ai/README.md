# UI Testing with AI

Implementación práctica de los conceptos del **Capítulo 11.6 del ISTQB CT-AI**: "Using AI for Testing User Interfaces"

## 📋 Descripción

Este módulo implementa técnicas de testing de UI usando AI, incluyendo:

### 11.6.1 Testing a través del GUI
- **Self-Healing Tests**: Tests que se adaptan automáticamente a cambios en la UI
- **AI Object Locator**: Identificación inteligente de elementos usando múltiples estrategias
- **Histórico de Estabilidad**: Aprende qué localizadores son más confiables

### 11.6.2 Testing del GUI
- **Visual Regression Testing**: Detecta cambios visuales no intencionados
- **Computer Vision**: Compara screenshots usando algoritmos de visión por computadora
- **Validación de Renderizado**: Identifica elementos mal renderizados o inaccesibles

## 🏗️ Estructura del Proyecto

```
ui-testing-ai/
├── README.md                    # Este archivo
├── ARCHITECTURE.md              # Arquitectura detallada
├── requirements.txt             # Dependencias Python
├── pytest.ini                   # Configuración de pytest
├── tests/                       # Tests de ejemplo
│   ├── __init__.py
│   ├── test_visual_regression.py
│   ├── test_gui_validation.py
│   └── test_self_healing.py
├── utils/                       # Utilidades AI
│   ├── __init__.py
│   ├── visual_comparator.py    # Comparación visual con CV
│   ├── ai_object_locator.py    # Localización inteligente
│   └── gui_validator.py        # Validación de GUI
├── screenshots/                 # Capturas de pantalla
│   ├── baseline/               # Imágenes de referencia
│   ├── current/                # Imágenes actuales
│   └── diff/                   # Diferencias visuales
├── config/                      # Configuraciones
│   └── test_config.yaml
└── diagrams/                    # Diagramas de secuencia
    ├── visual-testing-flow.md
    ├── self-healing-flow.md
    └── gui-validation-flow.md
```

## 🚀 Instalación

### Requisitos Previos
- Python 3.8+
- pip

### Instalar Dependencias

```bash
cd ui-testing-ai
pip install -r requirements.txt
```

### Instalar Playwright (Opcional)

```bash
playwright install
```

## 🧪 Ejecución de Tests

### Ejecutar todos los tests

```bash
pytest tests/ -v
```

### Ejecutar tests específicos

```bash
# Visual regression testing
pytest tests/test_visual_regression.py -v

# Self-healing tests
pytest tests/test_self_healing.py -v

# GUI validation
pytest tests/test_gui_validation.py -v
```

### Generar reporte HTML

```bash
pytest tests/ --html=reports/test_report.html --self-contained-html
```

## 📊 Diagramas de Secuencia

Ver los diagramas en la carpeta `diagrams/`:

- **Visual Testing Flow**: Proceso de comparación visual
- **Self-Healing Flow**: Cómo funcionan los tests auto-reparables
- **GUI Validation Flow**: Proceso de validación de elementos

## 🎯 Casos de Uso

### 1. Visual Regression Testing

```python
from utils.visual_comparator import VisualComparator

comparator = VisualComparator(threshold=0.95)
result = comparator.compare_screenshots(
    baseline_path="screenshots/baseline/home.png",
    current_path="screenshots/current/home.png"
)

print(f"Similarity: {result['similarity_score']}")
print(f"Acceptable: {result['is_acceptable']}")
```

### 2. Self-Healing Test

```python
from utils.ai_object_locator import AIObjectLocator
from selenium.webdriver.common.by import By

locator = AIObjectLocator()

# Define múltiples estrategias
strategies = [
    {"by": By.ID, "value": "login-button"},
    {"by": By.NAME, "value": "login"},
    {"by": By.XPATH, "value": "//button[contains(text(), 'Login')]"},
    {"by": By.CSS_SELECTOR, "value": ".btn-login"}
]

element = locator.find_element_smart(driver, "login_button", strategies)
```

### 3. GUI Validation

```python
from utils.gui_validator import GUIValidator

validator = GUIValidator()
issues = validator.validate_page(driver)

for issue in issues:
    print(f"{issue['severity']}: {issue['description']}")
```

## 🔧 Configuración

Edita `config/test_config.yaml` para ajustar:

- Threshold de similitud visual
- Estrategias de localización
- Reglas de validación
- Timeouts y reintentos

## 📚 Referencias

- **ISTQB CT-AI Syllabus**: Capítulo 11.6
- **OpenCV Documentation**: https://docs.opencv.org/
- **Selenium Documentation**: https://selenium-python.readthedocs.io/
- **Playwright Documentation**: https://playwright.dev/python/

## 🤝 Contribuciones

Este módulo es independiente del resto del proyecto `aiinitiatives` y puede ser usado como referencia para implementar testing de UI con AI.

## 📄 Licencia

Ver LICENSE en la raíz del proyecto principal.
