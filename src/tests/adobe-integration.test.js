import analytics from '../services/analytics';

// Mock window.adobeDataLayer
const mockDataLayer = [];
Object.defineProperty(window, 'adobeDataLayer', {
  value: mockDataLayer,
  writable: true,
});

describe('Adobe Data Layer Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the mock data layer
    mockDataLayer.length = 0;
  });

  describe('User Authentication Tracking', () => {
    test('trackUserLogin pushes user info to data layer', () => {
      const user = {
        sub: 'auth0|1234567890abcdef',
        name: 'John Doe',
        email: 'john@example.com',
      };

      analytics.trackUserLogin(user);

      expect(mockDataLayer.length).toBeGreaterThan(0);
      
      // Check for userInfo entry
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      expect(userInfoEntry).toBeDefined();
      expect(userInfoEntry.userInfo.userId).toBe('1234567890abcdef');
      expect(userInfoEntry.userInfo.status).toBe('authenticated');
      expect(userInfoEntry.userInfo.userType).toBe('registered');
    });

    test('trackUserLogout pushes logout info to data layer', () => {
      analytics.trackUserLogout();

      expect(mockDataLayer.length).toBeGreaterThan(0);
      
      // Check for userInfo entry
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      expect(userInfoEntry).toBeDefined();
      expect(userInfoEntry.userInfo.userId).toBe(null);
      expect(userInfoEntry.userInfo.status).toBe('anonymous');
      expect(userInfoEntry.userInfo.userType).toBe('guest');
    });

    test('trackUserProfileUpdate pushes profile update to data layer', () => {
      const userData = {
        sub: 'auth0|1234567890abcdef',
        name: 'John Doe Updated',
        email: 'john.updated@example.com',
        phone: '+1234567890',
      };

      analytics.trackUserProfileUpdate(userData);

      expect(mockDataLayer.length).toBeGreaterThan(0);
      
      // Check for userInfo entry
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      expect(userInfoEntry).toBeDefined();
      expect(userInfoEntry.userInfo.userId).toBe('1234567890abcdef');
      expect(userInfoEntry.userInfo.status).toBe('authenticated');
    });
  });

  describe('User ID Generation', () => {
    test('generates alphanumeric user ID from Auth0 sub', () => {
      const user = { sub: 'auth0|1234567890abcdef' };
      analytics.trackUserLogin(user);
      
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      expect(userInfoEntry.userInfo.userId).toBe('1234567890abcdef');
    });

    test('handles malformed sub gracefully', () => {
      const user = { sub: 'invalid-format' };
      analytics.trackUserLogin(user);
      
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      expect(userInfoEntry.userInfo.userId).toBe('invalidformat');
    });

    test('handles missing sub gracefully', () => {
      const user = { name: 'John Doe' };
      analytics.trackUserLogin(user);
      
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      expect(userInfoEntry.userInfo.userId).toBe(null);
    });
  });

  describe('Analytics Helper Functions', () => {
    test('getCurrentUserInfo returns user info from data layer', () => {
      const user = { sub: 'auth0|1234567890abcdef' };
      analytics.trackUserLogin(user);
      
      const userInfo = analytics.getCurrentUserInfo();
      expect(userInfo).toBeDefined();
      expect(userInfo.userId).toBe('1234567890abcdef');
      expect(userInfo.status).toBe('authenticated');
    });

    test('getCurrentUserInfo returns null when no user info', () => {
      // Clear data layer
      mockDataLayer.length = 0;
      
      const userInfo = analytics.getCurrentUserInfo();
      expect(userInfo).toBeNull();
    });
  });

  describe('Data Layer Structure', () => {
    test('userInfo object has correct structure', () => {
      const user = {
        sub: 'auth0|1234567890abcdef',
        name: 'John Doe',
        email: 'john@example.com',
      };

      analytics.trackUserLogin(user);
      
      const userInfoEntry = mockDataLayer.find(entry => entry.userInfo);
      const userInfo = userInfoEntry.userInfo;
      
      expect(userInfo).toHaveProperty('userId');
      expect(userInfo).toHaveProperty('status');
      expect(userInfo).toHaveProperty('timestamp');
      expect(userInfo).toHaveProperty('userType');
      expect(userInfo).toHaveProperty('loginMethod');
      
      expect(typeof userInfo.userId).toBe('string');
      expect(typeof userInfo.status).toBe('string');
      expect(typeof userInfo.timestamp).toBe('string');
      expect(typeof userInfo.userType).toBe('string');
      expect(typeof userInfo.loginMethod).toBe('string');
    });

    test('events have correct structure', () => {
      const user = { sub: 'auth0|1234567890abcdef' };
      analytics.trackUserLogin(user);
      
      const eventEntry = mockDataLayer.find(entry => entry.event === 'userLogin');
      expect(eventEntry).toBeDefined();
      expect(eventEntry).toHaveProperty('event');
      expect(eventEntry).toHaveProperty('pageInfo');
      expect(eventEntry).toHaveProperty('user');
    });
  });
});
