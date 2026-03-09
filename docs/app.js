// ── Sample contracts ─────────────────────────────────────────
const SAMPLES = {
  vulnerable: `;; Vulnerable Token Contract — intentional security issues

(define-fungible-token vuln-token)

(define-constant CONTRACT-OWNER 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-constant UNUSED-CONSTANT u999999)

(define-data-var token-name (string-ascii 32) "VulnToken")
(define-data-var total-minted uint u0)

;; TODO: Add proper access control before mainnet
;; CRITICAL: Unprotected mint function - anyone can mint tokens
(define-public (mint (amount uint) (recipient principal))
  (begin
    (try! (ft-mint? vuln-token amount recipient))
    (var-set total-minted (+ (var-get total-minted) amount))
    (ok true)
  )
)

;; CRITICAL: Unprotected burn
(define-public (admin-burn (amount uint) (target principal))
  (begin
    (ft-burn? vuln-token amount target)
  )
)

;; Uses tx-sender in assert - vulnerable to relay attacks
(define-public (transfer (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u401))
    (ft-transfer? vuln-token amount tx-sender to)
  )
)

;; Division before multiplication - precision loss
(define-public (calculate-fee (amount uint) (fee-rate uint))
  (let (
    (fee (* (/ amount u10000) fee-rate))
  )
    (ok fee)
  )
)

;; Uses block-height for time-sensitive deadline
(define-public (check-deadline (deadline uint))
  (begin
    (asserts! (< block-height deadline) (err u100))
    (ok true)
  )
)

;; Unsafe unwrap-panic
(define-public (get-balance-unsafe (who principal))
  (ok (unwrap-panic (ft-get-balance vuln-token who)))
)

;; FIXME: This function has a bug
(define-private (unused-helper (x uint))
  (+ x u1)
)

;; Unchecked external call in begin block
(define-public (dangerous-transfer (amount uint) (to principal))
  (begin
    (contract-call? .other-contract do-something amount)
    (ft-transfer? vuln-token amount tx-sender to)
  )
)

;; Missing input validation on amount
(define-public (stake (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u401))
    (ft-transfer? vuln-token amount tx-sender (as-contract tx-sender))
  )
)

;; Hardcoded principal in logic (not in constant)
(define-public (emergency-withdraw)
  (begin
    (asserts! (is-eq tx-sender 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG) (err u403))
    (as-contract (stx-transfer? u1000000 tx-sender 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG))
  )
)`,

  safe: `;; Safe Token Contract — best practices

(define-fungible-token safe-token)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INVALID-AMOUNT (err u402))

(define-data-var token-name (string-ascii 32) "SafeToken")
(define-data-var total-supply uint u0)

;; Properly protected mint with input validation
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (ft-mint? safe-token amount recipient))
    (var-set total-supply (+ (var-get total-supply) amount))
    (ok true)
  )
)

;; Safe transfer with proper checks
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq contract-caller sender) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (ft-transfer? safe-token amount sender recipient))
    (ok true)
  )
)

;; Multiplication before division (correct order)
(define-read-only (calculate-fee (amount uint) (fee-rate uint))
  (ok (/ (* amount fee-rate) u10000))
)

;; Safe unwrap with error handling
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance safe-token who))
)

;; Read-only helper is referenced
(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

;; Uses get-total-supply
(define-read-only (get-token-info)
  (ok {
    name: (var-get token-name),
    supply: (unwrap! (get-total-supply) ERR-NOT-AUTHORIZED)
  })
)`
};

// ── Detector catalog ─────────────────────────────────────────
function renderDetectors() {
  const grid = document.getElementById('detector-grid');
  if (!grid || typeof ClarityGuard === 'undefined') return;

  const detectors = ClarityGuard.getDetectorList();
  grid.innerHTML = detectors.map(function(d) {
    return '<div class="detector-card">' +
      '<div class="detector-card-header">' +
        '<span class="finding-badge badge-' + d.severity + '">' + d.severity + '</span>' +
        '<span class="detector-id">' + d.id + '</span>' +
      '</div>' +
      '<p class="detector-desc">' + escapeHtml(d.description) + '</p>' +
    '</div>';
  }).join('');
}

