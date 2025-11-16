# UI Testing with AI - Architecture

## 📐 Arquitectura General

Este módulo implementa los conceptos del **ISTQB CT-AI Capítulo 11.6** para testing de interfaces de usuario usando Inteligencia Artificial.

```
┌─────────────────────────────────────────────────────────────────┐
│                     UI Testing with AI                          │
│                  (ISTQB CT-AI 11.6)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│ Visual        │    │ Self-Healing   │    │ GUI          │
│ Regression    │    │ Tests          │    │ Validation   │
│ (11.6.2)      │    │ (11.6.1)       │    │ (11.6.2)     │
└───────────────┘    └────────────────┘    └──────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│ Visual        │    │ AI Object      │    │ GUI          │
│ Comparator    │    │ Locator        │    │ Validator    │
└───────────────┘    └────────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Selenium        │
                    │  WebDriver       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Web Browser     │
                    │  (Chrome/Firefox)│
                    └──────────────────┘
```

## 🏗️ Componentes Principales

### 1. Visual Comparator (ISTQB 11.6.2)

**Propósito**: Detectar cambios visuales no intencionados usando Computer Vision

```python
┌─────────────────────────────────────────────────────┐
│            VisualComparator                         │
├─────────────────────────────────────────────────────┤
│ Attributes:                                         │
│  - threshold: float                                 │
│  - pixel_tolerance: int                             │
│  - min_area: int                                    │
│  - ignore_antialiasing: bool                        │
├─────────────────────────────────────────────────────┤
│ Methods:                                            │
│  + compare_screenshots(baseline, current, diff)     │
│    → Dict[similarity, acceptable, differences]      │
│                                                     │
│  - _calculate_ssim(img1, img2)                      │
│    → float (Structural Similarity)                  │
│                                                     │
│  - _calculate_mse(img1, img2)                       │
│    → float (Mean Squared Error)                     │
│                                                     │
│  - _calculate_histogram_correlation(img1, img2)     │
│    → float (Color distribution similarity)          │
│                                                     │
│  - _detect_differences(img1, img2)                  │
│    → List[VisualDifference] (Contours)             │
│                                                     │
│  - _classify_differences(diffs, shape)              │
│    → List[VisualDifference] (With severity)        │
│                                                     │
│  - _save_diff_visualization(baseline, current, ...) │
│    → None (Saves annotated image)                   │
└─────────────────────────────────────────────────────┘
         Uses: OpenCV, scikit-image, imagehash
```

**Algoritmos Utilizados**:

1. **SSIM (Structural Similarity Index)**
   - Peso: 50%
   - Compara estructura, luminancia, contraste
   - Robusto a cambios menores

2. **MSE (Mean Squared Error)**
   - Peso: 20%
   - Diferencia pixel por pixel
   - Sensible a cambios pequeños

3. **Histogram Correlation**
   - Peso: 20%
   - Compara distribución de colores
   - Detecta cambios de paleta

4. **Perceptual Hash**
   - Peso: 10%
   - Hash visual robusto
   - Identifica imágenes similares

### 2. AI Object Locator (ISTQB 11.6.1)

**Propósito**: Localizar elementos UI de forma robusta usando múltiples estrategias que aprenden

```python
┌─────────────────────────────────────────────────────┐
│            AIObjectLocator                          │
├─────────────────────────────────────────────────────┤
│ Attributes:                                         │
│  - history_file: str                                │
│  - locator_history: Dict[str, List[Dict]]           │
├─────────────────────────────────────────────────────┤
│ Methods:                                            │
│  + find_element_smart(driver, element_name,         │
│                       strategies, timeout, retry)   │
│    → Optional[WebElement]                           │
│                                                     │
│  - _prepare_strategies(element_name, strategies)    │
│    → List[LocatorStrategy] (With history)           │
│                                                     │
│  - _record_success(element_name, strategy, time)    │
│    → None (Updates statistics)                      │
│                                                     │
│  - _record_failure(element_name, strategy)          │
│    → None (Updates statistics)                      │
│                                                     │
│  + get_element_stats(element_name)                  │
│    → Dict (Strategy statistics)                     │
│                                                     │
│  + print_stats(element_name)                        │
│    → None (Human-readable report)                   │
└─────────────────────────────────────────────────────┘
         Uses: Selenium, JSON persistence
         
┌─────────────────────────────────────────────────────┐
│           LocatorStrategy (DataClass)               │
├─────────────────────────────────────────────────────┤
│ Attributes:                                         │
│  - by: str                                          │
│  - value: str                                       │
│  - success_count: int                               │
│  - failure_count: int                               │
│  - avg_response_time: float                         │
│  - last_used: float                                 │
├─────────────────────────────────────────────────────┤
│ Properties:                                         │
│  + success_rate: float                              │
│    = success / (success + failure)                  │
│                                                     │
│  + reliability_score: float                         │
│    = success_rate*0.7 + time*0.2 + recency*0.1      │
└─────────────────────────────────────────────────────┘
```

