<?php
/**
 * Nextcloud File Selection JavaScript Injection
 * 
 * This file injects custom JavaScript for file selection communication
 * when Nextcloud is loaded in iframe for file selection purposes.
 * 
 * Place this file in your Nextcloud installation and include it in 
 * the main template or as a custom app.
 */

// Only inject when in file selection mode
if (isset($_GET['fileSelection']) && $_GET['fileSelection'] === 'true') {
    // Add custom JavaScript to the page
    $script = <<<'EOD'
<script>
/**
 * Nextcloud File Selection Communication
 * Custom JavaScript to enable file selection communication from Nextcloud iframe
 * to parent application for the "Create from files and connectors" page.
 */
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        ALLOWED_REFERRERS: ['/custom-projects-ui/create/from-files/specific'],
        TARGET_ORIGIN: null,
        DEBOUNCE_DELAY: 300
    };

    let selectedFiles = new Set();
    let isActive = false;
    let debounceTimer = null;

    function init() {
        if (!shouldActivate()) {
            return;
        }

        console.log('[Nextcloud FileSelection] Initializing file selection communication');
        isActive = true;
        CONFIG.TARGET_ORIGIN = getParentOrigin();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupFileSelectionListeners);
        } else {
            setupFileSelectionListeners();
        }

        setupParentCommunication();
    }

    function shouldActivate() {
        const urlParams = new URLSearchParams(window.location.search);
        const isFileSelectionMode = urlParams.get('fileSelection') === 'true';
        
        if (!isFileSelectionMode) return false;

        const referrer = document.referrer;
        return CONFIG.ALLOWED_REFERRERS.some(path => referrer.includes(path));
    }

    function getParentOrigin() {
        try {
            return window.parent.location.origin;
        } catch (e) {
            const referrer = document.referrer;
            if (referrer) {
                const url = new URL(referrer);
                return url.origin;
            }
            return window.location.origin;
        }
    }

    function setupFileSelectionListeners() {
        setupFileListClickListeners();
        setupFileTableSelectionListeners();
        setupKeyboardSelectionListeners();
        setupDOMObserver();
    }

    function setupFileListClickListeners() {
        const fileListContainer = document.querySelector('#app-content-files, #filestable, .files-fileList');
        
        if (fileListContainer) {
            fileListContainer.addEventListener('click', handleFileClick, true);
            console.log('[Nextcloud FileSelection] File list click listeners setup');
        } else {
            setTimeout(setupFileListClickListeners, 1000);
        }
    }

    function handleFileClick(event) {
        const target = event.target;
        const fileRow = target.closest('tr[data-file], .file-entry, [data-entryname]');
        
        if (!fileRow) return;

        const fileName = getFileName(fileRow);
        const filePath = getFilePath(fileRow);
        
        if (!fileName || !filePath) return;

        const isCtrlKey = event.ctrlKey || event.metaKey;
        const isShiftKey = event.shiftKey;

        if (isCtrlKey) {
            toggleFileSelection(filePath, fileName);
        } else if (!isShiftKey) {
            clearAllSelections();
            toggleFileSelection(filePath, fileName);
        }

        if (selectedFiles.has(filePath)) {
            event.preventDefault();
        }
    }

    function setupFileTableSelectionListeners() {
        document.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox' && event.target.closest('tr[data-file]')) {
                const fileRow = event.target.closest('tr[data-file]');
                const fileName = getFileName(fileRow);
                const filePath = getFilePath(fileRow);
                
                if (fileName && filePath) {
                    if (event.target.checked) {
                        addFileSelection(filePath, fileName);
                    } else {
                        removeFileSelection(filePath);
                    }
                }
            }
        }, true);
    }

    function setupKeyboardSelectionListeners() {
        document.addEventListener('keydown', function(event) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
                const fileRows = document.querySelectorAll('tr[data-file], .file-entry, [data-entryname]');
                fileRows.forEach(row => {
                    const fileName = getFileName(row);
                    const filePath = getFilePath(row);
                    if (fileName && filePath) {
                        addFileSelection(filePath, fileName);
                    }
                });
                event.preventDefault();
            }
            
            if (event.key === 'Escape') {
                clearAllSelections();
            }
        });
    }

    function setupDOMObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches && (node.matches('tr[data-file]') || node.querySelector('tr[data-file]'))) {
                            setTimeout(setupFileSelectionListeners, 100);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function getFileName(fileRow) {
        const selectors = [
            '[data-file]',
            '.filename .nametext',
            '.filename .innernametext', 
            '.name .nametext',
            '[data-entryname]'
        ];

        for (const selector of selectors) {
            const element = fileRow.matches(selector) ? fileRow : fileRow.querySelector(selector);
            if (element) {
                return element.getAttribute('data-file') || 
                       element.getAttribute('data-entryname') ||
                       element.textContent?.trim();
            }
        }

        return null;
    }

    function getFilePath(fileRow) {
        const fileName = getFileName(fileRow);
        if (!fileName) return null;

        const currentPath = getCurrentPath();
        
        if (currentPath && currentPath !== '/') {
            return currentPath + '/' + fileName;
        }
        
        return '/' + fileName;
    }

    function getCurrentPath() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPath = urlParams.get('dir');
        if (urlPath) return urlPath;

        const breadcrumb = document.querySelector('#controls .breadcrumb');
        if (breadcrumb) {
            const pathElements = breadcrumb.querySelectorAll('a');
            if (pathElements.length > 0) {
                const lastElement = pathElements[pathElements.length - 1];
                return lastElement.getAttribute('href')?.split('dir=')[1] || '/';
            }
        }

        return '/';
    }

    function addFileSelection(filePath, fileName) {
        selectedFiles.add(filePath);
        updateFileVisualSelection(filePath, true);
        notifyParentOfSelection();
        
        console.log('[Nextcloud FileSelection] Added file:', filePath);
    }

    function removeFileSelection(filePath) {
        selectedFiles.delete(filePath);
        updateFileVisualSelection(filePath, false);
        notifyParentOfSelection();
        
        console.log('[Nextcloud FileSelection] Removed file:', filePath);
    }

    function toggleFileSelection(filePath, fileName) {
        if (selectedFiles.has(filePath)) {
            removeFileSelection(filePath);
        } else {
            addFileSelection(filePath, fileName);
        }
    }

    function clearAllSelections() {
        const previouslySelected = Array.from(selectedFiles);
        selectedFiles.clear();
        
        previouslySelected.forEach(filePath => {
            updateFileVisualSelection(filePath, false);
        });
        
        notifyParentOfSelection();
        console.log('[Nextcloud FileSelection] Cleared all selections');
    }

    function updateFileVisualSelection(filePath, isSelected) {
        const fileName = filePath.split('/').pop();
        const fileRows = document.querySelectorAll(`tr[data-file="${fileName}"], [data-entryname="${fileName}"]`);
        
        fileRows.forEach(row => {
            if (isSelected) {
                row.classList.add('selected', 'fileselection-selected');
                row.style.backgroundColor = '#e3f2fd';
            } else {
                row.classList.remove('selected', 'fileselection-selected');
                row.style.backgroundColor = '';
            }
        });
    }

    function notifyParentOfSelection() {
        if (!isActive || !CONFIG.TARGET_ORIGIN) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const selectedFilesArray = Array.from(selectedFiles);
            
            try {
                window.parent.postMessage({
                    type: 'fileSelectionUpdate',
                    data: {
                        selectedFiles: selectedFilesArray,
                        selectionCount: selectedFilesArray.length
                    }
                }, CONFIG.TARGET_ORIGIN);
                
                console.log('[Nextcloud FileSelection] Notified parent of selection:', selectedFilesArray.length, 'files');
            } catch (error) {
                console.error('[Nextcloud FileSelection] Error sending postMessage:', error);
            }
        }, CONFIG.DEBOUNCE_DELAY);
    }

    function setupParentCommunication() {
        window.addEventListener('message', function(event) {
            if (event.origin !== CONFIG.TARGET_ORIGIN) {
                return;
            }

            const { type, data } = event.data;

            switch (type) {
                case 'clearFileSelection':
                    clearAllSelections();
                    break;
                
                case 'getFileSelection':
                    notifyParentOfSelection();
                    break;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add custom CSS for visual feedback
    const style = document.createElement('style');
    style.textContent = `
        .fileselection-selected {
            background-color: #e3f2fd !important;
            border-left: 3px solid #2196f3 !important;
        }
        
        .fileselection-selected:hover {
            background-color: #bbdefb !important;
        }
        
        .fileselection-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #2196f3;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            display: none;
        }
        
        .fileselection-indicator.show {
            display: block;
        }
    `;
    document.head.appendChild(style);

    // Add selection indicator
    const indicator = document.createElement('div');
    indicator.className = 'fileselection-indicator';
    indicator.textContent = 'File Selection Mode Active';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.classList.add('show'), 1000);

})();
</script>
EOD;

    echo $script;
}
?> 