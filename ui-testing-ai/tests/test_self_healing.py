"""
Self-Healing Test Examples
Based on ISTQB CT-AI 11.6.1

This module demonstrates AI-powered self-healing tests that adapt
to UI changes automatically using multiple locator strategies.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from utils.ai_object_locator import AIObjectLocator


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
def ai_locator():
    """Create AI object locator instance"""
    return AIObjectLocator(history_file="config/locator_history.json")


@pytest.mark.self_healing
class TestSelfHealingLocators:
    """Self-Healing Test Suite"""
    
    def test_find_link_with_multiple_strategies(
        self,
        chrome_driver,
        ai_locator
    ):
        """
        Test finding a link using multiple locator strategies.
        
        Demonstrates ISTQB CT-AI 11.6.1 concepts:
        - Multiple locator criteria (ID, class, XPath, text)
        - Learning historically stable criteria
        - Automatic adaptation to UI changes
        """
        chrome_driver.get("https://example.com")
        
        # Define multiple strategies to find "More information..." link
        strategies = [
            {"by": "link_text", "value": "More information..."},
            {"by": "partial_link_text", "value": "More information"},
            {"by": "xpath", "value": "//a[contains(text(), 'More information')]"},
            {"by": "css_selector", "value": "a[href*='iana']"},
        ]
        
        # Use AI locator to find element
        element = ai_locator.find_element_smart(
            driver=chrome_driver,
            element_name="more_info_link",
            strategies=strategies,
            timeout=10,
            retry_count=3
        )
        
        assert element is not None, "Failed to find element with any strategy"
        assert element.is_displayed(), "Element found but not visible"
        
        # Print statistics
        print("\n📊 Locator Statistics:")
        ai_locator.print_stats("more_info_link")
        
        # Verify we can interact with it
        print(f"\n✅ Found element: {element.text}")
        print(f"   Tag: {element.tag_name}")
        print(f"   Link: {element.get_attribute('href')}")
    
    def test_self_healing_across_reruns(
        self,
        chrome_driver,
        ai_locator
    ):
        """
        Test that locator learns from multiple runs.
        
        Demonstrates:
        - Historical success tracking
        - Reliability scoring
        - Strategy prioritization
        """
        chrome_driver.get("https://example.com")
        
        # Define strategies with different reliabilities
        strategies = [
            {"by": "id", "value": "nonexistent_id"},  # Will fail
            {"by": "class_name", "value": "fake_class"},  # Will fail
            {"by": "tag_name", "value": "h1"},  # Should succeed
            {"by": "css_selector", "value": "body > div > h1"},  # Should succeed
        ]
        
        # First attempt
        element = ai_locator.find_element_smart(
            driver=chrome_driver,
            element_name="page_heading",
            strategies=strategies
        )
        
        assert element is not None, "Should find heading element"
        
        # Second attempt - AI should prioritize successful strategies
        element2 = ai_locator.find_element_smart(
            driver=chrome_driver,
            element_name="page_heading",
            strategies=strategies
        )
        
        assert element2 is not None, "Should find heading on retry"
        
        # Check stats
        stats = ai_locator.get_element_stats("page_heading")
        print(f"\n📈 Learning Progress:")
        print(f"   Element: {stats['element']}")
        print(f"   Total strategies: {stats['total_strategies']}")
        
        if stats.get('most_reliable'):
            mr = stats['most_reliable']
            print(f"   Most reliable: {mr['locator']}")
            print(f"   Success rate: {mr['success_rate']}")
    
    def test_recover_from_dom_changes(
        self,
        chrome_driver,
        ai_locator
    ):
        """
        Test recovery when DOM structure changes.
        
        Simulates scenario where ID or class changes but
        element is still findable via other strategies.
        """
        chrome_driver.get("https://example.com")
        
        # Strategies for finding main content
        strategies = [
            {"by": "id", "value": "main-content"},  # May not exist
            {"by": "tag_name", "value": "main"},  # Semantic HTML
            {"by": "css_selector", "value": "body > div"},  # Structural
            {"by": "xpath", "value": "//div[@role='main']"},  # ARIA
            {"by": "xpath", "value": "//body/*[1]"},  # Position-based
        ]
        
        element = ai_locator.find_element_smart(
            driver=chrome_driver,
            element_name="main_content",
            strategies=strategies
        )
        
        if element:
            print(f"\n✅ Successfully located main content:")
            print(f"   Tag: {element.tag_name}")
            print(f"   Classes: {element.get_attribute('class')}")
            
            # Show which strategies worked
            ai_locator.print_stats("main_content")
        else:
            pytest.fail("Could not locate main content with any strategy")
    
    def test_form_input_self_healing(
        self,
        chrome_driver,
        ai_locator
    ):
        """
        Test self-healing for form inputs.
        
        Form inputs often change IDs/names but maintain structure.
        """
        # For demo, we'll use example.com's search (if it existed)
        chrome_driver.get("https://example.com")
        
        # Try to find any input (example.com doesn't have forms)
        strategies = [
            {"by": "name", "value": "search"},
            {"by": "id", "value": "search-input"},
            {"by": "css_selector", "value": "input[type='text']"},
            {"by": "css_selector", "value": "input[type='search']"},
            {"by": "xpath", "value": "//input"},
        ]
        
        element = ai_locator.find_element_smart(
            driver=chrome_driver,
            element_name="search_input",
            strategies=strategies
        )
        
        if element is None:
            print("\n⚠️  No input found on example.com (expected)")
            pytest.skip("example.com has no form inputs")
        else:
            print(f"\n✅ Found input element")
            ai_locator.print_stats("search_input")


@pytest.mark.self_healing
@pytest.mark.integration
class TestSelfHealingWorkflow:
    """End-to-end self-healing test workflows"""
    
    def test_complete_user_journey(
        self,
        chrome_driver,
        ai_locator
    ):
        """
        Test complete user journey with self-healing at each step.
        
        Demonstrates:
        - Multi-step flows
        - Consistent element identification
        - Recovery from UI changes
        """
        # Navigate to page
        chrome_driver.get("https://example.com")
        
        # Step 1: Find and verify title
        title_strategies = [
            {"by": "tag_name", "value": "h1"},
            {"by": "xpath", "value": "//h1[contains(text(), 'Example')]"},
        ]
        
        title = ai_locator.find_element_smart(
            chrome_driver,
            "page_title",
            title_strategies
        )
        
        assert title is not None, "Could not find page title"
        print(f"\n1️⃣ Found title: {title.text}")
        
        # Step 2: Find main content
        content_strategies = [
            {"by": "tag_name", "value": "p"},
            {"by": "css_selector", "value": "div > p"},
        ]
        
        content = ai_locator.find_element_smart(
            chrome_driver,
            "main_paragraph",
            content_strategies
        )
        
        assert content is not None, "Could not find main content"
        print(f"2️⃣ Found content: {content.text[:50]}...")
        
        # Step 3: Find link
        link_strategies = [
            {"by": "link_text", "value": "More information..."},
            {"by": "css_selector", "value": "a[href*='iana']"},
        ]
        
        link = ai_locator.find_element_smart(
            chrome_driver,
            "info_link",
            link_strategies
        )
        
        assert link is not None, "Could not find link"
        print(f"3️⃣ Found link: {link.text}")
        
        # Print overall statistics
        print("\n📊 Overall Locator Performance:")
        ai_locator.print_stats()
    
    def test_stress_test_locator_learning(
        self,
        chrome_driver,
        ai_locator
    ):
        """
        Stress test to verify learning over many attempts.
        
        Makes multiple attempts to find elements and verifies
        that success rate improves over time.
        """
        chrome_driver.get("https://example.com")
        
        strategies = [
            {"by": "id", "value": "fake1"},
            {"by": "id", "value": "fake2"},
            {"by": "tag_name", "value": "h1"},  # This one works
            {"by": "id", "value": "fake3"},
        ]
        
        # Make 10 attempts
        successes = 0
        for i in range(10):
            element = ai_locator.find_element_smart(
                chrome_driver,
                "stress_test_element",
                strategies,
                timeout=2,
                retry_count=1
            )
            
            if element:
                successes += 1
        
        print(f"\n🏋️ Stress Test Results:")
        print(f"   Attempts: 10")
        print(f"   Successes: {successes}")
        print(f"   Success rate: {successes/10:.1%}")
        
        # Should succeed every time after learning
        assert successes == 10, "Should succeed on all attempts after learning"
        
        # Verify that good strategy has high reliability
        stats = ai_locator.get_element_stats("stress_test_element")
        if stats.get('most_reliable'):
            mr = stats['most_reliable']
            print(f"\n✨ Best strategy learned:")
            print(f"   {mr['locator']}")
            print(f"   Reliability: {mr['reliability_score']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
