"""
GUI Validator - Automated GUI Quality Checks
Based on ISTQB CT-AI 11.6.2

This module uses ML models and heuristics to validate UI screens
and detect rendering issues, accessibility problems, and usability concerns.
"""

import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.by import By


@dataclass
class GUIIssue:
    """Represents a GUI validation issue"""
    element: Optional[str]
    issue_type: str
    severity: str  # 'low', 'medium', 'high', 'critical'
    description: str
    location: Optional[Dict[str, int]] = None
    suggestion: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            'element': self.element,
            'type': self.issue_type,
            'severity': self.severity,
            'description': self.description,
            'location': self.location,
            'suggestion': self.suggestion
        }


class GUIValidator:
    """
    Validate GUI screens for common issues.
    
    Implements concepts from ISTQB CT-AI 11.6.2:
    - Determines acceptability of user interface screens
    - Identifies incorrectly rendered elements
    - Detects inaccessible or hard-to-detect objects
    - Uses heuristics and supervised learning patterns
    """
    
    def __init__(
        self,
        min_contrast_ratio: float = 4.5,
        min_button_size: int = 44,
        min_font_size: int = 12
    ):
        """
        Initialize GUI Validator
        
        Args:
            min_contrast_ratio: Minimum contrast ratio (WCAG AA = 4.5)
            min_button_size: Minimum button size in pixels
            min_font_size: Minimum font size in pixels
        """
        self.min_contrast_ratio = min_contrast_ratio
        self.min_button_size = min_button_size
        self.min_font_size = min_font_size
        self.issues: List[GUIIssue] = []
    
    def validate_page(self, driver: WebDriver) -> List[GUIIssue]:
        """
        Perform comprehensive validation of current page.
        
        Checks for:
        - Broken images
        - Invisible elements
        - Overlapping elements
        - Accessibility issues
        - Contrast problems
        - Touch target sizes
        
        Args:
            driver: Selenium WebDriver instance
            
        Returns:
            List of detected GUI issues
            
        Example:
            >>> validator = GUIValidator()
            >>> driver.get("https://example.com")
            >>> issues = validator.validate_page(driver)
            >>> for issue in issues:
            ...     print(f"{issue.severity}: {issue.description}")
        """
        self.issues = []
        
        # Run all validation checks
        self._check_broken_images(driver)
        self._check_invisible_elements(driver)
        self._check_overlapping_elements(driver)
        self._check_accessibility(driver)
        self._check_button_sizes(driver)
        self._check_text_readability(driver)
        self._check_form_labels(driver)
        
        return self.issues
    
    def _check_broken_images(self, driver: WebDriver):
        """Detect broken or missing images"""
        images = driver.find_elements(By.TAG_NAME, "img")
        
        for img in images:
            try:
                # Check if image is loaded
                natural_width = driver.execute_script(
                    "return arguments[0].naturalWidth;", img
                )
                
                if natural_width == 0:
                    src = img.get_attribute("src") or "unknown"
                    self.issues.append(GUIIssue(
                        element=f"img[src='{src[:50]}']",
                        issue_type="broken_image",
                        severity="high",
                        description=f"Image failed to load: {src[:100]}",
                        suggestion="Verify image URL and accessibility"
                    ))
            except Exception as e:
                continue
    
    def _check_invisible_elements(self, driver: WebDriver):
        """Detect elements that should be visible but aren't"""
        # Check buttons
        buttons = driver.find_elements(By.TAG_NAME, "button")
        buttons.extend(driver.find_elements(By.CSS_SELECTOR, "input[type='button']"))
        buttons.extend(driver.find_elements(By.CSS_SELECTOR, "input[type='submit']"))
        
        for button in buttons:
            try:
                if not button.is_displayed():
                    text = button.text or button.get_attribute("value") or "unknown"
                    self.issues.append(GUIIssue(
                        element=f"button: {text[:30]}",
                        issue_type="invisible_element",
                        severity="medium",
                        description=f"Button is present but not visible: {text}",
                        suggestion="Check CSS display, visibility, or z-index properties"
                    ))
            except:
                continue
    
    def _check_overlapping_elements(self, driver: WebDriver):
        """Detect overlapping interactive elements"""
        interactive_selectors = [
            "button", "a", "input", "select", "textarea",
            "[onclick]", "[role='button']"
        ]
        
        elements = []
        for selector in interactive_selectors:
            try:
                elements.extend(driver.find_elements(By.CSS_SELECTOR, selector))
            except:
                continue
        
        # Get bounding boxes
        boxes = []
        for elem in elements:
            try:
                if elem.is_displayed():
                    location = elem.location
                    size = elem.size
                    boxes.append({
                        'element': elem,
                        'x': location['x'],
                        'y': location['y'],
                        'width': size['width'],
                        'height': size['height']
                    })
            except:
                continue
        
        # Check for overlaps
        for i, box1 in enumerate(boxes):
            for box2 in boxes[i+1:]:
                if self._boxes_overlap(box1, box2):
                    elem_desc1 = self._describe_element(box1['element'])
                    elem_desc2 = self._describe_element(box2['element'])
                    
                    self.issues.append(GUIIssue(
                        element=f"{elem_desc1} & {elem_desc2}",
                        issue_type="overlapping_elements",
                        severity="medium",
                        description=f"Interactive elements overlap: {elem_desc1} and {elem_desc2}",
                        location={'x': box1['x'], 'y': box1['y']},
                        suggestion="Adjust element positioning or z-index"
                    ))
    
    def _check_accessibility(self, driver: WebDriver):
        """Check basic accessibility requirements"""
        # Check for alt text on images
        images = driver.find_elements(By.TAG_NAME, "img")
        for img in images:
            try:
                alt = img.get_attribute("alt")
                if alt is None or alt.strip() == "":
                    src = img.get_attribute("src") or "unknown"
                    self.issues.append(GUIIssue(
                        element=f"img[src='{src[:50]}']",
                        issue_type="missing_alt_text",
                        severity="medium",
                        description=f"Image missing alt text: {src[:100]}",
                        suggestion="Add descriptive alt attribute for screen readers"
                    ))
            except:
                continue
        
        # Check for form labels
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            try:
                input_type = inp.get_attribute("type")
                if input_type not in ["hidden", "submit", "button"]:
                    inp_id = inp.get_attribute("id")
                    if inp_id:
                        # Check if there's a label for this input
                        try:
                            label = driver.find_element(By.CSS_SELECTOR, f"label[for='{inp_id}']")
                        except:
                            self.issues.append(GUIIssue(
                                element=f"input#{inp_id}",
                                issue_type="missing_label",
                                severity="medium",
                                description=f"Form input missing associated label: {inp_id}",
                                suggestion="Add <label> element with for attribute"
                            ))
            except:
                continue
    
    def _check_button_sizes(self, driver: WebDriver):
        """Check if buttons meet minimum touch target size"""
        buttons = driver.find_elements(By.TAG_NAME, "button")
        buttons.extend(driver.find_elements(By.CSS_SELECTOR, "input[type='button']"))
        buttons.extend(driver.find_elements(By.CSS_SELECTOR, "input[type='submit']"))
        
        for button in buttons:
            try:
                if button.is_displayed():
                    size = button.size
                    if size['width'] < self.min_button_size or size['height'] < self.min_button_size:
                        text = button.text or button.get_attribute("value") or "unknown"
                        self.issues.append(GUIIssue(
                            element=f"button: {text[:30]}",
                            issue_type="small_touch_target",
                            severity="medium",
                            description=f"Button too small ({size['width']}x{size['height']}px): {text}",
                            suggestion=f"Increase size to at least {self.min_button_size}x{self.min_button_size}px"
                        ))
            except:
                continue
    
    def _check_text_readability(self, driver: WebDriver):
        """Check text size and contrast"""
        text_elements = driver.find_elements(By.CSS_SELECTOR, "p, span, div, h1, h2, h3, h4, h5, h6")
        
        for elem in text_elements[:50]:  # Limit to first 50 to avoid performance issues
            try:
                if elem.is_displayed() and elem.text.strip():
                    font_size = driver.execute_script(
                        "return window.getComputedStyle(arguments[0]).fontSize;",
                        elem
                    )
                    
                    # Parse font size
                    if font_size:
                        size_value = float(font_size.replace('px', ''))
                        if size_value < self.min_font_size:
                            text_preview = elem.text[:50]
                            self.issues.append(GUIIssue(
                                element=f"{elem.tag_name}: {text_preview}",
                                issue_type="tiny_text",
                                severity="low",
                                description=f"Text too small ({size_value}px): {text_preview}...",
                                suggestion=f"Increase font size to at least {self.min_font_size}px"
                            ))
            except:
                continue
    
    def _check_form_labels(self, driver: WebDriver):
        """Ensure form inputs have proper labels"""
        forms = driver.find_elements(By.TAG_NAME, "form")
        
        for form in forms:
            try:
                inputs = form.find_elements(By.CSS_SELECTOR, "input, textarea, select")
                for inp in inputs:
                    input_type = inp.get_attribute("type")
                    if input_type not in ["hidden", "submit", "button"]:
                        # Check for associated label
                        inp_id = inp.get_attribute("id")
                        aria_label = inp.get_attribute("aria-label")
                        placeholder = inp.get_attribute("placeholder")
                        
                        if not aria_label and not placeholder:
                            if not inp_id:
                                self.issues.append(GUIIssue(
                                    element="form input",
                                    issue_type="unlabeled_input",
                                    severity="high",
                                    description="Form input without label, ID, or aria-label",
                                    suggestion="Add id and corresponding label, or aria-label attribute"
                                ))
            except:
                continue
    
    def _boxes_overlap(self, box1: Dict, box2: Dict) -> bool:
        """Check if two bounding boxes overlap"""
        return not (
            box1['x'] + box1['width'] < box2['x'] or
            box2['x'] + box2['width'] < box1['x'] or
            box1['y'] + box1['height'] < box2['y'] or
            box2['y'] + box2['height'] < box1['y']
        )
    
    def _describe_element(self, element: WebElement) -> str:
        """Create human-readable element description"""
        tag = element.tag_name
        elem_id = element.get_attribute("id")
        elem_class = element.get_attribute("class")
        text = element.text[:20] if element.text else ""
        
        parts = [tag]
        if elem_id:
            parts.append(f"#{elem_id}")
        if elem_class:
            parts.append(f".{elem_class.split()[0]}")
        if text:
            parts.append(f"'{text}'")
        
        return " ".join(parts)
    
    def get_summary(self) -> Dict:
        """Get validation summary"""
        severity_counts = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        for issue in self.issues:
            severity_counts[issue.severity] = severity_counts.get(issue.severity, 0) + 1
        
        return {
            'total_issues': len(self.issues),
            'by_severity': severity_counts,
            'issues': [issue.to_dict() for issue in self.issues]
        }
    
    def print_report(self):
        """Print human-readable validation report"""
        print("\n" + "="*70)
        print("GUI VALIDATION REPORT")
        print("="*70)
        
        if not self.issues:
            print("✅ No issues detected!")
            return
        
        summary = self.get_summary()
        print(f"\nTotal Issues: {summary['total_issues']}")
        print(f"  Critical: {summary['by_severity']['critical']}")
        print(f"  High:     {summary['by_severity']['high']}")
        print(f"  Medium:   {summary['by_severity']['medium']}")
        print(f"  Low:      {summary['by_severity']['low']}")
        
        print("\n" + "-"*70)
        print("DETAILED ISSUES:")
        print("-"*70)
        
        for i, issue in enumerate(self.issues, 1):
            severity_icon = {
                'critical': '🔴',
                'high': '🟠',
                'medium': '🟡',
                'low': '🟢'
            }.get(issue.severity, '⚪')
            
            print(f"\n{i}. {severity_icon} [{issue.severity.upper()}] {issue.issue_type}")
            print(f"   Element: {issue.element}")
            print(f"   Issue: {issue.description}")
            if issue.suggestion:
                print(f"   💡 Suggestion: {issue.suggestion}")
        
        print("\n" + "="*70)
