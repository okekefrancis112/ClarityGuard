;; Safe Token Contract - Should produce minimal/no findings
;; Demonstrates best practices for Clarity smart contracts

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
)
