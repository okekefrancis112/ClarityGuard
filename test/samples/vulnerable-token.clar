;; Vulnerable Token Contract - For ClarityGuard Testing
;; This contract intentionally contains security issues

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
)
