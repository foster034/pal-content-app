const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--disable-web-security'
    ]
  });

  const context = await browser.newContext({
    permissions: ['camera', 'microphone'],
    extraHTTPHeaders: {
      'Feature-Policy': 'camera *; microphone *'
    }
  });

  const page = await context.newPage();

  // Mock MediaDevices API for better testing
  await page.addInitScript(() => {
    // Mock getUserMedia with a fake video stream
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      console.log('Mock getUserMedia called with constraints:', constraints);

      // Create a fake video stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      // Draw something on the canvas to simulate camera feed
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = 'white';
      ctx.font = '48px Arial';
      ctx.fillText('FAKE CAMERA', 150, 240);

      const stream = canvas.captureStream(30);
      return stream;
    };

    // Mock enumerateDevices to return fake cameras
    const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
    navigator.mediaDevices.enumerateDevices = async () => {
      console.log('Mock enumerateDevices called');
      return [
        {
          deviceId: 'fake-camera-1',
          groupId: 'fake-group-1',
          kind: 'videoinput',
          label: 'Fake Camera 1 (Front)'
        },
        {
          deviceId: 'fake-camera-2',
          groupId: 'fake-group-2',
          kind: 'videoinput',
          label: 'Fake Camera 2 (Back)'
        }
      ];
    };
  });

  // Set up console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });

  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });

  try {
    // Go to login
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/auth/login');

    // Login with demo credentials
    console.log('Logging in...');
    await page.fill('input[type="email"]', 'admin@test.ca');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for redirect and go to tech dashboard
    await page.waitForTimeout(2000);
    console.log('Going to tech dashboard...');
    await page.goto('http://localhost:3000/tech/dashboard');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Click the "Submit New Content" button to open the form
    console.log('Opening content form...');
    await page.click('button:has-text("Submit New Content")');

    // Wait for form modal to appear
    await page.waitForSelector('.overflow-y-auto', { timeout: 5000 });
    console.log('Form modal opened');

    // Fill basic form to get to photo section - use value-based selectors
    await page.waitForSelector('select', { timeout: 5000 });
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('Residential');
    console.log('Selected category: Residential');

    await page.waitForTimeout(500);

    const serviceSelect = page.locator('select').nth(1);
    await serviceSelect.selectOption('Home Lockout');
    console.log('Selected service: Home Lockout');

    // Click the "Take Photo" button to open camera
    console.log('Clicking Take Photo button...');
    await page.click('button:has-text("Take Photo")');

    // Wait for camera modal to appear
    await page.waitForTimeout(2000);

    console.log('Camera modal should be open now...');

    // Check if camera video element exists
    const videoElement = await page.locator('#photoCameraVideo');
    const videoExists = await videoElement.count() > 0;
    console.log('Video element exists:', videoExists);

    if (videoExists) {
      console.log('Video element found, waiting for video to load...');
      await page.waitForTimeout(3000);

      // Check for camera flip button
      const flipButton = page.locator('button[title*="Switch Camera"]');
      const flipButtonExists = await flipButton.count() > 0;
      console.log('Camera flip button exists:', flipButtonExists);

      if (flipButtonExists) {
        console.log('Testing camera flip functionality...');
        await flipButton.click({ force: true });
        console.log('Clicked camera flip button');
        await page.waitForTimeout(2000);
      }

      // Try to capture a photo
      console.log('Attempting to capture photo...');
      const captureButton = page.locator('button[title="Take Photo"]');
      const captureButtonExists = await captureButton.count() > 0;
      console.log('Capture button exists:', captureButtonExists);

      if (captureButtonExists) {
        await captureButton.click({ force: true });
        console.log('Clicked capture button');
        await page.waitForTimeout(1000);
      }

      // Try to close the camera
      console.log('Attempting to close camera...');
      const closeButton = page.locator('button:has-text("×")').first();
      const closeButtonExists = await closeButton.count() > 0;
      console.log('Close button exists:', closeButtonExists);

      if (closeButtonExists) {
        await closeButton.click();
        console.log('Clicked close button');
        await page.waitForTimeout(1000);
      }

      // Alternative close button (cancel button)
      const cancelButton = page.locator('button[title="Cancel"]');
      const cancelButtonExists = await cancelButton.count() > 0;
      console.log('Cancel button exists:', cancelButtonExists);

      if (cancelButtonExists) {
        await cancelButton.click();
        console.log('Clicked cancel button');
        await page.waitForTimeout(1000);
      }
    }

    // Check final state
    const cameraStillOpen = await page.locator('#photoCameraVideo').count() > 0;
    console.log('Camera still open after attempts to close:', cameraStillOpen);

    // Keep browser open for inspection
    console.log('Test completed. Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
})();