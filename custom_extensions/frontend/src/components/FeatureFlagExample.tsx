import React from 'react';
import FeatureFlagWrapper from './FeatureFlagWrapper';

const FeatureFlagExample: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Feature Flag Examples</h2>
      
      {/* Example 1: Settings Modal */}
      <FeatureFlagWrapper featureName="settings_modal">
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold">Settings Modal</h3>
          <p>This content is only visible when the settings_modal feature is enabled.</p>
          <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Open Settings
          </button>
        </div>
      </FeatureFlagWrapper>

      {/* Example 2: Quality Tier Display */}
      <FeatureFlagWrapper featureName="quality_tier_display">
        <div className="p-4 bg-green-100 rounded-lg">
          <h3 className="font-semibold">Quality Tier Options</h3>
          <p>This content is only visible when the quality_tier_display feature is enabled.</p>
          <div className="mt-2 space-y-1">
            <label className="flex items-center">
              <input type="radio" name="quality" value="basic" className="mr-2" />
              Basic Quality
            </label>
            <label className="flex items-center">
              <input type="radio" name="quality" value="premium" className="mr-2" />
              Premium Quality
            </label>
          </div>
        </div>
      </FeatureFlagWrapper>

      {/* Example 3: AI Image Generation */}
      <FeatureFlagWrapper featureName="ai_image_generation">
        <div className="p-4 bg-purple-100 rounded-lg">
          <h3 className="font-semibold">AI Image Generation</h3>
          <p>This content is only visible when the ai_image_generation feature is enabled.</p>
          <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Generate AI Image
          </button>
        </div>
      </FeatureFlagWrapper>

      {/* Example 4: Advanced Editing */}
      <FeatureFlagWrapper featureName="advanced_editing">
        <div className="p-4 bg-orange-100 rounded-lg">
          <h3 className="font-semibold">Advanced Editing Tools</h3>
          <p>This content is only visible when the advanced_editing feature is enabled.</p>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
              Advanced Format
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
              Custom Styles
            </button>
          </div>
        </div>
      </FeatureFlagWrapper>

      {/* Example 5: Analytics Dashboard */}
      <FeatureFlagWrapper featureName="analytics_dashboard">
        <div className="p-4 bg-indigo-100 rounded-lg">
          <h3 className="font-semibold">Analytics Dashboard</h3>
          <p>This content is only visible when the analytics_dashboard feature is enabled.</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded">
              <div className="text-lg font-bold text-indigo-600">150</div>
              <div className="text-xs text-gray-600">Projects</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-lg font-bold text-indigo-600">1.2k</div>
              <div className="text-xs text-gray-600">Credits Used</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-lg font-bold text-indigo-600">85%</div>
              <div className="text-xs text-gray-600">Efficiency</div>
            </div>
          </div>
        </div>
      </FeatureFlagWrapper>

      {/* Example 6: Custom Rates */}
      <FeatureFlagWrapper featureName="custom_rates">
        <div className="p-4 bg-teal-100 rounded-lg">
          <h3 className="font-semibold">Custom Rate Settings</h3>
          <p>This content is only visible when the custom_rates feature is enabled.</p>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Custom Rate (per credit)
            </label>
            <input
              type="number"
              placeholder="Enter custom rate"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </FeatureFlagWrapper>

      {/* Example 7: Folder Management */}
      <FeatureFlagWrapper featureName="folder_management">
        <div className="p-4 bg-pink-100 rounded-lg">
          <h3 className="font-semibold">Folder Management</h3>
          <p>This content is only visible when the folder_management feature is enabled.</p>
          <div className="mt-2 space-y-1">
            <button className="w-full text-left px-2 py-1 hover:bg-pink-200 rounded">
              📁 Create New Folder
            </button>
            <button className="w-full text-left px-2 py-1 hover:bg-pink-200 rounded">
              📂 Organize Projects
            </button>
            <button className="w-full text-left px-2 py-1 hover:bg-pink-200 rounded">
              🔄 Move to Folder
            </button>
          </div>
        </div>
      </FeatureFlagWrapper>

      {/* Example 8: Bulk Operations */}
      <FeatureFlagWrapper featureName="bulk_operations">
        <div className="p-4 bg-yellow-100 rounded-lg">
          <h3 className="font-semibold">Bulk Operations</h3>
          <p>This content is only visible when the bulk_operations feature is enabled.</p>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
              Select All
            </button>
            <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
              Bulk Delete
            </button>
            <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
              Bulk Export
            </button>
          </div>
        </div>
      </FeatureFlagWrapper>

      {/* Example 9: Fallback content when feature is disabled */}
      <FeatureFlagWrapper 
        featureName="settings_modal" 
        fallback={
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-600">Settings Unavailable</h3>
            <p className="text-gray-500">Settings modal is currently disabled for your account.</p>
          </div>
        }
      >
        <div className="p-4 bg-blue-100 rounded-lg">
          <h3 className="font-semibold">Settings Modal (with fallback)</h3>
          <p>This shows the fallback when the feature is disabled.</p>
        </div>
      </FeatureFlagWrapper>

      {/* Example 10: Show content when feature is disabled */}
      <FeatureFlagWrapper 
        featureName="settings_modal" 
        showWhenDisabled={true}
      >
        <div className="p-4 bg-red-100 rounded-lg">
          <h3 className="font-semibold">Feature Disabled Notice</h3>
          <p>This content is only visible when the settings_modal feature is DISABLED.</p>
          <p className="text-sm text-red-600">Contact your administrator to enable this feature.</p>
        </div>
      </FeatureFlagWrapper>
    </div>
  );
};

export default FeatureFlagExample; 