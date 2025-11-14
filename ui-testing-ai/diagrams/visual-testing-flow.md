# Visual Testing Flow - Sequence Diagram

Este diagrama muestra el flujo completo del **Visual Regression Testing** implementado según ISTQB CT-AI 11.6.2.

## Diagrama de Secuencia

```mermaid
sequenceDiagram
    participant Test as Test Runner
    participant Driver as WebDriver
    participant VC as VisualComparator
    participant CV as Computer Vision
    participant FS as File System
    
    Note over Test,FS: Visual Regression Testing Flow (ISTQB CT-AI 11.6.2)
    
    Test->>Driver: Navigate to URL
    Driver-->>Test: Page loaded
    
    Test->>Driver: Take screenshot
    Driver->>FS: Save current.png
    FS-->>Driver: Screenshot saved
    
    Test->>VC: compare_screenshots(baseline, current)
    
    VC->>FS: Load baseline.png
    FS-->>VC: Baseline image
    
    VC->>FS: Load current.png
    FS-->>VC: Current image
    
    Note over VC: Check if images same size
    alt Images different size
        VC->>CV: Resize current to match baseline
        CV-->>VC: Resized image
    end
    
    Note over VC,CV: Calculate Multiple Similarity Metrics
    
    VC->>CV: Calculate SSIM (Structural Similarity)
    CV-->>VC: SSIM score (0-1)
    
    VC->>CV: Calculate MSE (Mean Squared Error)
    CV-->>VC: MSE value
    
    VC->>CV: Calculate Histogram Correlation
    CV-->>VC: Histogram correlation (0-1)
    
    VC->>CV: Calculate Perceptual Hash Difference
    CV-->>VC: Hash difference (0-64)
    
    Note over VC: Compute weighted similarity score
    VC->>VC: similarity = SSIM*0.5 + MSE*0.2 + Hist*0.2 + Hash*0.1
    
    Note over VC,CV: Detect Visual Differences
    
    VC->>CV: Convert to grayscale
    CV-->>VC: Grayscale images
    
    opt Ignore Antialiasing
        VC->>CV: Apply Gaussian blur
        CV-->>VC: Blurred images
    end
    
    VC->>CV: Calculate absolute difference
    CV-->>VC: Difference map
    
    VC->>CV: Apply threshold & morphology
    CV-->>VC: Binary difference mask
    
    VC->>CV: Find contours
    CV-->>VC: List of difference regions
    
    Note over VC: Classify Differences by Severity
    
    loop For each difference region
        VC->>VC: Calculate relative area
        VC->>VC: Calculate distance from center
        VC->>VC: Classify as high/medium/low
    end
    
    Note over VC: Determine Acceptability
    
    VC->>VC: is_acceptable = (similarity >= threshold) && (no high severity)
    
    opt Generate Diff Visualization
        VC->>CV: Create side-by-side comparison
        CV-->>VC: Comparison canvas
        
        VC->>CV: Draw rectangles on differences
        CV-->>VC: Annotated image
        
        VC->>FS: Save diff visualization
        FS-->>VC: Saved
    end
    
    VC-->>Test: Return comparison results
    
    Note over Test: Results include:<br/>- Similarity score<br/>- Acceptability boolean<br/>- Difference regions<br/>- Metrics (SSIM, MSE, etc.)<br/>- Severity breakdown<br/>- Recommendation
    
    alt Test Passes
        Test->>Test: ✅ Assert is_acceptable
        Test-->>Test: Test PASSED
    else Test Fails
        Test->>Test: ❌ Assert failed
        Test->>FS: Review diff image
        Test-->>Test: Test FAILED - Review needed
    end
```

## Métricas Utilizadas

### 1. **SSIM (Structural Similarity Index)**
- Rango: 0 a 1 (1 = idéntico)
- Considera: luminancia, contraste, estructura
- Peso: 50% del score total

### 2. **MSE (Mean Squared Error)**
- Rango: 0 a ∞ (0 = idéntico)
- Mide diferencias pixel por pixel
- Peso: 20% del score total

### 3. **Histogram Correlation**
- Rango: 0 a 1 (1 = idéntico)
- Compara distribución de colores
- Peso: 20% del score total

### 4. **Perceptual Hash**
- Rango: 0 a 64 bits diferentes
- Hash visual de la imagen
- Peso: 10% del score total

## Clasificación de Severidad

```
┌──────────────────────────────────────────┐
│ Severity Classification Logic            │
├──────────────────────────────────────────┤
│ HIGH:                                     │
│  • Area > 10% of screen                  │
│  • Distance from center < 30%            │
│                                          │
│ MEDIUM:                                  │
│  • Area > 1% of screen                   │
│  • Distance from center < 60%            │
│                                          │
│ LOW:                                     │
│  • Smaller areas                         │
│  • Further from center                   │
└──────────────────────────────────────────┘
```

## Ejemplo de Uso

```python
from utils.visual_comparator import VisualComparator

# Crear comparador con umbral de 95%
comparator = VisualComparator(
    threshold=0.95,
    pixel_tolerance=10,
    ignore_antialiasing=True
)

# Comparar screenshots
result = comparator.compare_screenshots(
    baseline_path="screenshots/baseline/page.png",
    current_path="screenshots/current/page.png",
    diff_output_path="screenshots/diff/page_diff.png"
)

# Analizar resultados
print(f"Similarity: {result['similarity_score']:.2%}")
print(f"Acceptable: {result['is_acceptable']}")
print(f"High severity issues: {result['severity_breakdown']['high']}")
print(f"Recommendation: {result['recommendation']}")
```

## Decisión de Aceptabilidad

```python
is_acceptable = (
    similarity_score >= threshold AND
    high_severity_differences == 0
)
```

La imagen se considera **aceptable** si:
1. El score de similitud está por encima del threshold (default: 0.95)
2. No hay diferencias de alta severidad

## Referencia ISTQB CT-AI

> **11.6.2 Using AI to Test the GUI**
> 
> "AI-based computer vision can be used to compare images (e.g., screenshots) to identify unintended changes to the layout, the size, position, color, font or other visible attributes of objects."
>
> "Such AI-based tools can also be used to support testing for compatibility on different browsers, devices or platforms..."
