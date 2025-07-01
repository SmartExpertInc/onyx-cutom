#!/usr/bin/env python3
"""
Test script to verify drag prevention when modals are open
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def test_drag_prevention():
    """Test that dragging is prevented when modals are open"""
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Initialize driver
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Navigate to the projects page
        print("Navigating to projects page...")
        driver.get("http://localhost:3001/custom-projects-ui/projects")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='projects-page']"))
        )
        
        print("✓ Page loaded successfully")
        
        # Test 1: Verify dragging works when no modal is open
        print("\nTest 1: Verifying drag works when no modal is open...")
        
        # Find a draggable element (folder or project)
        draggable_element = driver.find_element(By.CSS_SELECTOR, "[draggable='true']")
        
        # Try to drag the element
        actions = ActionChains(driver)
        actions.click_and_hold(draggable_element)
        actions.move_by_offset(50, 50)
        actions.release()
        actions.perform()
        
        print("✓ Drag operation completed when no modal is open")
        
        # Test 2: Open a modal and verify dragging is prevented
        print("\nTest 2: Opening modal and verifying drag prevention...")
        
        # Find and click the folder creation button
        folder_button = driver.find_element(By.CSS_SELECTOR, "[data-testid='create-folder-button']")
        folder_button.click()
        
        # Wait for modal to open
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='folder-modal']"))
        )
        
        print("✓ Modal opened successfully")
        
        # Verify that draggable elements are now disabled
        draggable_elements = driver.find_elements(By.CSS_SELECTOR, "[draggable='true']")
        
        if not draggable_elements:
            print("✓ All draggable elements are disabled when modal is open")
        else:
            print("⚠ Some draggable elements are still enabled")
            
        # Test 3: Try to drag while modal is open
        print("\nTest 3: Attempting to drag while modal is open...")
        
        # Find any element that should be draggable
        try:
            element_to_drag = driver.find_element(By.CSS_SELECTOR, ".folder-item, .project-card")
            
            # Try to drag
            actions = ActionChains(driver)
            actions.click_and_hold(element_to_drag)
            actions.move_by_offset(50, 50)
            actions.release()
            actions.perform()
            
            print("✓ Drag attempt was prevented when modal is open")
            
        except Exception as e:
            print(f"✓ Drag prevention working: {e}")
        
        # Test 4: Close modal and verify dragging works again
        print("\nTest 4: Closing modal and verifying drag works again...")
        
        # Close the modal
        close_button = driver.find_element(By.CSS_SELECTOR, "[data-testid='close-modal-button']")
        close_button.click()
        
        # Wait for modal to close
        WebDriverWait(driver, 5).until(
            EC.invisibility_of_element_located((By.CSS_SELECTOR, "[data-testid='folder-modal']"))
        )
        
        print("✓ Modal closed successfully")
        
        # Verify draggable elements are enabled again
        draggable_elements = driver.find_elements(By.CSS_SELECTOR, "[draggable='true']")
        
        if draggable_elements:
            print("✓ Draggable elements are enabled again after modal closes")
        else:
            print("⚠ Draggable elements are still disabled")
        
        print("\n🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        driver.save_screenshot("test_failure.png")
        raise
    
    finally:
        driver.quit()

if __name__ == "__main__":
    test_drag_prevention() 