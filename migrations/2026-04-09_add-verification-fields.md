# Migration: Add Student Verification Fields to User Model

**Date:** 2026-04-09  
**Model:** `models/User.js`  
**Breaking:** ⚠️ YES — `isVerified` default changed from `true` → `false`

---

## Summary

Replaced the simple `isVerified` / `verifiedAt` pair with a full student verification
system. This enables two verification methods (college email & ID card upload) with an
admin-reviewable workflow.

## Schema Changes

### Modified Fields

| Field | Before | After |
|---|---|---|
| `isVerified` | `Boolean`, default `true` | `Boolean`, default **`false`** |
| `verifiedAt` | `Date` | **Removed** — replaced by `verificationApprovedAt` |

### New Fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `verificationStatus` | `String` enum | `"none"` | `"none"` · `"pending"` · `"verified"` · `"rejected"` |
| `verificationType` | `String` enum | — | `"college_email"` · `"id_card"` (optional) |
| `collegeEmail` | `String` | — | Lowercase, trimmed, sparse-unique index |
| `collegeIdUrl` | `String` | — | Cloudinary URL for uploaded college ID card |
| `verificationRejectedReason` | `String` | — | Admin-supplied reason on rejection |
| `verificationRequestedAt` | `Date` | — | Timestamp when user submitted verification |
| `verificationApprovedAt` | `Date` | — | Timestamp when admin approved (replaces old `verifiedAt`) |

### New Indexes

| Index | Type | Purpose |
|---|---|---|
| `{ collegeEmail: 1 }` | Unique + Sparse | Prevent duplicate college email claims; sparse so null values don't conflict |
| `{ verificationStatus: 1, verificationRequestedAt: -1 }` | Compound | Efficiently query pending verifications sorted by request time (admin dashboard) |

---

## Backfill Script (run once)

All existing users currently have `isVerified: true` (old default). After deploying the
schema change, run this script **once** in your MongoDB shell or via a one-off Node script
to migrate existing data:

```js
// backfill-verification.js
// Run: node scripts/backfill-verification.js
// Or in mongosh: load("backfill-verification.js")

import dbConnect from '../lib/dbConnect.js';
import User from '../models/User.js';

async function backfill() {
  await dbConnect();

  // 1. Existing users who were previously "verified" (old default true)
  //    → set verificationStatus to "verified" and stamp approvedAt
  const verifiedResult = await User.updateMany(
    { isVerified: true, verificationStatus: { $exists: false } },
    {
      $set: {
        verificationStatus: 'verified',
        verificationApprovedAt: new Date(),   // approximate; real date unknown
      },
    }
  );
  console.log(`✅  Backfilled ${verifiedResult.modifiedCount} verified users`);

  // 2. Any user missing the field entirely → ensure default "none"
  const unverifiedResult = await User.updateMany(
    { verificationStatus: { $exists: false } },
    {
      $set: {
        isVerified: false,
        verificationStatus: 'none',
      },
    }
  );
  console.log(`✅  Backfilled ${unverifiedResult.modifiedCount} unverified users`);

  // 3. Drop the old verifiedAt field from all documents
  const cleanupResult = await User.updateMany(
    { verifiedAt: { $exists: true } },
    { $unset: { verifiedAt: '' } }
  );
  console.log(`🧹  Cleaned verifiedAt from ${cleanupResult.modifiedCount} documents`);

  process.exit(0);
}

backfill().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

---

## Verification Flow (reference)

```
User registers → isVerified: false, verificationStatus: "none"
        │
        ├── Submits college email  → verificationType: "college_email"
        │                            verificationStatus: "pending"
        │                            verificationRequestedAt: now
        │
        └── Uploads ID card        → verificationType: "id_card"
                                     collegeIdUrl: "<cloudinary_url>"
                                     verificationStatus: "pending"
                                     verificationRequestedAt: now
        │
   Admin reviews
        │
        ├── Approves → isVerified: true
        │              verificationStatus: "verified"
        │              verificationApprovedAt: now
        │
        └── Rejects  → isVerified: false
                       verificationStatus: "rejected"
                       verificationRejectedReason: "..."
```

---

## Rollback

To revert, restore `isVerified` default to `true`, remove the seven new fields from the
schema, drop the two new indexes, and rename `verificationApprovedAt` back to `verifiedAt`
in existing documents.