// ── Playground ───────────────────────────────────────────────
var codeInput = document.getElementById('code-input');
var resultsOutput = document.getElementById('results-output');

// Load initial sample
if (codeInput) codeInput.value = SAMPLES.vulnerable;

// Tab switching
document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');

    var key = tab.getAttribute('data-tab');
    if (key === 'custom') {
      codeInput.value = '';
      codeInput.placeholder = 'Paste your Clarity contract here...';
      codeInput.focus();
    } else {
      codeInput.value = SAMPLES[key] || '';
      codeInput.placeholder = '';
    }

    // Clear results
    resultsOutput.innerHTML = '<p class="results-placeholder">Click <strong>Scan</strong> to analyze the contract.</p>';
  });
});

// ── Run scan ─────────────────────────────────────────────────
function runScan() {
  var code = codeInput.value.trim();
  if (!code) {
    resultsOutput.innerHTML = '<p class="results-placeholder">Enter some Clarity code first.</p>';
    return;
  }

  var btn = document.getElementById('scan-btn');
  btn.textContent = 'Scanning...';
  btn.classList.add('scanning');

  // Use requestAnimationFrame so the UI updates before the sync analysis runs
  requestAnimationFrame(function() {
    try {
      var result = ClarityGuard.analyze(code, 'playground.clar');
      renderResults(result);
    } catch (err) {
      resultsOutput.innerHTML = '<p class="results-placeholder" style="color:var(--critical)">Parse error: ' + escapeHtml(err.message) + '</p>';
    }
    btn.textContent = 'Scan';
    btn.classList.remove('scanning');
  });
}

function renderResults(result) {
  if (result.findings.length === 0) {
    resultsOutput.innerHTML = '<div class="results-clean">&#x2705; No findings — this contract looks clean!</div>';
    return;
  }

  var html = '';

  result.findings.forEach(function(f, i) {
    html += '<div class="finding sev-' + f.severity + '">' +
      '<div class="finding-header">' +
        '<span class="finding-badge badge-' + f.severity + '">' + f.severity + '</span>' +
        '<span class="finding-title">#' + (i + 1) + ' ' + escapeHtml(f.title) + '</span>' +
      '</div>' +
      '<div class="finding-meta">Line ' + f.line + ' &middot; ' + f.detector + '</div>' +
      '<div class="finding-desc">' + escapeHtml(f.description) + '</div>' +
      (f.recommendation ? '<div class="finding-fix">Fix: ' + escapeHtml(f.recommendation) + '</div>' : '') +
    '</div>';
  });

  // Summary
  html += '<div class="results-summary">' +
    '<strong>Summary</strong> — ' + result.stats.totalFindings + ' findings from ' + result.stats.detectorsRun + ' detectors' +
    '<div class="summary-counts">';

  if (result.stats.critical > 0)
    html += '<span class="summary-count" style="color:var(--critical)">' + result.stats.critical + ' Critical</span>';
  if (result.stats.high > 0)
    html += '<span class="summary-count" style="color:var(--high)">' + result.stats.high + ' High</span>';
  if (result.stats.medium > 0)
    html += '<span class="summary-count" style="color:var(--medium)">' + result.stats.medium + ' Medium</span>';
  if (result.stats.low > 0)
    html += '<span class="summary-count" style="color:var(--low)">' + result.stats.low + ' Low</span>';
  if (result.stats.info > 0)
    html += '<span class="summary-count" style="color:var(--info)">' + result.stats.info + ' Info</span>';

  html += '</div></div>';

  resultsOutput.innerHTML = html;
}

// ── Utility ──────────────────────────────────────────────────
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function copyInstall() {
  var text = document.getElementById('install-cmd').textContent;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.querySelector('.copy-btn');
    btn.textContent = '\u2713';
    setTimeout(function() { btn.innerHTML = '&#x2398;'; }, 1500);
  });
}

// ── Init ─────────────────────────────────────────────────────
renderDetectors();
