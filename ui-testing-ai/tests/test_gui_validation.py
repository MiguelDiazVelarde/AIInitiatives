"""
GUI Validation Test Examples
Based on ISTQB CT-AI 11.6.2

This module demonstrates automated GUI validation using AI to detect
rendering issues, accessibility problems, and usability concerns.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils.gui_validator import GUIValidator


@pytest.fixture
def chrome_driver():
    """Setup Chrome WebDriver"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    yield driver
    driver.quit()


@pytest.fixture
def gui_validator():
    """Create GUI validator instance"""
    return GUIValidator(
        min_contrast_ratio=4.5,  # WCAG AA standard
        min_button_size=44,      # Mobile-friendly
        min_font_size=12         # Readable text
    )


@pytest.mark.gui_validation
class TestGUIValidation:
    """GUI Validation Test Suite"""
    
    def test_validate_example_page(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Validate example.com for GUI issues.
        
        Demonstrates ISTQB CT-AI 11.6.2 concepts:
        - Determining acceptability of UI screens
        - Identifying incorrectly rendered elements
        - Detecting inaccessible objects
        """
        chrome_driver.get("https://example.com")
        
        # Run validation
        issues = gui_validator.validate_page(chrome_driver)
        
        # Print report
        gui_validator.print_report()
        
        # Analyze results
        summary = gui_validator.get_summary()
        
        print(f"\n📋 Validation Summary:")
        print(f"   Total issues: {summary['total_issues']}")
        print(f"   Critical: {summary['by_severity']['critical']}")
        print(f"   High: {summary['by_severity']['high']}")
        print(f"   Medium: {summary['by_severity']['medium']}")
        print(f"   Low: {summary['by_severity']['low']}")
        
        # Assert no critical issues
        assert summary['by_severity']['critical'] == 0, \
            "Critical GUI issues detected!"
    
    def test_accessibility_validation(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Test accessibility-specific validation.
        
        Checks for:
        - Missing alt text on images
        - Form labels
        - ARIA attributes
        """
        chrome_driver.get("https://example.com")
        
        issues = gui_validator.validate_page(chrome_driver)
        
        # Filter accessibility issues
        accessibility_issues = [
            issue for issue in issues
            if issue.issue_type in [
                'missing_alt_text',
                'missing_label',
                'unlabeled_input'
            ]
        ]
        
        print(f"\n♿ Accessibility Issues: {len(accessibility_issues)}")
        for issue in accessibility_issues:
            print(f"   - {issue.description}")
        
        # Report findings (not failing - just documenting)
        if accessibility_issues:
            print("\n💡 Accessibility improvements recommended")
    
    def test_responsive_elements(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Test that interactive elements are appropriately sized.
        
        Validates:
        - Touch target sizes
        - Button dimensions
        - Mobile-friendly spacing
        """
        chrome_driver.get("https://example.com")
        
        issues = gui_validator.validate_page(chrome_driver)
        
        # Filter size-related issues
        size_issues = [
            issue for issue in issues
            if issue.issue_type in ['small_touch_target', 'tiny_text']
        ]
        
        print(f"\n📏 Size & Touch Target Issues: {len(size_issues)}")
        for issue in size_issues:
            print(f"   - {issue.description}")
            if issue.suggestion:
                print(f"     💡 {issue.suggestion}")
        
        # Assert no critical size issues
        critical_size = [i for i in size_issues if i.severity in ['critical', 'high']]
        assert len(critical_size) == 0, "Critical size issues found"
    
    def test_image_validation(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Test that all images load correctly.
        
        Detects:
        - Broken images
        - Missing images
        - Failed loads
        """
        chrome_driver.get("https://example.com")
        
        issues = gui_validator.validate_page(chrome_driver)
        
        # Filter image issues
        image_issues = [
            issue for issue in issues
            if issue.issue_type == 'broken_image'
        ]
        
        print(f"\n🖼️  Image Issues: {len(image_issues)}")
        for issue in image_issues:
            print(f"   - {issue.description}")
        
        # Assert no broken images
        assert len(image_issues) == 0, \
            f"Found {len(image_issues)} broken images"
    
    def test_element_visibility(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Test that interactive elements are visible.
        
        Detects:
        - Hidden buttons
        - Off-screen elements
        - Zero-opacity elements
        """
        chrome_driver.get("https://example.com")
        
        issues = gui_validator.validate_page(chrome_driver)
        
        # Filter visibility issues
        visibility_issues = [
            issue for issue in issues
            if issue.issue_type in ['invisible_element', 'overlapping_elements']
        ]
        
        print(f"\n👁️  Visibility Issues: {len(visibility_issues)}")
        for issue in visibility_issues:
            print(f"   - {issue.description}")
        
        # Warn about visibility issues
        if visibility_issues:
            print("\n⚠️  Elements may not be accessible to users")


@pytest.mark.gui_validation
@pytest.mark.integration
class TestGUIValidationWorkflows:
    """End-to-end GUI validation workflows"""
    
    def test_full_page_health_check(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Complete page health check.
        
        Runs all validation checks and produces comprehensive report.
        """
        chrome_driver.get("https://example.com")
        
        print("\n" + "="*70)
        print("FULL PAGE HEALTH CHECK")
        print("="*70)
        
        # Run validation
        issues = gui_validator.validate_page(chrome_driver)
        
        # Print full report
        gui_validator.print_report()
        
        # Get summary
        summary = gui_validator.get_summary()
        
        # Determine page health score
        health_score = 100
        health_score -= summary['by_severity']['critical'] * 25
        health_score -= summary['by_severity']['high'] * 10
        health_score -= summary['by_severity']['medium'] * 5
        health_score -= summary['by_severity']['low'] * 1
        health_score = max(0, health_score)
        
        print(f"\n🏥 Page Health Score: {health_score}/100")
        
        if health_score >= 90:
            print("   Status: ✅ Excellent")
        elif health_score >= 75:
            print("   Status: ✅ Good")
        elif health_score >= 50:
            print("   Status: ⚠️  Needs Improvement")
        else:
            print("   Status: ❌ Poor")
        
        # Assert minimum health score
        assert health_score >= 50, \
            f"Page health score too low: {health_score}/100"
    
    def test_progressive_validation(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Test validation at different stages of page load.
        
        Demonstrates validation during:
        - Initial load
        - After JavaScript execution
        - After user interactions
        """
        import time
        
        chrome_driver.get("https://example.com")
        
        # Validation 1: Immediate
        print("\n1️⃣ Immediate validation...")
        issues_immediate = gui_validator.validate_page(chrome_driver)
        print(f"   Issues found: {len(issues_immediate)}")
        
        # Wait for full load
        time.sleep(2)
        
        # Validation 2: After load
        print("\n2️⃣ Post-load validation...")
        issues_loaded = gui_validator.validate_page(chrome_driver)
        print(f"   Issues found: {len(issues_loaded)}")
        
        # Compare
        print(f"\n📊 Issue progression:")
        print(f"   Immediate: {len(issues_immediate)}")
        print(f"   After load: {len(issues_loaded)}")
        
        if len(issues_loaded) > len(issues_immediate):
            print("   ⚠️  More issues after load (possible render problems)")
    
    def test_cross_page_validation(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Validate multiple pages and compare results.
        
        Useful for finding inconsistent UI patterns across site.
        """
        urls = [
            ("Example", "https://example.com"),
            ("IANA", "https://www.iana.org"),
        ]
        
        all_results = {}
        
        for name, url in urls:
            try:
                print(f"\n🔍 Validating {name}...")
                chrome_driver.get(url)
                
                issues = gui_validator.validate_page(chrome_driver)
                summary = gui_validator.get_summary()
                
                all_results[name] = summary
                
                print(f"   Total issues: {summary['total_issues']}")
                print(f"   Critical: {summary['by_severity']['critical']}")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        # Compare results
        print("\n📊 Cross-Page Comparison:")
        for name, summary in all_results.items():
            print(f"\n   {name}:")
            print(f"   └─ Issues: {summary['total_issues']}")
            print(f"      Critical: {summary['by_severity']['critical']}")
            print(f"      High: {summary['by_severity']['high']}")


@pytest.mark.gui_validation
@pytest.mark.slow
class TestAdvancedGUIValidation:
    """Advanced GUI validation scenarios"""
    
    def test_contrast_ratio_checking(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Test color contrast ratios for accessibility.
        
        Note: Full implementation would require color extraction
        from computed styles and contrast calculation.
        """
        pytest.skip("Contrast ratio checking requires additional implementation")
    
    def test_layout_shift_detection(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Detect cumulative layout shift (CLS).
        
        Would require tracking element positions over time.
        """
        pytest.skip("Layout shift detection requires performance API integration")
    
    def test_font_rendering_validation(
        self,
        chrome_driver,
        gui_validator
    ):
        """
        Validate font rendering and readability.
        
        Checks font sizes, weights, and spacing.
        """
        chrome_driver.get("https://example.com")
        
        issues = gui_validator.validate_page(chrome_driver)
        
        font_issues = [
            issue for issue in issues
            if 'text' in issue.issue_type or 'font' in issue.issue_type
        ]
        
        print(f"\n🔤 Font/Text Issues: {len(font_issues)}")
        for issue in font_issues:
            print(f"   - {issue.description}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
