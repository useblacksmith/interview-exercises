const http = require('http');

function calculatePaymentRisk(payment) {
  const amountScore = payment.amountCents > 100000 ? 3 : 1;
  const countryScore = payment.country === 'US' ? 1 : 2;
  const retryScore = payment.retryCount > 0 ? 2 : 0;

  return amountScore + countryScore + retryScore;
}

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

module.exports = {
  calculatePaymentRisk,
  createServer,
};

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, () => {
    console.log(`acme payments api listening on ${port}`);
  });
}
