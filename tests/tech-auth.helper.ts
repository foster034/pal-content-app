import { Page } from '@playwright/test';

export class TechAuthHelper {
  constructor(private page: Page) {}

  /**
   * Login as a tech user using login code
   */
  async loginAsTech(loginCode: string = 'TEMP01') {
    // Navigate to tech auth page
    await this.page.goto('/tech-auth');

    // Wait for the login form to load
    await this.page.waitForSelector('input[id="loginCode"]');

    // Fill in the login code
    await this.page.fill('input[id="loginCode"]', loginCode);

    // Click login button
    await this.page.click('button[type="submit"]');

    // Wait for successful login redirect
    await this.page.waitForURL('/tech/dashboard');

    // Verify we're logged in by checking for tech session in localStorage
    const techSession = await this.page.evaluate(() => {
      return localStorage.getItem('tech_session');
    });

    if (!techSession) {
      throw new Error('Tech session not found after login');
    }

    return JSON.parse(techSession);
  }

  /**
   * Check if tech user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const techSession = await this.page.evaluate(() => {
      const sessionData = localStorage.getItem('tech_session');
      if (!sessionData) return false;

      try {
        const session = JSON.parse(sessionData);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24;
      } catch {
        return false;
      }
    });

    return techSession;
  }

  /**
   * Logout the tech user
   */
  async logout() {
    await this.page.evaluate(() => {
      localStorage.removeItem('tech_session');
      document.cookie = 'tech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
  }

  /**
   * Get the current tech session data
   */
  async getTechSession() {
    return await this.page.evaluate(() => {
      const sessionData = localStorage.getItem('tech_session');
      return sessionData ? JSON.parse(sessionData) : null;
    });
  }

  /**
   * Wait for tech authentication to complete
   */
  async waitForAuthenticationComplete() {
    await this.page.waitForFunction(() => {
      const sessionData = localStorage.getItem('tech_session');
      return sessionData !== null;
    }, { timeout: 10000 });
  }
}