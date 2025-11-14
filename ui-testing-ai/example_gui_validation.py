"""
Example: GUI Validation
Demonstrates ISTQB CT-AI 11.6.2 concepts
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils.gui_validator import GUIValidator

def main():
    # Configure Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Create validator
        validator = GUIValidator(
            min_contrast_ratio=4.5,  # WCAG AA standard
            min_button_size=44,      # Touch-friendly for mobile
            min_font_size=12         # Readable text size
        )
        
        # Navigate to page
        print("🌐 Navigating to example.com...")
        driver.get("https://example.com")
        
        print("\n" + "="*70)
        print("GUI VALIDATION TEST")
        print("="*70)
        print("\n🔍 Running comprehensive validation checks...")
        print("   • Checking for broken images")
        print("   • Checking element visibility")
        print("   • Checking for overlapping elements")
        print("   • Checking accessibility (alt text, labels)")
        print("   • Checking button sizes")
        print("   • Checking text readability")
        print("   • Checking form labels")
        
        # Run validation
        issues = validator.validate_page(driver)
        
        # Print detailed report
        validator.print_report()
        
        # Get summary
        summary = validator.get_summary()
        
        # Calculate health score
        health_score = 100
        health_score -= summary['by_severity'].get('critical', 0) * 25
        health_score -= summary['by_severity'].get('high', 0) * 10
        health_score -= summary['by_severity'].get('medium', 0) * 5
        health_score -= summary['by_severity'].get('low', 0) * 1
        health_score = max(0, health_score)
        
        # Print health score
        print("\n" + "="*70)
        print("PAGE HEALTH ASSESSMENT")
        print("="*70)
        print(f"\n🏥 Overall Health Score: {health_score}/100")
        
        if health_score >= 90:
            print("   Status: ✅ EXCELLENT - Page quality is outstanding")
            status_icon = "✅"
        elif health_score >= 75:
            print("   Status: ✅ GOOD - Minor improvements recommended")
            status_icon = "✅"
        elif health_score >= 50:
            print("   Status: ⚠️  NEEDS IMPROVEMENT - Several issues to address")
            status_icon = "⚠️"
        else:
            print("   Status: ❌ POOR - Significant issues require attention")
            status_icon = "❌"
        
        # Issue breakdown
        print(f"\n📊 Issue Breakdown:")
        print(f"   Critical: {summary['by_severity'].get('critical', 0)}")
        print(f"   High:     {summary['by_severity'].get('high', 0)}")
        print(f"   Medium:   {summary['by_severity'].get('medium', 0)}")
        print(f"   Low:      {summary['by_severity'].get('low', 0)}")
        
        # Recommendations
        print(f"\n💡 Recommendations:")
        if summary['by_severity'].get('critical', 0) > 0:
            print("   🔴 Fix critical issues immediately before release")
        if summary['by_severity'].get('high', 0) > 0:
            print("   🟠 Address high severity issues soon")
        if summary['by_severity'].get('medium', 0) > 3:
            print("   🟡 Consider fixing medium severity issues")
        if summary['total_issues'] == 0:
            print("   🌟 Perfect! No issues detected")
        
        # Test outcome
        print("\n" + "="*70)
        
        if summary['by_severity'].get('critical', 0) > 0:
            print(f"\n{status_icon} TEST FAILED: Critical issues must be fixed")
            return 1
        elif health_score < 50:
            print(f"\n{status_icon} TEST FAILED: Health score below threshold")
            return 1
        else:
            print(f"\n{status_icon} TEST PASSED: Page meets quality standards")
            return 0
    
    finally:
        driver.quit()

if __name__ == "__main__":
    exit(main())