**Algoritmo de Aprendizaje**:

```text
Reliability Score = (Success Rate × 0.70) +
                   (Speed Score × 0.20) +
                   (Recency Score × 0.10)

donde:
  Success Rate = successful_finds / total_attempts
  Speed Score = 1 / (1 + avg_response_time_seconds)
  Recency Score = 1 / (1 + days_since_last_use)
```

### 3. GUI Validator (ISTQB 11.6.2)

**Propósito**: Validar calidad y accesibilidad de la UI usando heurísticas

```python
┌─────────────────────────────────────────────────────┐
│              GUIValidator                           │
├─────────────────────────────────────────────────────┤
│ Attributes:                                         │
│  - min_contrast_ratio: float (WCAG)                 │
│  - min_button_size: int (Touch target)              │
│  - min_font_size: int (Readability)                 │
│  - issues: List[GUIIssue]                           │
├─────────────────────────────────────────────────────┤
│ Methods:                                            │
│  + validate_page(driver)                            │
│    → List[GUIIssue]                                 │
│                                                     │
│  - _check_broken_images(driver)                     │
│  - _check_invisible_elements(driver)                │
│  - _check_overlapping_elements(driver)              │
│  - _check_accessibility(driver)                     │
│  - _check_button_sizes(driver)                      │
│  - _check_text_readability(driver)                  │
│  - _check_form_labels(driver)                       │
│                                                     │
│  + get_summary()                                    │
│    → Dict[total, by_severity, issues]               │
│                                                     │
│  + print_report()                                   │
│    → None (Formatted console output)                │
└─────────────────────────────────────────────────────┘
         Uses: Selenium WebDriver
         
┌─────────────────────────────────────────────────────┐
│             GUIIssue (DataClass)                    │
├─────────────────────────────────────────────────────┤
│ Attributes:                                         │
│  - element: Optional[str]                           │
│  - issue_type: str                                  │
│  - severity: str (critical/high/medium/low)         │
│  - description: str                                 │
│  - location: Optional[Dict]                         │
│  - suggestion: Optional[str]                        │
└─────────────────────────────────────────────────────┘
```

**Reglas de Validación**:

| Check | Issue Type | Severity | Detection Method |
|-------|-----------|----------|------------------|
| Broken Images | `broken_image` | HIGH | `naturalWidth == 0` |
| Invisible Elements | `invisible_element` | MEDIUM | `is_displayed() == false` |
| Overlapping | `overlapping_elements` | MEDIUM | Bounding box intersection |
| Missing Alt | `missing_alt_text` | MEDIUM | `alt` attribute empty |
| Missing Label | `missing_label` | MEDIUM/HIGH | No `<label for>` |
| Small Buttons | `small_touch_target` | MEDIUM | Size < 44×44px |
| Tiny Text | `tiny_text` | LOW | Font size < 12px |

## 🔄 Flujo de Datos

### Visual Regression Testing

```text
┌──────────┐    screenshot    ┌────────────┐
│ Browser  │ ─────────────→   │ File       │
│          │                  │ System     │
└──────────┘                  └────────────┘
                                    │
                                    │ baseline.png
                                    │ current.png
                                    ▼
                              ┌────────────┐
                              │ Visual     │
                              │ Comparator │
                              └────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
               ┌────────┐     ┌────────┐     ┌──────────┐
               │ SSIM   │     │  MSE   │     │  Hash    │
               │ Calc   │     │  Calc  │     │  Diff    │
               └────────┘     └────────┘     └──────────┘
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ Similarity      │
                           │ Score + Issues  │
                           └─────────────────┘
```

### Self-Healing Test

```text
┌──────────┐     element name     ┌────────────┐
│  Test    │  ─────────────────→  │ AI Object  │
│          │     strategies       │ Locator    │
└──────────┘                      └────────────┘
                                        │
                                        ▼
                                  ┌──────────┐
                                  │ History  │
                                  │ JSON     │
                                  └──────────┘
                                        │
                                        │ Load stats
                                        ▼
                          ┌──────────────────────────┐
                          │ Sort by Reliability      │
                          │ 1. CSS (score: 0.95)     │
                          │ 2. XPath (score: 0.75)   │
                          │ 3. ID (score: 0.30)      │
                          └──────────────────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │ Try strategies in order  │
                          └──────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
            ┌──────────────┐                        ┌──────────────┐
            │ ✅ Success   │                        │ ❌ Failure  │
            │ Update stats │                        │ Update stats │
            │ Return elem  │                        │ Try next     │
            └──────────────┘                        └──────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                                  ┌──────────┐
                                  │ Save     │
                                  │ History  │
                                  └──────────┘
```

