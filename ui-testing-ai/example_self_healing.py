"""
Example: Self-Healing Test
Demonstrates ISTQB CT-AI 11.6.1 concepts
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from utils.ai_object_locator import AIObjectLocator

def main():
    # Configure Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Create AI Locator with persistent history
        locator = AIObjectLocator(history_file="config/locator_history.json")
        
        # Navigate to page
        print("🌐 Navigating to example.com...")
        driver.get("https://example.com")
        
        print("\n" + "="*60)
        print("SELF-HEALING TEST DEMONSTRATION")
        print("="*60)
        
        # Test 1: Find main heading
        print("\n📍 Test 1: Finding page heading...")
        heading_strategies = [
            {"by": "id", "value": "main-heading"},  # May not exist
            {"by": "tag_name", "value": "h1"},      # Should work
            {"by": "xpath", "value": "//h1[contains(text(), 'Example')]"},
            {"by": "css_selector", "value": "body > div > h1"},
        ]
        
        heading = locator.find_element_smart(
            driver=driver,
            element_name="page_heading",
            strategies=heading_strategies,
            timeout=10,
            retry_count=3
        )
        
        if heading:
            print(f"   ✅ Found heading: '{heading.text}'")
            locator.print_stats("page_heading")
        else:
            print("   ❌ Could not find heading")
        
        # Test 2: Find link
        print("\n📍 Test 2: Finding 'More information' link...")
        link_strategies = [
            {"by": "id", "value": "info-link"},  # Probably doesn't exist
            {"by": "link_text", "value": "More information..."},  # Should work
            {"by": "partial_link_text", "value": "More information"},
            {"by": "xpath", "value": "//a[contains(text(), 'More information')]"},
            {"by": "css_selector", "value": "a[href*='iana']"},
        ]
        
        link = locator.find_element_smart(
            driver=driver,
            element_name="more_info_link",
            strategies=link_strategies,
            timeout=10,
            retry_count=3
        )
        
        if link:
            print(f"   ✅ Found link: '{link.text}'")
            print(f"   🔗 URL: {link.get_attribute('href')}")
            locator.print_stats("more_info_link")
        else:
            print("   ❌ Could not find link")
        
        # Test 3: Find main content
        print("\n📍 Test 3: Finding main content...")
        content_strategies = [
            {"by": "id", "value": "content"},
            {"by": "tag_name", "value": "p"},
            {"by": "css_selector", "value": "div > p"},
            {"by": "xpath", "value": "//p[1]"},
        ]
        
        content = locator.find_element_smart(
            driver=driver,
            element_name="main_content",
            strategies=content_strategies,
            timeout=10,
            retry_count=3
        )
        
        if content:
            text_preview = content.text[:100] + "..." if len(content.text) > 100 else content.text
            print(f"   ✅ Found content: '{text_preview}'")
            locator.print_stats("main_content")
        else:
            print("   ❌ Could not find content")
        
        # Summary
        print("\n" + "="*60)
        print("OVERALL STATISTICS")
        print("="*60)
        locator.print_stats()
        
        print("\n💡 Key Benefits of Self-Healing:")
        print("   • Tests adapt to UI changes automatically")
        print("   • Multiple fallback strategies")
        print("   • Learns which locators are most reliable")
        print("   • Reduces test maintenance")
        
        print("\n✅ SELF-HEALING TEST COMPLETED")
        print("   Run this script multiple times to see learning in action!")
        
        return 0
    
    finally:
        driver.quit()

if __name__ == "__main__":
    exit(main())
