# UI Testing with AI

Practical implementation of **ISTQB CT-AI Chapter 11.6** concepts: "Using AI for Testing User Interfaces"

## 📋 Description

This module implements UI testing techniques using AI, including:

### 11.6.1 Testing Through the GUI

- **Self-Healing Tests**: Tests that automatically adapt to UI changes
- **AI Object Locator**: Intelligent element identification using multiple strategies
- **Stability History**: Learns which locators are most reliable

### 11.6.2 Testing the GUI

- **Visual Regression Testing**: Detects unintended visual changes
- **Computer Vision**: Compares screenshots using computer vision algorithms
- **Rendering Validation**: Identifies poorly rendered or inaccessible elements

## 🏗️ Project Structure

```text
ui-testing-ai/
├── README.md                    # This file
├── ARCHITECTURE.md              # Detailed architecture
├── requirements.txt             # Python dependencies
├── pytest.ini                   # Pytest configuration
├── tests/                       # Example tests
│   ├── __init__.py
│   ├── test_visual_regression.py
│   ├── test_gui_validation.py
│   └── test_self_healing.py
├── utils/                       # AI utilities
│   ├── __init__.py
│   ├── visual_comparator.py    # Visual comparison with CV
│   ├── ai_object_locator.py    # Intelligent locator
│   └── gui_validator.py        # GUI validation
├── screenshots/                 # Screenshots
│   ├── baseline/               # Reference images
│   ├── current/                # Current images
│   └── diff/                   # Visual differences
├── config/                      # Configuration
│   └── test_config.yaml
└── diagrams/                    # Sequence diagrams
    ├── visual-testing-flow.md
    ├── self-healing-flow.md
    └── gui-validation-flow.md
```

## 🚀 Installation

### Prerequisites

- Python 3.8+
- pip

### Install Dependencies

```bash
cd ui-testing-ai
pip install -r requirements.txt
```

### Install Playwright (Optional)

```bash
playwright install
```

## 🧪 Test Execution

### Run all tests

```bash
pytest tests/ -v
```

### Run specific tests

```bash
# Visual regression testing
pytest tests/test_visual_regression.py -v

# Self-healing tests
pytest tests/test_self_healing.py -v

# GUI validation
pytest tests/test_gui_validation.py -v
```

### Generate HTML report

```bash
pytest tests/ --html=reports/test_report.html --self-contained-html
```

## 📊 Sequence Diagrams

Interactive Mermaid diagrams in the `diagrams/` folder:

- **[gui-validation-flow.md](diagrams/gui-validation-flow.md)** - GUI validation according to ISTQB CT-AI 11.6.2
- **[visual-testing-flow.md](diagrams/visual-testing-flow.md)** - Visual comparison process with computer vision
- **[self-healing-flow.md](diagrams/self-healing-flow.md)** - Self-healing test locator strategies

All diagrams render automatically on GitHub and VS Code with Mermaid support.

## 🎯 Use Cases

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

# Define multiple strategies
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

## 🔧 Configuration

Edit `config/test_config.yaml` to adjust:

- Visual similarity threshold
- Locator strategies
- Validation rules
- Timeouts and retries

## 📚 References

- **ISTQB CT-AI Syllabus**: Chapter 11.6
- **OpenCV Documentation**: <https://docs.opencv.org/>
- **Selenium Documentation**: <https://selenium-python.readthedocs.io/>
- **Playwright Documentation**: <https://playwright.dev/python/>

## 🤝 Contributions

This module is independent from the rest of the `aiinitiatives` project and can be used as a reference for implementing UI testing with AI.

## 📄 License

See LICENSE in the root of the main project.
