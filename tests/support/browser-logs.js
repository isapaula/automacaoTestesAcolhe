
export function registrarLogsDoNavegador(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    console.error('[BROWSER PAGE ERROR]', error.message);
  });

  page.on('requestfailed', (request) => {
    console.error('[REQUEST FAILED]', {
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText
    });
  });

  page.on('response', (response) => {
    if (
      response.url().includes('localhost:8080') &&
      response.status() >= 400
    ) {
      console.error('[API ERROR]', {
        url: response.url(),
        status: response.status()
      });
    }
  });
}
