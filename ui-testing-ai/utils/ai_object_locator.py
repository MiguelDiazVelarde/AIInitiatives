"""
AI Object Locator - Self-Healing Test Implementation
Based on ISTQB CT-AI 11.6.1

This module implements AI-based object identification that learns
which locator strategies are most stable over time.
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (
    NoSuchElementException,
    StaleElementReferenceException,
    TimeoutException
)


@dataclass
class LocatorStrategy:
    """Represents a single locator strategy"""
    by: str
    value: str
    success_count: int = 0
    failure_count: int = 0
    avg_response_time: float = 0.0
    last_used: float = 0.0
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate"""
        total = self.success_count + self.failure_count
        return self.success_count / total if total > 0 else 0.5
    
    @property
    def reliability_score(self) -> float:
        """
        Calculate overall reliability score considering:
        - Success rate (70%)
        - Response time (20%)
        - Recency (10%)
        """
        time_score = 1.0 / (1.0 + self.avg_response_time)
        recency_score = 1.0 if self.last_used == 0 else 1.0 / (1.0 + (time.time() - self.last_used) / 86400)
        
        return (
            self.success_rate * 0.7 +
            time_score * 0.2 +
            recency_score * 0.1
        )


class AIObjectLocator:
    """
    Intelligent object locator that uses multiple strategies
    and learns which ones are most reliable.
    
    Implements self-healing test concepts from ISTQB CT-AI 11.6.1:
    - Uses multiple locator criteria (XPath, ID, class, coordinates)
    - Learns historically most stable identification criteria
    - Adapts to UI changes automatically
    """
    
    def __init__(self, history_file: str = "config/locator_history.json"):
        """
        Initialize AI Object Locator
        
        Args:
            history_file: Path to JSON file storing locator history
        """
        self.history_file = Path(history_file)
        self.locator_history: Dict[str, List[Dict]] = {}
        self._load_history()
    
    def find_element_smart(
        self,
        driver: WebDriver,
        element_name: str,
        strategies: List[Dict[str, str]],
        timeout: int = 10,
        retry_count: int = 3
    ) -> Optional[WebElement]:
        """
        Find element using multiple strategies with AI-based prioritization.
        
        This method:
        1. Sorts strategies by historical reliability
        2. Tries each strategy until one succeeds
        3. Updates history based on results
        4. Retries on transient failures
        
        Args:
            driver: Selenium WebDriver instance
            element_name: Unique identifier for this element
            strategies: List of locator strategies to try
            timeout: Maximum time to wait for element
            retry_count: Number of retries for transient failures
            
        Returns:
            WebElement if found, None otherwise
            
        Example:
            >>> locator = AIObjectLocator()
            >>> strategies = [
            ...     {"by": "id", "value": "login-btn"},
            ...     {"by": "css_selector", "value": ".btn-login"},
            ...     {"by": "xpath", "value": "//button[text()='Login']"}
            ... ]
            >>> element = locator.find_element_smart(driver, "login_button", strategies)
        """
        # Convert strategies to LocatorStrategy objects
        strategy_objects = self._prepare_strategies(element_name, strategies)
        
        # Sort by reliability score
        strategy_objects.sort(key=lambda s: s.reliability_score, reverse=True)
        
        element = None
        successful_strategy = None
        
        for attempt in range(retry_count):
            for strategy in strategy_objects:
                try:
                    start_time = time.time()
                    
                    # Convert string 'by' to By constant
                    by_constant = self._get_by_constant(strategy.by)
                    
                    # Try to find element
                    element = driver.find_element(by_constant, strategy.value)
                    
                    # Verify element is actually interactable
                    if element.is_displayed() and element.is_enabled():
                        elapsed_time = time.time() - start_time
                        self._record_success(element_name, strategy, elapsed_time)
                        successful_strategy = strategy
                        break
                    
                except (NoSuchElementException, StaleElementReferenceException) as e:
                    self._record_failure(element_name, strategy)
                    continue
                except Exception as e:
                    print(f"Unexpected error with strategy {strategy.by}={strategy.value}: {e}")
                    self._record_failure(element_name, strategy)
                    continue
            
            if element:
                break
            
            # Wait before retry
            if attempt < retry_count - 1:
                time.sleep(1)
        
        # Save history after each search
        self._save_history()
        
        if not element:
            print(f"❌ Failed to find element '{element_name}' after {retry_count} attempts")
            print(f"   Tried {len(strategy_objects)} strategies")
        
        return element
    
    def _prepare_strategies(
        self,
        element_name: str,
        strategies: List[Dict[str, str]]
    ) -> List[LocatorStrategy]:
        """Convert dict strategies to LocatorStrategy objects with history"""
        strategy_objects = []
        
        # Load history for this element
        element_history = self.locator_history.get(element_name, [])
        
        for strategy_dict in strategies:
            # Find matching history
            matching_history = next(
                (h for h in element_history 
                 if h['by'] == strategy_dict['by'] and h['value'] == strategy_dict['value']),
                None
            )
            
            if matching_history:
                strategy = LocatorStrategy(**matching_history)
            else:
                strategy = LocatorStrategy(
                    by=strategy_dict['by'],
                    value=strategy_dict['value']
                )
            
            strategy_objects.append(strategy)
        
        return strategy_objects
    
    def _get_by_constant(self, by_string: str):
        """Convert string to Selenium By constant"""
        mapping = {
            'id': By.ID,
            'name': By.NAME,
            'xpath': By.XPATH,
            'css_selector': By.CSS_SELECTOR,
            'class_name': By.CLASS_NAME,
            'tag_name': By.TAG_NAME,
            'link_text': By.LINK_TEXT,
            'partial_link_text': By.PARTIAL_LINK_TEXT
        }
        return mapping.get(by_string.lower(), By.CSS_SELECTOR)
    
    def _record_success(
        self,
        element_name: str,
        strategy: LocatorStrategy,
        elapsed_time: float
    ):
        """Record successful element location"""
        strategy.success_count += 1
        strategy.last_used = time.time()
        
        # Update average response time
        total_attempts = strategy.success_count + strategy.failure_count
        strategy.avg_response_time = (
            (strategy.avg_response_time * (total_attempts - 1) + elapsed_time) / total_attempts
        )
        
        self._update_history(element_name, strategy)
    
    def _record_failure(self, element_name: str, strategy: LocatorStrategy):
        """Record failed element location attempt"""
        strategy.failure_count += 1
        self._update_history(element_name, strategy)
    
    def _update_history(self, element_name: str, strategy: LocatorStrategy):
        """Update history for an element's strategy"""
        if element_name not in self.locator_history:
            self.locator_history[element_name] = []
        
        # Find and update existing strategy or add new one
        existing = next(
            (i for i, s in enumerate(self.locator_history[element_name])
             if s['by'] == strategy.by and s['value'] == strategy.value),
            None
        )
        
        strategy_dict = asdict(strategy)
        
        if existing is not None:
            self.locator_history[element_name][existing] = strategy_dict
        else:
            self.locator_history[element_name].append(strategy_dict)
    
    def _load_history(self):
        """Load locator history from file"""
        if self.history_file.exists():
            try:
                with open(self.history_file, 'r') as f:
                    self.locator_history = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load history file: {e}")
                self.locator_history = {}
        else:
            self.locator_history = {}
    
    def _save_history(self):
        """Save locator history to file"""
        try:
            self.history_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.history_file, 'w') as f:
                json.dump(self.locator_history, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save history file: {e}")
    
    def get_element_stats(self, element_name: str) -> Dict:
        """Get statistics for a specific element's locators"""
        if element_name not in self.locator_history:
            return {"error": f"No history found for element '{element_name}'"}
        
        strategies = [LocatorStrategy(**s) for s in self.locator_history[element_name]]
        strategies.sort(key=lambda s: s.reliability_score, reverse=True)
        
        return {
            "element": element_name,
            "total_strategies": len(strategies),
            "most_reliable": {
                "locator": f"{strategies[0].by}={strategies[0].value}",
                "success_rate": f"{strategies[0].success_rate:.2%}",
                "reliability_score": f"{strategies[0].reliability_score:.3f}"
            } if strategies else None,
            "all_strategies": [
                {
                    "locator": f"{s.by}={s.value}",
                    "success_rate": f"{s.success_rate:.2%}",
                    "avg_time": f"{s.avg_response_time:.3f}s",
                    "reliability": f"{s.reliability_score:.3f}"
                }
                for s in strategies
            ]
        }
    
    def print_stats(self, element_name: Optional[str] = None):
        """Print statistics in readable format"""
        if element_name:
            stats = self.get_element_stats(element_name)
            print(f"\n📊 Stats for '{stats.get('element', element_name)}'")
            print(f"   Total strategies: {stats.get('total_strategies', 0)}")
            
            if stats.get('most_reliable'):
                mr = stats['most_reliable']
                print(f"   ✨ Most reliable: {mr['locator']}")
                print(f"      Success rate: {mr['success_rate']}")
                print(f"      Reliability: {mr['reliability_score']}")
        else:
            print("\n📊 All Element Statistics:")
            for elem_name in self.locator_history.keys():
                stats = self.get_element_stats(elem_name)
                if stats.get('most_reliable'):
                    mr = stats['most_reliable']
                    print(f"\n   {elem_name}:")
                    print(f"   └─ {mr['locator']} ({mr['success_rate']})")
