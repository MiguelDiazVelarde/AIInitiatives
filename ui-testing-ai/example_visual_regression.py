"""
Example: Visual Regression Testing
Demonstrates ISTQB CT-AI 11.6.2 concepts
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils.visual_comparator import VisualComparator
from pathlib import Path
import shutil

def main():
    # Configure Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Navigate to page
        print("🌐 Navigating to example.com...")
        driver.get("https://example.com")
        
        # Take screenshot
        screenshot_path = Path("screenshots/current/homepage.png")
        screenshot_path.parent.mkdir(parents=True, exist_ok=True)
        driver.save_screenshot(str(screenshot_path))
        print(f"📸 Screenshot saved: {screenshot_path}")
        
        # Create comparator
        comparator = VisualComparator(
            threshold=0.95,
            pixel_tolerance=10,
            ignore_antialiasing=True
        )
        
        # Check if baseline exists
        baseline_path = Path("screenshots/baseline/homepage.png")
        
        if not baseline_path.exists():
            # First run - create baseline
            baseline_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(screenshot_path, baseline_path)
            print(f"✅ Baseline created: {baseline_path}")
            print("   Run this script again to compare against baseline.")
        else:
            # Compare with baseline
            print(f"\n🔍 Comparing with baseline...")
            diff_path = Path("screenshots/diff/homepage_diff.png")
            diff_path.parent.mkdir(parents=True, exist_ok=True)
            
            result = comparator.compare_screenshots(
                str(baseline_path),
                str(screenshot_path),
                str(diff_path)
            )
            
            # Print results
            print(f"\n{'='*60}")
            print("VISUAL REGRESSION TEST RESULTS")
            print(f"{'='*60}")
            print(f"\n📊 Similarity Metrics:")
            print(f"   Overall Score: {result['similarity_score']:.2%}")
            print(f"   SSIM:          {result['metrics']['ssim']:.3f}")
            print(f"   MSE:           {result['metrics']['mse']:.2f}")
            print(f"   Hist Corr:     {result['metrics']['histogram_correlation']:.3f}")
            print(f"   Hash Diff:     {result['metrics']['perceptual_hash_diff']} bits")
            
            print(f"\n🎯 Threshold: {result['threshold']:.2%}")
            print(f"   Status: {'✅ ACCEPTABLE' if result['is_acceptable'] else '❌ UNACCEPTABLE'}")
            
            print(f"\n🔍 Differences Detected: {result['differences_detected']}")
            if result['differences_detected'] > 0:
                print(f"   High Severity:   {result['severity_breakdown']['high']}")
                print(f"   Medium Severity: {result['severity_breakdown']['medium']}")
                print(f"   Low Severity:    {result['severity_breakdown']['low']}")
                print(f"\n   📁 Diff image saved: {diff_path}")
            
            print(f"\n💡 Recommendation:")
            print(f"   {result['recommendation']}")
            
            print(f"\n{'='*60}")
            
            # Determine test outcome
            if result['is_acceptable']:
                print("\n✅ TEST PASSED: Visual appearance is consistent")
                return 0
            else:
                print("\n❌ TEST FAILED: Visual regression detected!")
                print(f"   Review diff image: {diff_path}")
                return 1
    
    finally:
        driver.quit()

if __name__ == "__main__":
    exit(main())
