# Firestore Security Specification

## 1. Data Invariants
- A user document under `/users/{userId}` can only be read and written by the authenticated user whose `request.auth.uid == userId`.
- A user's history under `/users/{userId}/history/{historyId}` belongs strictly to `userId`. The `incoming().userId` must match `request.auth.uid` and `{userId}`.
- A user's morningTracker under `/users/{userId}/morningTracker/{trackerId}` belongs strictly to `userId`.
- No cross-user reads or modifications are allowed.
- Default deny catch-all for all documents.

## 2. Dirty Dozen Attack Scenarios & Mitigations
1. **Ghost / Shadow User Write**: An attacker tries to write to `/users/victimUid` while authenticated as attacker. Rejected by `isOwner(userId)`.
2. **Unauthenticated Access**: An unauthenticated user attempts to read `/users/{userId}`. Rejected by `isSignedIn()`.
3. **Cross-Tenant History Poisoning**: Attacker tries to inject spam into `/users/victimUid/history/hack1`. Rejected because `request.auth.uid != victimUid`.
4. **Spoofed User ID in Payload**: Attacker tries to create a history item under `/users/attackerUid/history/1` with `incoming().userId = victimUid`. Rejected because `incoming().userId == request.auth.uid`.
5. **Junk Long ID (Denial of Wallet)**: Document ID over 128 characters or invalid characters. Rejected by `isValidId()`.
6. **Negative Credits Injection**: Updating credits to invalid negative or arbitrary types. Validated by `isValidUserProfile()`.
7. **Pro Status Bypass**: User attempts to update `isPro` to true without valid schema constraints. Must pass validation.
8. **Unbounded History Options Array**: Attacker attempts to upload array with 1,000 items. Guarded by `data.options.size() <= 10`.
9. **History Options Type Poisoning**: Attacker passes array of numbers instead of strings. Guarded by `data.options[0] is string`.
10. **Tracker ID Poisoning**: Attacker tries writing to arbitrary invalid tracker IDs. Guarded by `isValidId(trackerId)`.
11. **Blanket Query Scraping**: Malicious client requests `collectionGroup` or `users` collection without user filter. Catch-all and collection rules only allow single-user query where `resource.data.id == request.auth.uid`.
12. **PII Exposure to Other Users**: Profile emails are not readable by other users. Restricted to `isOwner(userId)`.
