# Visual Testing Flow - Sequence Diagram

This diagram shows the complete **Visual Regression Testing** flow implemented according to ISTQB CT-AI 11.6.2.

## Sequence Diagram

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

## Metrics Used

### 1. **SSIM (Structural Similarity Index)**
- Range: 0 to 1 (1 = identical)
- Considers: luminance, contrast, structure
- Weight: 50% of total score

### 2. **MSE (Mean Squared Error)**
- Range: 0 to ∞ (0 = identical)
- Measures pixel by pixel differences
- Weight: 20% of total score

### 3. **Histogram Correlation**
- Range: 0 to 1 (1 = identical)
- Compares color distribution
- Weight: 20% of total score

### 4. **Perceptual Hash**
- Range: 0 to 64 different bits
- Visual hash of the image
- Weight: 10% of total score

## Severity Classification

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

## Example Usage

```python
from utils.visual_comparator import VisualComparator

# Create comparator with 95% threshold
comparator = VisualComparator(
    threshold=0.95,
    pixel_tolerance=10,
    ignore_antialiasing=True
)

# Compare screenshots
result = comparator.compare_screenshots(
    baseline_path="screenshots/baseline/page.png",
    current_path="screenshots/current/page.png",
    diff_output_path="screenshots/diff/page_diff.png"
)

# Analyze results
print(f"Similarity: {result['similarity_score']:.2%}")
print(f"Acceptable: {result['is_acceptable']}")
print(f"High severity issues: {result['severity_breakdown']['high']}")
print(f"Recommendation: {result['recommendation']}")
```

## Acceptability Decision

```python
is_acceptable = (
    similarity_score >= threshold AND
    high_severity_differences == 0
)
```

The image is considered **acceptable** if:
1. The similarity score is above the threshold (default: 0.95)
2. There are no high severity differences

## ISTQB CT-AI Reference

> **11.6.2 Using AI to Test the GUI**
> 
> "AI-based computer vision can be used to compare images (e.g., screenshots) to identify unintended changes to the layout, the size, position, color, font or other visible attributes of objects."
>
> "Such AI-based tools can also be used to support testing for compatibility on different browsers, devices or platforms..."