### GUI Validation

```text
┌──────────┐      validate       ┌────────────┐
│ Browser  │  ─────────────────→ │ GUI        │
│ Page     │                     │ Validator  │
└──────────┘                     └────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │ Check Images     │    │ Check Elements   │    │ Check A11y       │
    │ - Broken         │    │ - Visibility     │    │ - Alt text       │
    │ - Loading        │    │ - Overlapping    │    │ - Labels         │
    └──────────────────┘    │ - Sizes          │    │ - ARIA           │
              │             └──────────────────┘    └──────────────────┘
              │                        │                        │
              └────────────────────────┴────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Issue List      │
                              │ with Severity   │
                              └─────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Report          │
                              │ & Health Score  │
                              └─────────────────┘
```

## 📊 Persistencia de Datos

### Locator History (JSON)

```json
{
  "login_button": [
    {
      "by": "css_selector",
      "value": ".btn-login",
      "success_count": 98,
      "failure_count": 2,
      "avg_response_time": 0.123,
      "last_used": 1699999999.999
    },
    {
      "by": "id",
      "value": "login-btn",
      "success_count": 15,
      "failure_count": 85,
      "avg_response_time": 0.456,
      "last_used": 1699999998.888
    }
  ],
  "search_input": [
    // ...more strategies
  ]
}
```

### Screenshot Organization

```text
screenshots/
├── baseline/           # Reference images (golden master)
│   ├── homepage.png
│   ├── login.png
│   └── dashboard.png
│
├── current/            # Test run screenshots
│   ├── homepage.png
│   ├── login.png
│   └── dashboard.png
│
└── diff/               # Difference visualizations
    ├── homepage_diff.png    # Side-by-side comparison
    ├── login_diff.png
    └── dashboard_diff.png
```

## 🧪 Integración con Pytest

```python
# pytest.ini configuration
[pytest]
markers =
    visual: Visual regression tests
    self_healing: Self-healing tests
    gui_validation: GUI validation tests
    slow: Tests that take longer to run

# Run specific test types
$ pytest -m visual              # Only visual tests
$ pytest -m self_healing        # Only self-healing tests
$ pytest -m gui_validation      # Only validation tests
$ pytest -m "not slow"          # Skip slow tests
```

## 🔧 Configuración

Toda la configuración está centralizada en `config/test_config.yaml`:

```yaml
visual_testing:
  similarity_threshold: 0.95
  pixel_tolerance: 10
  ignore_antialiasing: true

self_healing:
  max_strategies: 5
  timeout: 10
  learning_enabled: true
  
gui_validation:
  min_contrast_ratio: 4.5
  min_button_size: 44
  min_font_size: 12
```

## 📈 Métricas y Reportes

### Visual Testing Metrics

- **Similarity Score**: 0.0 - 1.0 (higher = more similar)
- **SSIM**: Structural similarity
- **MSE**: Pixel difference magnitude
- **Differences Count**: Number of changed regions
- **Severity Breakdown**: High/Medium/Low issues

### Self-Healing Metrics

- **Success Rate**: Percentage of successful finds
- **Reliability Score**: Overall strategy trustworthiness
- **Response Time**: Average time to locate element
- **Strategy Performance**: Per-strategy statistics

### GUI Validation Metrics

- **Health Score**: 0-100 (100 = perfect)
- **Issue Count**: Total issues found
- **Severity Distribution**: Critical/High/Medium/Low
- **Pass/Fail**: Based on severity thresholds

## 🔗 Referencias

- **ISTQB CT-AI Syllabus**: Chapter 11.6
- **OpenCV Documentation**: <https://docs.opencv.org/>
- **Selenium WebDriver**: <https://selenium-python.readthedocs.io/>
- **WCAG Guidelines**: <https://www.w3.org/WAI/WCAG21/quickref/>

## 💡 Extensibilidad

El sistema está diseñado para ser extensible:

1. **Nuevos Tipos de Validación**: Agregar métodos a `GUIValidator`
2. **Nuevas Métricas Visuales**: Agregar cálculos a `VisualComparator`
3. **Estrategias Personalizadas**: Definir nuevos locators en `AIObjectLocator`
4. **Integración con AI Models**: Conectar modelos ML para clasificación avanzada
