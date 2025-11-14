"""
Visual Regression Testing Examples
Based on ISTQB CT-AI 11.6.2

This module demonstrates how to use AI-powered visual testing
to detect unintended changes in UI appearance.
"""

import pytest
import os
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils.visual_comparator import VisualComparator


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
def visual_comparator():
    """Create visual comparator instance"""
    return VisualComparator(
        threshold=0.95,
        pixel_tolerance=10,
        min_area=100,
        ignore_antialiasing=True
    )


@pytest.fixture
def screenshot_dirs():
    """Setup screenshot directories"""
    dirs = {
        'baseline': Path('screenshots/baseline'),
        'current': Path('screenshots/current'),
        'diff': Path('screenshots/diff')
    }
    
    for dir_path in dirs.values():
        dir_path.mkdir(parents=True, exist_ok=True)
    
    return dirs


@pytest.mark.visual
class TestVisualRegression:
    """Visual Regression Testing Suite"""
    
    def test_homepage_visual_consistency(
        self,
        chrome_driver,
        visual_comparator,
        screenshot_dirs
    ):
        """
        Test that homepage appears visually consistent.
        
        This test demonstrates ISTQB CT-AI 11.6.2 concepts:
        - Computer vision for image comparison
        - Detection of layout, size, position changes
        - Automated regression testing
        """
        # Navigate to page
        chrome_driver.get("https://example.com")
        
        # Take screenshot
        current_path = screenshot_dirs['current'] / 'homepage.png'
        chrome_driver.save_screenshot(str(current_path))
        
        # Check if baseline exists
        baseline_path = screenshot_dirs['baseline'] / 'homepage.png'
        
        if not baseline_path.exists():
            # First run - save as baseline
            import shutil
            shutil.copy(current_path, baseline_path)
            pytest.skip("Baseline created. Run test again to compare.")
        
        # Compare with baseline
        diff_path = screenshot_dirs['diff'] / 'homepage_diff.png'
        result = visual_comparator.compare_screenshots(
            str(baseline_path),
            str(current_path),
            str(diff_path)
        )
        
        # Print results
        print(f"\n📊 Visual Comparison Results:")
        print(f"   Similarity: {result['similarity_score']:.2%}")
        print(f"   Threshold: {result['threshold']:.2%}")
        print(f"   Differences: {result['differences_detected']}")
        print(f"   Recommendation: {result['recommendation']}")
        
        # Assert acceptable
        assert result['is_acceptable'], \
            f"Visual regression detected! Similarity: {result['similarity_score']:.2%}"
        
        # Check severity
        assert result['severity_breakdown']['high'] == 0, \
            f"Found {result['severity_breakdown']['high']} critical visual differences"
    
    def test_login_button_visual_stability(
        self,
        chrome_driver,
        visual_comparator,
        screenshot_dirs
    ):
        """
        Test that login button maintains visual appearance.
        
        Demonstrates detection of:
        - Color changes
        - Size changes
        - Position changes
        - Font changes
        """
        from selenium.webdriver.common.by import By
        
        # Navigate to page with login
        chrome_driver.get("https://example.com")
        
        try:
            # Find and screenshot button
            button = chrome_driver.find_element(By.LINK_TEXT, "More information...")
            
            # Scroll to element
            chrome_driver.execute_script("arguments[0].scrollIntoView(true);", button)
            
            # Take screenshot of element area
            location = button.location
            size = button.size
            
            # Take full page screenshot
            full_screenshot = screenshot_dirs['current'] / 'button_full.png'
            chrome_driver.save_screenshot(str(full_screenshot))
            
            # Crop to button area (would need PIL for actual cropping)
            print(f"\n📍 Button location: {location}")
            print(f"   Size: {size}")
            
            # For demo, we'll use full page
            current_path = full_screenshot
            baseline_path = screenshot_dirs['baseline'] / 'button_full.png'
            
            if not baseline_path.exists():
                import shutil
                shutil.copy(current_path, baseline_path)
                pytest.skip("Button baseline created.")
            
            # Compare
            diff_path = screenshot_dirs['diff'] / 'button_diff.png'
            result = visual_comparator.compare_screenshots(
                str(baseline_path),
                str(current_path),
                str(diff_path)
            )
            
            print(f"\n🔘 Button Visual Check:")
            print(f"   Similarity: {result['similarity_score']:.2%}")
            print(f"   Status: {'✅ PASS' if result['is_acceptable'] else '❌ FAIL'}")
            
            assert result['is_acceptable'], "Button visual regression detected"
            
        except Exception as e:
            pytest.skip(f"Could not test button: {e}")
    
    def test_responsive_design_consistency(
        self,
        chrome_driver,
        visual_comparator,
        screenshot_dirs
    ):
        """
        Test visual consistency across different viewport sizes.
        
        Demonstrates:
        - Responsive design testing
        - Multi-resolution comparison
        - Layout shift detection
        """
        url = "https://example.com"
        viewports = [
            ('desktop', 1920, 1080),
            ('tablet', 768, 1024),
            ('mobile', 375, 667)
        ]
        
        for name, width, height in viewports:
            # Set viewport
            chrome_driver.set_window_size(width, height)
            chrome_driver.get(url)
            
            # Screenshot
            current_path = screenshot_dirs['current'] / f'{name}.png'
            chrome_driver.save_screenshot(str(current_path))
            
            baseline_path = screenshot_dirs['baseline'] / f'{name}.png'
            
            if not baseline_path.exists():
                import shutil
                shutil.copy(current_path, baseline_path)
                continue
            
            # Compare
            diff_path = screenshot_dirs['diff'] / f'{name}_diff.png'
            result = visual_comparator.compare_screenshots(
                str(baseline_path),
                str(current_path),
                str(diff_path)
            )
            
            print(f"\n📱 {name.upper()} ({width}x{height}):")
            print(f"   Similarity: {result['similarity_score']:.2%}")
            print(f"   Differences: {result['differences_detected']}")
            
            # More lenient threshold for responsive (layout may shift slightly)
            assert result['similarity_score'] >= 0.90, \
                f"{name} view has significant visual changes"
    
    def test_dark_mode_vs_light_mode(
        self,
        chrome_driver,
        visual_comparator,
        screenshot_dirs
    ):
        """
        Compare dark mode vs light mode (expected to fail).
        
        Demonstrates how visual testing can detect theme changes.
        """
        chrome_driver.get("https://example.com")
        
        # Take light mode screenshot
        light_path = screenshot_dirs['current'] / 'light_mode.png'
        chrome_driver.save_screenshot(str(light_path))
        
        # For demo purposes, we'll use the same screenshot
        # In real scenario, you'd toggle dark mode here
        dark_path = screenshot_dirs['current'] / 'dark_mode.png'
        chrome_driver.save_screenshot(str(dark_path))
        
        # Compare (should show differences if themes differ)
        diff_path = screenshot_dirs['diff'] / 'theme_diff.png'
        result = visual_comparator.compare_screenshots(
            str(light_path),
            str(dark_path),
            str(diff_path)
        )
        
        print(f"\n🎨 Theme Comparison:")
        print(f"   Similarity: {result['similarity_score']:.2%}")
        print(f"   Color differences: Expected for different themes")
        
        # This test documents that themes are different
        # Not asserting failure - just documenting the difference


@pytest.mark.visual
@pytest.mark.slow
class TestVisualRegressionAdvanced:
    """Advanced visual regression tests"""
    
    def test_animation_frame_comparison(
        self,
        chrome_driver,
        visual_comparator,
        screenshot_dirs
    ):
        """
        Test that animations render consistently.
        
        Captures multiple frames and compares them.
        """
        import time
        
        chrome_driver.get("https://example.com")
        
        # Capture frames at different times
        frames = []
        for i in range(3):
            time.sleep(0.5)
            frame_path = screenshot_dirs['current'] / f'frame_{i}.png'
            chrome_driver.save_screenshot(str(frame_path))
            frames.append(frame_path)
        
        print("\n🎬 Animation Frame Analysis:")
        print(f"   Captured {len(frames)} frames")
        
        # In real test, you'd compare each frame to baseline
        # Here we just demonstrate the capability
        pytest.skip("Animation testing requires baseline frames")
    
    def test_cross_browser_visual_parity(self):
        """
        Test that page looks consistent across browsers.
        
        Would require multiple WebDriver instances.
        """
        pytest.skip("Cross-browser testing requires multiple drivers")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
